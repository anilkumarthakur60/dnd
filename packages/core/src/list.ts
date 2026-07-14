import { register, unregister, normalizeGroup } from './registry'
import type { RegisteredList } from './registry'
import { beginDrag, isDragging } from './drag'
import type { SourceItem } from './drag'
import { announce } from './live-region'
import type {
  DndAxis,
  DndDirection,
  DndListOptions,
  GhostFactory,
  ListAdapter,
  ListChange,
} from './types'

interface ResolvedDefaults {
  sort: boolean
  disabled: boolean
  animation: number
  easing: string
  preventOnFilter: boolean
  selectedClass: string
  delay: number
  delayOnTouchOnly: boolean
  touchStartThreshold: number
  dragThreshold: number
  axis: DndAxis
  direction: DndDirection
  swap: boolean
  swapThreshold: number
  invertSwap: boolean
  revertOnSpill: boolean
  removeOnSpill: boolean
  revertClone: boolean
  scrollSpeed: number
  scrollSensitivity: number
  scrollDisabled: boolean
  emptyInsertThreshold: number
  dragMaxItems: number
  multiDrag: boolean
  keyboard: boolean
}

const DEFAULTS: ResolvedDefaults = {
  sort: true,
  disabled: false,
  animation: 200,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  preventOnFilter: true,
  selectedClass: 'dnd-selected',
  delay: 0,
  delayOnTouchOnly: true,
  touchStartThreshold: 5,
  dragThreshold: 5,
  axis: null,
  direction: 'auto',
  swap: false,
  swapThreshold: 1,
  invertSwap: false,
  revertOnSpill: false,
  removeOnSpill: false,
  revertClone: false,
  scrollSpeed: 18,
  scrollSensitivity: 48,
  scrollDisabled: false,
  emptyInsertThreshold: 5,
  dragMaxItems: 0,
  multiDrag: false,
  keyboard: false,
}

type Resolved<T> = DndListOptions<T> & ResolvedDefaults

function withDefaults<T>(options: DndListOptions<T>): Resolved<T> {
  const merged: Record<string, unknown> = { ...DEFAULTS }
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) merged[key] = value
  }
  return merged as unknown as Resolved<T>
}

interface FoundItem {
  el: HTMLElement
  index: number
}

let listUid = 0

/**
 * The framework-agnostic list controller. Attach it to a container element
 * whose draggable children carry `data-dnd-index`, give it a
 * {@link ListAdapter} over your state, and it handles the entire interaction:
 * pointer drags (with delay, handle, filter and threshold), cross-list groups,
 * multi-drag selection, keyboard reordering with screen-reader announcements,
 * and the programmatic API.
 *
 * Framework bindings are thin wrappers around this class; `createSortable`
 * pairs it with a DOM adapter for vanilla usage.
 */
export class DndList<T = unknown> {
  readonly el: HTMLElement

  private opts: Resolved<T>
  private readonly adapter: ListAdapter<T>
  private entry: RegisteredList
  /** Ungrouped lists stay isolated — each gets its own private group name. */
  private readonly fallbackGroup = `__dnd-list-${++listUid}`
  private selection = new Set<number>()
  private kbIndex: number | null = null
  private kbOrigin: number | null = null
  private pendingDelay: { timer: number; cleanup: () => void } | null = null
  private chosenEl: HTMLElement | null = null

  constructor(el: HTMLElement, options: DndListOptions<T>, adapter: ListAdapter<T>) {
    this.el = el
    this.adapter = adapter
    this.opts = withDefaults(options)
    this.entry = register({
      el,
      group: this.resolveGroup(),
      disabled: () => this.opts.disabled,
      sortEnabled: () => this.opts.sort,
      getItems: () => this.getItemElements(),
      listRef: () => this.adapter.getItems(),
      applyChange: (change) => this.applyChange(change as ListChange<T>),
      itemAt: (i) => this.adapter.getItems()[i],
      emptyInsertThreshold: () => this.opts.emptyInsertThreshold,
      rtl: () => this.isRtl(),
      afterRender: (fn) => this.adapter.afterRender(fn),
    })
    el.addEventListener('pointerdown', this.onPointerDown)
    el.addEventListener('click', this.onClick)
    el.addEventListener('keydown', this.onKeyDown)
  }

