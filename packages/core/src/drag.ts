import type { RegisteredList } from './registry'
import { listsUnderPoint, resolvePull, resolvePut } from './registry'
import { captureRects, playFlip } from './flip'
import { startAutoScroll, updateAutoScroll, stopAutoScroll } from './autoscroll'
import type { DndAxis, DndDirection, GhostFactory, PullMode, ScrollConfig } from './types'

export interface SourceItem {
  index: number
  item: unknown
  el: HTMLElement
}

export interface MoveInfo {
  pointerEvent: PointerEvent
  toList: RegisteredList
  toIndex: number
  willInsertAfter: boolean
}

export interface EndInfo {
  cancelled: boolean
  toList: RegisteredList | null
  toIndex: number
  pullMode: PullMode
  originalEvent: PointerEvent | KeyboardEvent
}

export interface BeginDragOptions {
  source: RegisteredList
  sourceItems: SourceItem[]
  pointerEvent: PointerEvent
  animationMs: number
  thresholdPx: number
  axis: DndAxis
  direction: DndDirection
  easing: string
  swap: boolean
  swapThreshold: number
  invertSwap: boolean
  revertOnSpill: boolean
  removeOnSpill: boolean
  revertClone: boolean
  cloneFn?: (item: unknown) => unknown
  ghostFactory?: GhostFactory
  ghostClass?: string
  dragClass?: string
  scrollConfig?: ScrollConfig
  /** The pointer crossed the drag threshold — the drag is live. */
  onStart: (originalEvent: PointerEvent) => void
  /** The dragged block moved to a new list/index. */
  onMove: (info: MoveInfo) => void
  /** The drag finished (only fires if `onStart` fired). */
  onEnd: (info: EndInfo) => void
  /** The press ended before the threshold was crossed — no drag happened. */
  onAbort: () => void
}

interface Active extends BeginDragOptions {
  thresholdCrossed: boolean
  ghost: HTMLElement | null
  ghostOffsetX: number
  ghostOffsetY: number
  startRect: DOMRect | null
  currentList: RegisteredList | null
  currentStartIndex: number
  isClone: boolean
  startX: number
  startY: number
  placeholderEls: HTMLElement[]
  /** Whether the dragged block is contiguous starting at `currentStartIndex`. */
  folded: boolean
}

let active: Active | null = null

const COUNT = (a: Active): number => a.sourceItems.length

export function beginDrag(opts: BeginDragOptions): void {
  if (active) return
  active = {
    ...opts,
    thresholdCrossed: false,
    ghost: null,
    ghostOffsetX: 0,
    ghostOffsetY: 0,
    startRect: null,
    currentList: opts.source,
    currentStartIndex: opts.sourceItems[0].index,
    isClone: false,
    startX: opts.pointerEvent.clientX,
    startY: opts.pointerEvent.clientY,
    placeholderEls: [],
    folded: opts.sourceItems.length === 1,
  }
  document.addEventListener('pointermove', onPointerMove, { passive: false })
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointercancel', onPointerCancel)
  document.addEventListener('keydown', onKey, { capture: true })
  document.addEventListener('selectstart', onSelectStart)
  document.addEventListener('contextmenu', onContextMenu)
}

/** `true` while a pointer drag is live (threshold crossed, not yet dropped). */
export function isDragging(): boolean {
  return active !== null && active.thresholdCrossed
}

function onSelectStart(e: Event): void {
  if (active?.thresholdCrossed) e.preventDefault()
}

function onContextMenu(e: Event): void {
  if (active?.thresholdCrossed) e.preventDefault()
}

function onKey(e: KeyboardEvent): void {
  if (!active) return
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelDrag(e)
  }
}

