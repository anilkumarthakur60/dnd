import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type {
  DragGroup,
  Axis,
  Direction,
  GhostFactory,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  DragChangePayload,
} from '../core/types'
import { register, unregister, normalizeGroup } from '../core/registry'
import type { RegisteredList, ApplyChange } from '../core/registry'
import { beginDrag, isDragging } from '../core/dragController'

export interface UseDraggableOptions<T> {
  modelValue: Ref<T[]>
  onUpdate: (next: T[]) => void
  group?: () => DragGroup | undefined
  disabled?: () => boolean
  animation?: () => number
  axis?: () => Axis
  direction?: () => Direction
  easing?: () => string
  swap?: () => boolean
  swapThreshold?: () => number
  invertSwap?: () => boolean
  revertOnSpill?: () => boolean
  removeOnSpill?: () => boolean
  revertClone?: () => boolean
  emptyInsertThreshold?: () => number
  scrollDisabled?: () => boolean
  scrollSpeed?: () => number
  scrollSensitivity?: () => number
  rtl?: () => boolean
  cloneFn?: (item: T) => T
  ghostFactory?: GhostFactory<T>
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  handleSelector?: string
  filterSelector?: string
  draggableSelector?: string
  delay?: () => number
  delayOnTouchOnly?: () => boolean
  touchStartThreshold?: () => number
  onStart?: (e: DragStartEvent<T>) => void
  onEnd?: (e: DragEndEvent<T>) => void
  onMove?: (e: DragMoveEvent<T>) => void
  onChange?: (e: DragChangePayload<T>) => void
  onAdd?: (e: { element: T; newIndex: number }) => void
  onRemove?: (e: { element: T; oldIndex: number }) => void
  onUpdateItem?: (e: { element: T; oldIndex: number; newIndex: number }) => void
}

export interface UseDraggableReturn<T> {
  containerRef: Ref<HTMLElement | null>
  internal: Ref<T[]>
  attach: (el: HTMLElement | null) => void
  onPointerDown: (e: PointerEvent) => void
  move: (from: number, to: number) => void
  insertAt: (index: number, item: T) => void
  removeAt: (index: number) => T | undefined
}