  /**
   * Replace the list's options (callbacks included). Bindings call this
   * whenever reactive props change; anything omitted falls back to defaults.
   */
  setOptions(options: DndListOptions<T>): void {
    this.opts = withDefaults(options)
    this.entry.group = this.resolveGroup()
  }

  private resolveGroup(): ReturnType<typeof normalizeGroup> {
    if (!this.opts.group) return { name: this.fallbackGroup, pull: true, put: true }
    return normalizeGroup(this.opts.group)
  }

  /** Unregister from the shared drag registry and remove all listeners. */
  destroy(): void {
    this.pendingDelay?.cleanup()
    this.el.removeEventListener('pointerdown', this.onPointerDown)
    this.el.removeEventListener('click', this.onClick)
    this.el.removeEventListener('keydown', this.onKeyDown)
    unregister(this.entry)
  }

  // ── Programmatic API ───────────────────────────────────────────────────────

  /** Move an item from one index to another. */
  move(from: number, to: number): void {
    const len = this.adapter.getItems().length
    if (from < 0 || from >= len) return
    const bounded = Math.max(0, Math.min(len - 1, to))
    if (from === bounded) return
    this.applyChange({ type: 'move', from, to: bounded })
  }

  /** Insert an item at an index (clamped to the list length). */
  insertAt(index: number, item: T): void {
    const i = Math.max(0, Math.min(this.adapter.getItems().length, index))
    this.applyChange({ type: 'insert', index: i, item })
  }

  /** Remove an item by index; returns the removed item. */
  removeAt(index: number): T | undefined {
    const items = this.adapter.getItems()
    if (index < 0 || index >= items.length) return undefined
    const it = items[index]
    this.applyChange({ type: 'remove', index })
    return it
  }

  /** Set the multi-drag selection by index (out-of-range indices are dropped). */
  select(indices: number[]): void {
    const len = this.adapter.getItems().length
    const next = new Set<number>()
    for (const i of indices) {
      if (i >= 0 && i < len) next.add(i)
    }
    this.selection = next
    this.emitSelection()
  }

  /** Clear the multi-drag selection. */
  clearSelection(): void {
    if (this.selection.size === 0) return
    this.selection = new Set()
    this.emitSelection()
  }

  /** The current multi-drag selection, sorted ascending. */
  getSelection(): number[] {
    return [...this.selection].sort((a, b) => a - b)
  }

  /** Whether the item at `index` is in the multi-drag selection. */
  isSelected(index: number): boolean {
    return this.selection.has(index)
  }

  /** Index currently "held" by the keyboard, or `null`. */
  get keyboardIndex(): number | null {
    return this.kbIndex
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private getItemElements(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>(':scope > [data-dnd-index]'))
  }

  private isRtl(): boolean {
    if (this.opts.rtl !== undefined) return this.opts.rtl
    return getComputedStyle(this.el).direction === 'rtl'
  }

  private applyChange(change: ListChange<T>): void {
    const before = this.adapter.getItems()
    if (change.type === 'move') {
      const item = before[change.from]
      this.adapter.apply(change)
      this.opts.onUpdate?.({ item, oldIndex: change.from, newIndex: change.to })
      this.opts.onChange?.({ moved: { item, oldIndex: change.from, newIndex: change.to } })
    } else if (change.type === 'remove') {
      const item = before[change.index]
      this.adapter.apply(change)
      this.opts.onRemove?.({ item, oldIndex: change.index })
      this.opts.onChange?.({ removed: { item, oldIndex: change.index } })
    } else {
      this.adapter.apply(change)
      this.opts.onAdd?.({ item: change.item, newIndex: change.index })
      this.opts.onChange?.({ added: { item: change.item, newIndex: change.index } })
    }
  }

  private emitSelection(): void {
    const items = this.adapter.getItems()
    const indices = this.getSelection()
    this.opts.onSelectionChange?.({ items: indices.map((i) => items[i]), indices })
  }

  private toggleSelection(index: number): void {
    const next = new Set(this.selection)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    this.selection = next
    this.emitSelection()
  }

  private findItem(target: EventTarget | null): FoundItem | null {
    if (!(target instanceof Element)) return null
    const closest = target.closest<HTMLElement>('[data-dnd-index]')
    if (!closest) return null
    if (closest.parentElement !== this.el) return null
    const i = Number(closest.dataset.dndIndex)
    if (Number.isNaN(i)) return null
    return { el: closest, index: i }
  }