function defaultGhostBuilder(sourceEl: HTMLElement, count: number): HTMLElement {
  const rect = sourceEl.getBoundingClientRect()
  const clone = sourceEl.cloneNode(true) as HTMLElement
  clone.removeAttribute('data-dnd-index')
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.margin = '0'
  if (count > 1) {
    const badge = document.createElement('div')
    badge.textContent = String(count)
    badge.className = 'dnd-count-badge'
    clone.style.position = 'relative'
    clone.appendChild(badge)
  }
  return clone
}

function makeGhost(clientX: number, clientY: number): void {
  if (!active) return
  const sourceEl = active.sourceItems[0].el
  const rect = sourceEl.getBoundingClientRect()
  active.startRect = rect
  const built = active.ghostFactory
    ? active.ghostFactory({
        items: active.sourceItems.map((s) => s.item),
        sourceEl,
        count: COUNT(active),
      })
    : defaultGhostBuilder(sourceEl, COUNT(active))
  built.style.position = 'fixed'
  built.style.top = '0'
  built.style.left = '0'
  built.style.pointerEvents = 'none'
  built.style.zIndex = '99999'
  built.style.transition = 'none'
  built.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  built.style.boxShadow ||= '0 8px 24px rgba(0, 0, 0, 0.18)'
  built.style.opacity ||= '0.95'
  built.classList.add('dnd-ghost')
  if (active.dragClass) built.classList.add(active.dragClass)
  document.body.appendChild(built)
  active.ghost = built
  active.ghostOffsetX = clientX - rect.left
  active.ghostOffsetY = clientY - rect.top
}

function setPlaceholderClasses(els: HTMLElement[], on: boolean): void {
  for (const el of els) {
    if (!el.isConnected && on) continue
    if (on) {
      el.classList.add('dnd-placeholder')
      if (active?.ghostClass) el.classList.add(active.ghostClass)
    } else {
      el.classList.remove('dnd-placeholder')
      if (active?.ghostClass) el.classList.remove(active.ghostClass)
    }
  }
}

/**
 * Keep the "you are here" placeholder styling on whichever elements currently
 * render the dragged block — they change identity when the block crosses lists.
 */
function refreshPlaceholder(): void {
  if (!active || !active.thresholdCrossed) return
  setPlaceholderClasses(active.placeholderEls, false)
  if (!active.currentList) {
    active.placeholderEls = []
    return
  }
  const els = active.currentList
    .getItems()
    .slice(active.currentStartIndex, active.currentStartIndex + COUNT(active))
  active.placeholderEls = els
  setPlaceholderClasses(els, true)
}

function detectAxis(list: RegisteredList, override: DndAxis, direction: DndDirection): 'x' | 'y' {
  if (override) return override
  if (direction === 'horizontal') return 'x'
  if (direction === 'vertical') return 'y'
  const items = list.getItems()
  if (items.length < 2) {
    const el = items[0] ?? list.el
    const tag = el?.tagName
    if (tag === 'TH' || tag === 'TD') return 'x'
    const cs = el?.parentElement ? getComputedStyle(el.parentElement) : null
    if (cs && cs.display.includes('flex') && cs.flexDirection.startsWith('row')) return 'x'
    return 'y'
  }
  const a = items[0].getBoundingClientRect()
  const b = items[1].getBoundingClientRect()
  return Math.abs(b.left - a.left) > Math.abs(b.top - a.top) ? 'x' : 'y'
}

interface TargetHit {
  /** Insertion index (post-removal coordinates when `excludeRange` is set). */
  index: number
  insertAfter: boolean
  /** In swap mode: the raw index of the hovered item, or `null` on a miss. */
  swapWith: number | null
}