export function useDraggable<T>(opts: UseDraggableOptions<T>): UseDraggableReturn<T> {
  const containerRef = ref<HTMLElement | null>(null)
  const internal = ref([...opts.modelValue.value]) as Ref<T[]>

  let suppress = false
  watch(opts.modelValue, (v) => {
    if (suppress) {
      suppress = false
      return
    }
    internal.value = v.slice()
  })

  function commit(next: T[]) {
    internal.value = next
    suppress = true
    opts.onUpdate(next)
  }

  function applyChange(change: ApplyChange) {
    const next = internal.value.slice()
    if (change.type === 'move') {
      const [it] = next.splice(change.from, 1)
      next.splice(change.to, 0, it)
      commit(next)
      opts.onUpdateItem?.({ element: it, oldIndex: change.from, newIndex: change.to })
      opts.onChange?.({ moved: { element: it, oldIndex: change.from, newIndex: change.to } })
    } else if (change.type === 'remove') {
      const it = next[change.index]
      next.splice(change.index, 1)
      commit(next)
      opts.onRemove?.({ element: it, oldIndex: change.index })
      opts.onChange?.({ removed: { element: it, oldIndex: change.index } })
    } else {
      const it = change.item as T
      next.splice(change.index, 0, it)
      commit(next)
      opts.onAdd?.({ element: it, newIndex: change.index })
      opts.onChange?.({ added: { element: it, newIndex: change.index } })
    }
  }

  function isRtl(): boolean {
    if (opts.rtl) return opts.rtl()
    if (!containerRef.value) return false
    return getComputedStyle(containerRef.value).direction === 'rtl'
  }

  const groupObj = computed(() => normalizeGroup(opts.group?.()))

  let registered: RegisteredList | null = null

  function getItemElements(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(
      containerRef.value.querySelectorAll<HTMLElement>(':scope > [data-vue-dnd-index]'),
    )
  }

  onMounted(() => {
    if (!containerRef.value) return
    registered = register({
      el: containerRef.value,
      group: groupObj.value,
      disabled: () => !!opts.disabled?.(),
      getItems: getItemElements,
      listRef: () => internal.value as unknown[],
      applyChange,
      itemAt: (i) => internal.value[i],
      emptyInsertThreshold: () => opts.emptyInsertThreshold?.() ?? 0,
      rtl: isRtl,
    })
  })

  onBeforeUnmount(() => {
    if (registered) unregister(registered)
    registered = null
  })

  watch(groupObj, (g) => {
    if (registered) registered.group = g
  })

  function findItem(target: EventTarget | null): { el: HTMLElement; index: number } | null {
    if (!(target instanceof Element)) return null
    const closest = target.closest('[data-vue-dnd-index]') as HTMLElement | null
    if (!closest) return null
    if (closest.parentElement !== containerRef.value) return null
    const i = Number(closest.dataset.vueDndIndex)
    if (Number.isNaN(i)) return null
    return { el: closest, index: i }
  }

  function targetInsideHandle(target: EventTarget | null, itemEl: HTMLElement): boolean {
    if (!opts.handleSelector) return true
    if (!(target instanceof Element)) return false
    const handleEl = target.closest(opts.handleSelector)
    return !!handleEl && itemEl.contains(handleEl)
  }

  function targetMatchesFilter(target: EventTarget | null): boolean {
    if (!opts.filterSelector) return false
    if (!(target instanceof Element)) return false
    return !!target.closest(opts.filterSelector)
  }

  function targetMatchesDraggable(itemEl: HTMLElement): boolean {
    if (!opts.draggableSelector) return true
    return itemEl.matches(opts.draggableSelector)
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || opts.disabled?.() || !registered) return
    if (isDragging()) return
    const found = findItem(e.target)
    if (!found) return
    if (!targetMatchesDraggable(found.el)) return
    if (targetMatchesFilter(e.target)) return
    if (!targetInsideHandle(e.target, found.el)) return

    const item = internal.value[found.index]
    const fromEl = containerRef.value!

    beginDrag({
      source: registered,
      sourceItems: [{ index: found.index, item, el: found.el }],
      pointerEvent: e,
      animationMs: opts.animation?.() ?? 200,
      thresholdPx: 5,
      axis: opts.axis?.() ?? null,
      direction: opts.direction?.() ?? 'auto',
      easing: opts.easing?.() ?? 'cubic-bezier(0.2, 0, 0, 1)',
      swap: opts.swap?.() ?? false,
      swapThreshold: opts.swapThreshold?.() ?? 1,
      invertSwap: opts.invertSwap?.() ?? false,
      revertOnSpill: opts.revertOnSpill?.() ?? false,
      removeOnSpill: opts.removeOnSpill?.() ?? false,
      revertClone: opts.revertClone?.() ?? false,
      cloneFn: opts.cloneFn ? (it) => opts.cloneFn!(it as T) : undefined,
      ghostFactory: opts.ghostFactory as GhostFactory | undefined,
      ghostClass: opts.ghostClass,
      chosenClass: opts.chosenClass,
      dragClass: opts.dragClass,
      scrollConfig: {
        disabled: opts.scrollDisabled?.() ?? false,
        speed: opts.scrollSpeed?.() ?? 18,
        sensitivity: opts.scrollSensitivity?.() ?? 48,
      },
      onStart: (origEvent) => {
        opts.onStart?.({
          item,
          index: found.index,
          fromList: internal.value,
          fromEl,
          originalEvent: origEvent,
        })
      },
      onMove: (info) => {
        opts.onMove?.({
          item,
          fromList: internal.value,
          toList: info.toList.listRef() as T[],
          fromEl,
          toEl: info.toList.el,
          oldIndex: found.index,
          newIndex: info.toIndex,
          willInsertAfter: info.willInsertAfter,
          originalEvent: info.pointerEvent,
        })
      },
      onEnd: (info) => {
        const toList = (info.toList?.listRef() as T[] | undefined) ?? internal.value
        opts.onEnd?.({
          item,
          oldIndex: found.index,
          newIndex: info.toIndex,
          fromList: internal.value,
          toList,
          fromEl,
          toEl: info.toList?.el ?? fromEl,
          pullMode: info.pullMode,
          cancelled: info.cancelled,
          originalEvent: info.originalEvent,
        })
      },
    })
  }

  return {
    containerRef,
    internal,
    attach(el) {
      containerRef.value = el
    },
    onPointerDown,
    move(from, to) {
      if (from < 0 || from >= internal.value.length) return
      const bounded = Math.max(0, Math.min(internal.value.length - 1, to))
      if (from === bounded) return
      applyChange({ type: 'move', from, to: bounded })
    },
    insertAt(index, item) {
      const i = Math.max(0, Math.min(internal.value.length, index))
      applyChange({ type: 'insert', index: i, item })
    },
    removeAt(index) {
      if (index < 0 || index >= internal.value.length) return undefined
      const it = internal.value[index]
      applyChange({ type: 'remove', index })
      return it
    },
  }
}