  private insideHandle(target: EventTarget | null, itemEl: HTMLElement): boolean {
    if (!this.opts.handle) return true
    if (!(target instanceof Element)) return false
    const handleEl = target.closest(this.opts.handle)
    return !!handleEl && itemEl.contains(handleEl)
  }

  private matchesFilter(target: EventTarget | null): boolean {
    if (!this.opts.filter) return false
    if (!(target instanceof Element)) return false
    return !!target.closest(this.opts.filter)
  }

  private matchesDraggable(itemEl: HTMLElement): boolean {
    if (!this.opts.draggable) return true
    return itemEl.matches(this.opts.draggable)
  }

  private buildSourceItems(initialIndex: number): SourceItem[] {
    const els = this.getItemElements()
    const items = this.adapter.getItems()
    if (this.opts.multiDrag && this.selection.has(initialIndex) && this.selection.size > 1) {
      let indices = this.getSelection()
      if (this.opts.dragMaxItems > 0 && indices.length > this.opts.dragMaxItems) {
        indices = indices.slice(0, this.opts.dragMaxItems)
      }
      return indices.map((i) => ({ index: i, item: items[i], el: els[i] }))
    }
    return [{ index: initialIndex, item: items[initialIndex], el: els[initialIndex] }]
  }

  private releaseChosen(): void {
    if (this.chosenEl && this.opts.chosenClass) {
      this.chosenEl.classList.remove(this.opts.chosenClass)
    }
    this.chosenEl = null
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0 || this.opts.disabled) return
    if (isDragging()) return
    const found = this.findItem(e.target)
    if (!found) return
    if (!this.matchesDraggable(found.el)) return
    if (this.matchesFilter(e.target)) {
      if (this.opts.preventOnFilter) e.preventDefault()
      return
    }
    if (!this.insideHandle(e.target, found.el)) return

    if (this.opts.multiDrag && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      // Modifier presses toggle selection (handled on click) — never drag.
      return
    }
    if (this.opts.multiDrag && !this.selection.has(found.index)) {
      this.clearSelection()
    }