function computeTargetIndex(
  list: RegisteredList,
  x: number,
  y: number,
  excludeRange: { start: number; count: number } | null,
): TargetHit {
  const items = list.getItems()
  if (items.length === 0) return { index: 0, insertAfter: false, swapWith: null }

  const axis = detectAxis(list, active?.axis ?? null, active?.direction ?? 'auto')
  const swap = !!active?.swap
  const threshold = Math.max(0.01, Math.min(1, active?.swapThreshold ?? 1))
  const invert = !!active?.invertSwap
  const rtl = list.rtl()

  const indexOf = (i: number): number => {
    if (!excludeRange) return i
    if (i <= excludeRange.start) return i
    return i - Math.min(excludeRange.count, i - excludeRange.start)
  }

  if (swap) {
    for (let i = 0; i < items.length; i++) {
      if (excludeRange && i >= excludeRange.start && i < excludeRange.start + excludeRange.count)
        continue
      const r = items[i].getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return { index: indexOf(i), insertAfter: false, swapWith: i }
      }
    }
    const tail = excludeRange ? excludeRange.start : items.length
    return { index: tail, insertAfter: true, swapWith: null }
  }

  for (let i = 0; i < items.length; i++) {
    if (excludeRange && i >= excludeRange.start && i < excludeRange.start + excludeRange.count)
      continue
    const r = items[i].getBoundingClientRect()
    if (axis === 'y') {
      const split = r.top + r.height * (invert ? 1 - threshold / 2 : threshold / 2)
      if (y < split) return { index: indexOf(i), insertAfter: false, swapWith: null }
    } else {
      const split = rtl
        ? r.left + r.width * (invert ? threshold / 2 : 1 - threshold / 2)
        : r.left + r.width * (invert ? 1 - threshold / 2 : threshold / 2)
      const past = rtl ? x > split : x < split
      if (past) return { index: indexOf(i), insertAfter: false, swapWith: null }
    }
  }
  const tail = excludeRange ? items.length - excludeRange.count : items.length
  return { index: tail, insertAfter: true, swapWith: null }
}

function afterRenderAll(lists: RegisteredList[], fn: () => void): void {
  const unique = [...new Set(lists)]
  let pending = unique.length
  if (pending === 0) {
    fn()
    return
  }
  const done = (): void => {
    if (--pending === 0) fn()
  }
  for (const list of unique) list.afterRender(done)
}

/** Snapshot layout, apply `mutate`, then FLIP-animate once the DOM re-rendered. */
function flipAround(lists: RegisteredList[], mutate: () => void): void {
  if (!active) {
    mutate()
    return
  }
  const animate = active.animationMs > 0
  const easing = active.easing
  const ms = active.animationMs
  let snap: ReturnType<typeof captureRects> | null = null
  if (animate) {
    const els: HTMLElement[] = []
    for (const l of lists) els.push(...l.getItems())
    snap = captureRects(els)
  }
  mutate()
  afterRenderAll(lists, () => {
    if (snap) playFlip(snap, ms, easing)
    refreshPlaceholder()
  })
}

function batchRemove(list: RegisteredList, startIndex: number, count: number): void {
  for (let i = 0; i < count; i++) {
    list.applyChange({ type: 'remove', index: startIndex })
  }
}

function batchInsert(list: RegisteredList, startIndex: number, items: unknown[]): void {
  for (let i = 0; i < items.length; i++) {
    list.applyChange({ type: 'insert', index: startIndex + i, item: items[i] })
  }
}

/**
 * A multi-drag selection may be scattered across the list. Fold it into one
 * contiguous block anchored at the first selected index so the rest of the
 * engine can treat the dragged items as a single range.
 */
function foldSourceBlock(): void {
  if (!active || active.folded) return
  if (!active.source.sortEnabled()) return
  const src = active.source
  const indices = active.sourceItems.map((s) => s.index)
  const items = active.sourceItems.map((s) => s.item)
  const anchor = indices[0]
  flipAround([src], () => {
    for (let k = indices.length - 1; k >= 0; k--) {
      src.applyChange({ type: 'remove', index: indices[k] })
    }
    batchInsert(src, anchor, items)
  })
  active.currentStartIndex = anchor
  active.folded = true
}

/** Remove the dragged block from the source list, folded or scattered. */
function removeFromSource(): void {
  if (!active) return
  const src = active.source
  if (active.folded) {
    batchRemove(src, active.currentStartIndex, COUNT(active))
  } else {
    const indices = active.sourceItems.map((s) => s.index)
    for (let k = indices.length - 1; k >= 0; k--) {
      src.applyChange({ type: 'remove', index: indices[k] })
    }
  }
}

function isInsideSource(list: RegisteredList): boolean {
  if (!active) return false
  for (const s of active.sourceItems) {
    if (s.el === list.el || s.el.contains(list.el)) return true
  }
  return false
}

function structuredCloneSafe(v: unknown): unknown {
  try {
    return typeof structuredClone === 'function'
      ? structuredClone(v)
      : JSON.parse(JSON.stringify(v))
  } catch {
    return JSON.parse(JSON.stringify(v))
  }
}

function onPointerMove(e: PointerEvent): void {
  if (!active) return

  if (!active.thresholdCrossed) {
    const dx = e.clientX - active.startX
    const dy = e.clientY - active.startY
    if (Math.hypot(dx, dy) < active.thresholdPx) return
    active.thresholdCrossed = true
    makeGhost(e.clientX, e.clientY)
    active.placeholderEls = active.sourceItems.map((s) => s.el)
    setPlaceholderClasses(active.placeholderEls, true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    startAutoScroll(e.clientX, e.clientY, active.scrollConfig)
    active.onStart(e)
    foldSourceBlock()
  }

  e.preventDefault()

  let gx = e.clientX - active.ghostOffsetX
  let gy = e.clientY - active.ghostOffsetY
  if (active.axis === 'x' && active.startRect) {
    gy = active.startRect.top
  } else if (active.axis === 'y' && active.startRect) {
    gx = active.startRect.left
  }
  active.ghost!.style.transform = `translate(${gx}px, ${gy}px)`
  updateAutoScroll(e.clientX, e.clientY)

  const lists = listsUnderPoint(e.clientX, e.clientY)
  let candidate: RegisteredList | null = null
  let candidatePull: PullMode = false
  for (const list of lists) {
    if (list.disabled()) continue
    // Cycle guard: a node cannot be dropped into itself or its own subtree.
    if (list !== active.source && isInsideSource(list)) continue
    if (list === active.source) {
      candidate = list
      candidatePull = true
      break
    }
    const pull = resolvePull(active.source, list)
    if (!pull) continue
    if (!resolvePut(active.source, list)) continue
    candidate = list
    candidatePull = pull
    break
  }

  const count = COUNT(active)

  if (!candidate) {
    // Pointer is outside every list. Pull the block out of whatever list is
    // showing it — always for foreign lists; for the source list only when a
    // spill behaviour is configured (otherwise it just keeps its last slot).
    const spillConfigured = active.revertOnSpill || active.removeOnSpill
    if (active.currentList && (active.currentList !== active.source || spillConfigured)) {
      const fromList = active.currentList
      const startIdx = active.currentStartIndex
      flipAround([fromList], () => {
        if (fromList === active!.source) removeFromSource()
        else batchRemove(fromList, startIdx, count)
      })
      active.folded = true
      active.currentList = null
      active.currentStartIndex = -1
    }
    return
  }

  const isClone = candidatePull === 'clone'

  if (active.currentList === candidate) {
    if (!candidate.sortEnabled()) return
    const exclude = { start: active.currentStartIndex, count }
    const hit = computeTargetIndex(candidate, e.clientX, e.clientY, exclude)

    if (active.swap) {
      // True swap: exchange the dragged item with the hovered one.
      if (count === 1 && hit.swapWith !== null && hit.swapWith !== active.currentStartIndex) {
        const from = active.currentStartIndex
        const to = hit.swapWith
        const list = candidate
        flipAround([list], () => {
          list.applyChange({ type: 'move', from, to })
          const occupantNow = from < to ? to - 1 : to + 1
          list.applyChange({ type: 'move', from: occupantNow, to: from })
        })
        active.currentStartIndex = to
        active.onMove({ pointerEvent: e, toList: candidate, toIndex: to, willInsertAfter: false })
      }
      return
    }

    if (hit.index !== active.currentStartIndex) {
      const fromStart = active.currentStartIndex
      const list = candidate
      flipAround([list], () => {
        if (count === 1) {
          list.applyChange({ type: 'move', from: fromStart, to: hit.index })
        } else {
          const items: unknown[] = []
          for (let i = 0; i < count; i++) items.push(list.itemAt(fromStart + i))
          batchRemove(list, fromStart, count)
          batchInsert(list, hit.index, items)
        }
      })
      active.currentStartIndex = hit.index
      active.onMove({
        pointerEvent: e,
        toList: candidate,
        toIndex: hit.index,
        willInsertAfter: hit.insertAfter,
      })
    }
    return
  }

  if (candidate === active.source) {
    // Re-entering the source list after having left it.
    const hit = computeTargetIndex(candidate, e.clientX, e.clientY, null)
    const index = candidate.sortEnabled() ? hit.index : active.sourceItems[0].index
    const items = active.sourceItems.map((s) => s.item)
    const previous = active.currentList
    const previousStart = active.currentStartIndex
    const flips = previous ? [previous, candidate] : [candidate]
    flipAround(flips, () => {
      if (previous) batchRemove(previous, previousStart, count)
      batchInsert(candidate, index, items)
    })
    active.currentList = candidate
    active.currentStartIndex = index
    active.isClone = false
    active.onMove({
      pointerEvent: e,
      toList: candidate,
      toIndex: index,
      willInsertAfter: hit.insertAfter,
    })
    return
  }

  // Entering a foreign list.
  const itemsForTarget = isClone
    ? active.sourceItems.map((s) =>
        active!.cloneFn ? active!.cloneFn(s.item) : structuredCloneSafe(s.item),
      )
    : active.sourceItems.map((s) => s.item)

  const hit = computeTargetIndex(candidate, e.clientX, e.clientY, null)
  const previous = active.currentList
  const previousStart = active.currentStartIndex
  const removeFromPrevious = previous !== null && previous !== active.source

  const src = active.source
  const flips: RegisteredList[] = [candidate]
  if (previous && removeFromPrevious) flips.push(previous)
  if (!removeFromPrevious && !isClone && previous === src) flips.push(src)

  flipAround(flips, () => {
    if (removeFromPrevious && previous) batchRemove(previous, previousStart, count)
    if (!isClone && previous === src) removeFromSource()
    batchInsert(candidate, hit.index, itemsForTarget)
  })

  active.currentList = candidate
  active.currentStartIndex = hit.index
  active.isClone = isClone
  active.folded = true
  active.onMove({
    pointerEvent: e,
    toList: candidate,
    toIndex: hit.index,
    willInsertAfter: hit.insertAfter,
  })
}

function onPointerUp(e: PointerEvent): void {
  if (!active) return
  if (!active.thresholdCrossed) {
    const abort = active.onAbort
    teardown()
    abort()
    return
  }
  // Dropped outside any valid target.
  if (active.currentList === null) {
    if (active.revertOnSpill) {
      void animateGhostBack().then(() => {
        if (!active) return
        const items = active.sourceItems.map((s) => s.item)
        flipAround([active.source], () =>
          batchInsert(active!.source, active!.sourceItems[0].index, items),
        )
        active.onEnd({
          cancelled: true,
          toList: null,
          toIndex: -1,
          pullMode: false,
          originalEvent: e,
        })
        teardown()
      })
      return
    }
    if (active.removeOnSpill) {
      // The dragged block was already removed while hovering outside.
      active.onEnd({
        cancelled: false,
        toList: null,
        toIndex: -1,
        pullMode: false,
        originalEvent: e,
      })
      teardown()
      return
    }
  }
  // revertClone: a clone dropped back on its own source animates home and is discarded.
  if (active.revertClone && active.isClone && active.currentList === active.source) {
    const fromList = active.source
    const fromIndex = active.currentStartIndex
    void animateGhostBack().then(() => {
      if (!active) return
      flipAround([fromList], () => batchRemove(fromList, fromIndex, COUNT(active!)))
      active.onEnd({
        cancelled: true,
        toList: null,
        toIndex: -1,
        pullMode: 'clone',
        originalEvent: e,
      })
      teardown()
    })
    return
  }
  const pullMode: PullMode = active.isClone ? 'clone' : true
  active.onEnd({
    cancelled: false,
    toList: active.currentList,
    toIndex: active.currentStartIndex,
    pullMode,
    originalEvent: e,
  })
  teardown()
}

function onPointerCancel(e: PointerEvent): void {
  cancelDrag(e)
}

function animateGhostBack(): Promise<void> {
  if (!active?.ghost) return Promise.resolve()
  const anchor = active.sourceItems[0].el.isConnected
    ? active.sourceItems[0].el.getBoundingClientRect()
    : active.startRect
  if (!anchor) return Promise.resolve()
  const ghost = active.ghost
  const ms = active.animationMs > 0 ? active.animationMs : 200
  const easing = active.easing
  return new Promise((resolve) => {
    const a = ghost.animate(
      [
        { transform: ghost.style.transform },
        { transform: `translate(${anchor.left}px, ${anchor.top}px)` },
      ],
      { duration: ms, easing, fill: 'forwards' },
    )
    a.onfinish = () => resolve()
    a.oncancel = () => resolve()
  })
}

function cancelDrag(e: PointerEvent | KeyboardEvent): void {
  if (!active) return
  if (active.thresholdCrossed) {
    const count = COUNT(active)
    const restore = (): void => {
      if (!active) return
      if (active.isClone && active.currentList && active.currentList !== active.source) {
        const fromList = active.currentList
        const startIdx = active.currentStartIndex
        flipAround([fromList], () => batchRemove(fromList, startIdx, count))
      } else if (active.currentList !== active.source) {
        const previous = active.currentList
        const previousStart = active.currentStartIndex
        const restoreIdx = active.sourceItems[0].index
        const items = active.sourceItems.map((s) => s.item)
        const lists = previous ? [previous, active.source] : [active.source]
        flipAround(lists, () => {
          if (previous) batchRemove(previous, previousStart, count)
          batchInsert(active!.source, restoreIdx, items)
        })
      } else if (active.currentStartIndex !== active.sourceItems[0].index) {
        const fromStart = active.currentStartIndex
        const toStart = active.sourceItems[0].index
        const list = active.source
        flipAround([list], () => {
          if (count === 1) {
            list.applyChange({ type: 'move', from: fromStart, to: toStart })
          } else {
            const items: unknown[] = []
            for (let i = 0; i < count; i++) items.push(list.itemAt(fromStart + i))
            batchRemove(list, fromStart, count)
            batchInsert(list, toStart, items)
          }
        })
      }
      active.onEnd({
        cancelled: true,
        toList: null,
        toIndex: -1,
        pullMode: false,
        originalEvent: e,
      })
      teardown()
    }
    void animateGhostBack().then(restore)
    return
  }
  const abort = active.onAbort
  teardown()
  abort()
}

function teardown(): void {
  if (!active) return
  setPlaceholderClasses(active.placeholderEls, false)
  setPlaceholderClasses(
    active.sourceItems.map((s) => s.el),
    false,
  )
  if (active.ghost?.parentElement) active.ghost.parentElement.removeChild(active.ghost)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  stopAutoScroll()
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  document.removeEventListener('pointercancel', onPointerCancel)
  document.removeEventListener('keydown', onKey, { capture: true })
  document.removeEventListener('selectstart', onSelectStart)
  document.removeEventListener('contextmenu', onContextMenu)
  active = null
}