    const useDelay =
      this.opts.delay > 0 && (!this.opts.delayOnTouchOnly || e.pointerType === 'touch')
    if (useDelay) this.startDelayedDrag(e, found)
    else this.startDrag(e, found, false)
  }

  private onClick = (e: MouseEvent): void => {
    if (!this.opts.multiDrag || this.opts.disabled) return
    if (e.detail === 0) return
    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) return
    const found = this.findItem(e.target)
    if (!found) return
    this.toggleSelection(found.index)
  }

  private startDelayedDrag(e: PointerEvent, found: FoundItem): void {
    let lastEvent = e
    const startX = e.clientX
    const startY = e.clientY

    const cleanup = (): void => {
      if (!this.pendingDelay) return
      clearTimeout(this.pendingDelay.timer)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      this.pendingDelay = null
    }

    const onMove = (ev: PointerEvent): void => {
      lastEvent = ev
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > this.opts.touchStartThreshold) {
        cleanup()
      }
    }
    const onUp = (): void => cleanup()

    document.addEventListener('pointermove', onMove, { passive: false })
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)

    const timer = window.setTimeout(() => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      this.pendingDelay = null
      this.startDrag(lastEvent, found, true)
    }, this.opts.delay)

    this.pendingDelay = { timer, cleanup }
  }

  private startDrag(e: PointerEvent, found: FoundItem, viaDelay: boolean): void {
    const item = this.adapter.getItems()[found.index]
    const fromEl = this.el
    const oldIndex = found.index
    const sourceItems = this.buildSourceItems(found.index)

    this.chosenEl = found.el
    if (this.opts.chosenClass) found.el.classList.add(this.opts.chosenClass)
    this.opts.onChoose?.({ item, index: oldIndex })

    beginDrag({
      source: this.entry,
      sourceItems,
      pointerEvent: e,
      animationMs: this.opts.animation,
      thresholdPx: viaDelay ? 0 : this.opts.dragThreshold,
      axis: this.opts.axis,
      direction: this.opts.direction,
      easing: this.opts.easing,
      swap: this.opts.swap,
      swapThreshold: this.opts.swapThreshold,
      invertSwap: this.opts.invertSwap,
      revertOnSpill: this.opts.revertOnSpill,
      removeOnSpill: this.opts.removeOnSpill,
      revertClone: this.opts.revertClone,
      cloneFn: this.opts.clone ? (it) => this.opts.clone!(it as T) : undefined,
      ghostFactory: this.opts.ghostFactory as GhostFactory | undefined,
      ghostClass: this.opts.ghostClass,
      dragClass: this.opts.dragClass,
      scrollConfig: {
        disabled: this.opts.scrollDisabled,
        speed: this.opts.scrollSpeed,
        sensitivity: this.opts.scrollSensitivity,
      },
      onStart: (originalEvent) => {
        this.opts.onStart?.({
          item,
          index: oldIndex,
          fromList: this.adapter.getItems(),
          fromEl,
          originalEvent,
        })
      },
      onMove: (info) => {
        this.opts.onMove?.({
          item,
          fromList: this.adapter.getItems(),
          toList: info.toList.listRef() as readonly T[],
          fromEl,
          toEl: info.toList.el,
          oldIndex,
          newIndex: info.toIndex,
          willInsertAfter: info.willInsertAfter,
          originalEvent: info.pointerEvent,
        })
      },
      onEnd: (info) => {
        this.releaseChosen()
        this.opts.onUnchoose?.({ item, index: oldIndex })
        const toListItems =
          (info.toList?.listRef() as readonly T[] | undefined) ?? this.adapter.getItems()
        this.opts.onEnd?.({
          item,
          oldIndex,
          newIndex: info.toIndex,
          fromList: this.adapter.getItems(),
          toList: toListItems,
          fromEl,
          toEl: info.toList?.el ?? fromEl,
          pullMode: info.pullMode,
          cancelled: info.cancelled,
          originalEvent: info.originalEvent,
        })
        if (this.opts.multiDrag) this.clearSelection()
      },
      onAbort: () => {
        this.releaseChosen()
        this.opts.onUnchoose?.({ item, index: oldIndex })
      },
    })
  }

  // ── Keyboard reordering ────────────────────────────────────────────────────

  private setKbIndex(value: number | null): void {
    this.kbIndex = value
    this.opts.onKeyboardStateChange?.(value)
  }

  private focusItemAt(index: number): void {
    this.adapter.afterRender(() => {
      this.getItemElements()[index]?.focus()
    })
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.opts.keyboard || this.opts.disabled) return
    const found = this.findItem(e.target)
    if (!found) return
    const index = found.index
    const items = this.adapter.getItems()
    const len = items.length

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (this.kbIndex === null) {
        this.setKbIndex(index)
        this.kbOrigin = index
        announce(
          `Picked up item ${index + 1} of ${len}${
            this.opts.ariaLabel ? ` in ${this.opts.ariaLabel}` : ''
          }. Use arrow keys to move, Enter or Space to drop, Escape to cancel.`,
        )
      } else {
        const from = this.kbOrigin ?? index
        const to = this.kbIndex
        this.setKbIndex(null)
        this.kbOrigin = null
        if (from !== to) {
          this.opts.onKeyboardMove?.({
            item: this.adapter.getItems()[to],
            oldIndex: from,
            newIndex: to,
          })
        }
        announce(from === to ? 'Drop cancelled, item returned.' : `Dropped at position ${to + 1}.`)
        this.focusItemAt(to)
      }
      return
    }

    if (e.key === 'Escape' && this.kbIndex !== null) {
      e.preventDefault()
      const original = this.kbOrigin ?? index
      const current = this.kbIndex
      if (current !== original) {
        this.applyChange({ type: 'move', from: current, to: original })
      }
      this.setKbIndex(null)
      this.kbOrigin = null
      announce('Drop cancelled, item returned.')
      this.focusItemAt(original)
      return
    }

    if (this.kbIndex === null) return

    const cur = this.kbIndex
    let target: number
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = Math.max(0, cur - 1)
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = Math.min(len - 1, cur + 1)
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = len - 1
    else return

    e.preventDefault()
    if (target !== cur) {
      this.applyChange({ type: 'move', from: cur, to: target })
      this.setKbIndex(target)
      announce(`Moved to position ${target + 1} of ${len}.`)
      this.focusItemAt(target)
    }
  }
}
