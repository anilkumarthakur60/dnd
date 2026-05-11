import { nextTick } from 'vue'
import type { RegisteredList } from './registry'
import { listsUnderPoint, resolvePull, resolvePut } from './registry'
import { snapshot, play } from './flip'
import { startAutoScroll, updateAutoScroll, stopAutoScroll } from './autoScroll'
import type { Axis, Direction, GhostFactory, ScrollConfig } from './types'

export interface SourceItem {
  index: number
  item: unknown
  el: HTMLElement
}

export interface BeginDragOptions {
  source: RegisteredList
  sourceItems: SourceItem[]
  pointerEvent: PointerEvent
  animationMs: number
  thresholdPx: number
  axis?: Axis
  direction?: Direction
  easing?: string
  swap?: boolean
  swapThreshold?: number
  invertSwap?: boolean
  revertOnSpill?: boolean
  removeOnSpill?: boolean
  revertClone?: boolean
  cloneFn?: (item: unknown) => unknown
  ghostFactory?: GhostFactory
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  scrollConfig?: ScrollConfig
  onStart: (originalEvent: PointerEvent) => void
  onMove: (info: MoveInfo) => void
  onEnd: (info: EndInfo) => void
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
  pullMode: false | true | 'clone'
  originalEvent: PointerEvent | KeyboardEvent
}

interface Active extends BeginDragOptions {
  thresholdCrossed: boolean
  ghost: HTMLElement | null
  ghostOffsetX: number
  ghostOffsetY: number
  ghostWidth: number
  ghostHeight: number
  currentList: RegisteredList | null
  currentStartIndex: number
  isClone: boolean
  startX: number
  startY: number
}

let active: Active | null = null

const COUNT = (a: Active) => a.sourceItems.length

export function beginDrag(opts: BeginDragOptions) {
  if (active) return
  active = {
    ...opts,
    swap: opts.swap ?? false,
    swapThreshold: opts.swapThreshold ?? 1,
    invertSwap: opts.invertSwap ?? false,
    axis: opts.axis ?? null,
    direction: opts.direction ?? 'auto',
    easing: opts.easing ?? 'cubic-bezier(0.2, 0, 0, 1)',
    revertOnSpill: opts.revertOnSpill ?? false,
    removeOnSpill: opts.removeOnSpill ?? false,
    revertClone: opts.revertClone ?? false,
    thresholdCrossed: false,
    ghost: null,
    ghostOffsetX: 0,
    ghostOffsetY: 0,
    ghostWidth: 0,
    ghostHeight: 0,
    currentList: opts.source,
    currentStartIndex: opts.sourceItems[0].index,
    isClone: false,
    startX: opts.pointerEvent.clientX,
    startY: opts.pointerEvent.clientY,
  }
  document.addEventListener('pointermove', onPointerMove, { passive: false })
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointercancel', onPointerCancel)
  document.addEventListener('keydown', onKey, { capture: true })
  document.addEventListener('selectstart', onSelectStart)
  document.addEventListener('contextmenu', onContextMenu)
}

export function isDragging() {
  return active !== null && active.thresholdCrossed
}

function onSelectStart(e: Event) {
  if (active?.thresholdCrossed) e.preventDefault()
}

function onContextMenu(e: Event) {
  if (active?.thresholdCrossed) e.preventDefault()
}

function onKey(e: KeyboardEvent) {
  if (!active) return
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelDrag(e)
  }
}

function defaultGhostBuilder(sourceEl: HTMLElement, count: number): HTMLElement {
  const rect = sourceEl.getBoundingClientRect()
  const clone = sourceEl.cloneNode(true) as HTMLElement
  clone.removeAttribute('data-vue-dnd-index')
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.margin = '0'
  if (count > 1) {
    const badge = document.createElement('div')
    badge.textContent = String(count)
    badge.className = 'vue-dnd-count-badge'
    Object.assign(badge.style, {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      minWidth: '20px',
      height: '20px',
      padding: '0 6px',
      borderRadius: '999px',
      background: '#6ea8ff',
      color: '#0b0f17',
      fontSize: '11px',
      fontWeight: '700',
      display: 'grid',
      placeItems: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    })
    clone.style.position = 'relative'
    clone.appendChild(badge)
  }
  return clone
}

function makeGhost(clientX: number, clientY: number) {
  if (!active) return
  const sourceEl = active.sourceItems[0].el
  const rect = sourceEl.getBoundingClientRect()
  const built = active.ghostFactory
    ? active.ghostFactory({ items: active.sourceItems.map((s) => s.item), sourceEl, count: COUNT(active) })
    : defaultGhostBuilder(sourceEl, COUNT(active))
  built.style.position = 'fixed'
  built.style.top = '0'
  built.style.left = '0'
  built.style.pointerEvents = 'none'
  built.style.zIndex = '99999'
  built.style.transition = 'none'
  built.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  built.style.boxShadow ||= '0 8px 24px rgba(0,0,0,0.18)'
  built.style.opacity ||= '0.95'
  built.classList.add('vue-dnd-ghost')
  if (active.dragClass) built.classList.add(active.dragClass)
  document.body.appendChild(built)
  active.ghost = built
  active.ghostOffsetX = clientX - rect.left
  active.ghostOffsetY = clientY - rect.top
  active.ghostWidth = rect.width
  active.ghostHeight = rect.height
}

function setPlaceholderStyle(items: SourceItem[], on: boolean) {
  for (const { el } of items) {
    if (!el.isConnected) continue
    if (on) {
      el.classList.add('vue-dnd-placeholder')
      if (active?.ghostClass) el.classList.add(active.ghostClass)
    } else {
      el.classList.remove('vue-dnd-placeholder')
      if (active?.ghostClass) el.classList.remove(active.ghostClass)
    }
  }
}

function detectAxis(list: RegisteredList, override: Axis, direction: Direction): 'x' | 'y' {
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

function computeTargetIndex(
  list: RegisteredList,
  x: number,
  y: number,
  excludeRange: { start: number; count: number } | null,
): { index: number; insertAfter: boolean } {
  const items = list.getItems()
  if (items.length === 0) return { index: 0, insertAfter: false }

  const axis = detectAxis(list, active?.axis ?? null, active?.direction ?? 'auto')
  const swap = !!active?.swap
  const threshold = Math.max(0.01, Math.min(1, active?.swapThreshold ?? 1))
  const invert = !!active?.invertSwap
  const rtl = list.rtl()

  const indexOf = (i: number) => {
    if (!excludeRange) return i
    if (i <= excludeRange.start) return i
    return i - Math.min(excludeRange.count, i - excludeRange.start)
  }

  if (swap) {
    for (let i = 0; i < items.length; i++) {
      if (excludeRange && i >= excludeRange.start && i < excludeRange.start + excludeRange.count) continue
      const r = items[i].getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return { index: indexOf(i), insertAfter: false }
      }
    }
    return { index: excludeRange ? excludeRange.start : items.length, insertAfter: true }
  }

  for (let i = 0; i < items.length; i++) {
    if (excludeRange && i >= excludeRange.start && i < excludeRange.start + excludeRange.count) continue
    const r = items[i].getBoundingClientRect()
    if (axis === 'y') {
      const split = r.top + r.height * (invert ? 1 - threshold / 2 : threshold / 2)
      if (y < split) return { index: indexOf(i), insertAfter: false }
    } else {
      const split = rtl
        ? r.left + r.width * (invert ? threshold / 2 : 1 - threshold / 2)
        : r.left + r.width * (invert ? 1 - threshold / 2 : threshold / 2)
      const past = rtl ? x > split : x < split
      if (past) return { index: indexOf(i), insertAfter: false }
    }
  }
  const tail = excludeRange ? items.length - excludeRange.count : items.length
  return { index: tail, insertAfter: true }
}

function flipAround(lists: RegisteredList[], fn: () => void) {
  if (!active || active.animationMs <= 0) {
    fn()
    return
  }
  const els: HTMLElement[] = []
  for (const l of lists) els.push(...l.getItems())
  const snap = snapshot(els)
  fn()
  nextTick(() => play(snap, active!.animationMs, active!.easing))
}

function batchRemove(list: RegisteredList, startIndex: number, count: number) {
  for (let i = 0; i < count; i++) {
    list.applyChange({ type: 'remove', index: startIndex })
  }
}

function batchInsert(list: RegisteredList, startIndex: number, items: unknown[]) {
  for (let i = 0; i < items.length; i++) {
    list.applyChange({ type: 'insert', index: startIndex + i, item: items[i] })
  }
}

function structuredCloneSafe(v: unknown): unknown {
  try {
    return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v))
  } catch {
    return JSON.parse(JSON.stringify(v))
  }
}

function onPointerMove(e: PointerEvent) {
  if (!active) return

  if (!active.thresholdCrossed) {
    const dx = e.clientX - active.startX
    const dy = e.clientY - active.startY
    if (Math.hypot(dx, dy) < active.thresholdPx) return
    active.thresholdCrossed = true
    makeGhost(e.clientX, e.clientY)
    setPlaceholderStyle(active.sourceItems, true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    startAutoScroll(e.clientX, e.clientY, active.scrollConfig)
    active.onStart(e)
  }

  e.preventDefault()

  let gx = e.clientX - active.ghostOffsetX
  let gy = e.clientY - active.ghostOffsetY
  if (active.axis === 'x') {
    const srcRect = active.sourceItems[0].el.getBoundingClientRect()
    gy = srcRect.top
  } else if (active.axis === 'y') {
    const srcRect = active.sourceItems[0].el.getBoundingClientRect()
    gx = srcRect.left
  }
  active.ghost!.style.transform = `translate(${gx}px, ${gy}px)`
  updateAutoScroll(e.clientX, e.clientY)

  const lists = listsUnderPoint(e.clientX, e.clientY)
  let candidate: RegisteredList | null = null
  let candidatePull: false | true | 'clone' = false
  for (const list of lists) {
    if (list.disabled()) continue
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

  if (!candidate) {
    if (active.currentList && active.currentList !== active.source) {
      const fromList = active.currentList
      const startIdx = active.currentStartIndex
      const count = COUNT(active)
      flipAround([fromList], () => batchRemove(fromList, startIdx, count))
      active.currentList = null
      active.currentStartIndex = -1
    }
    return
  }

  const isClone = candidatePull === 'clone'
  const count = COUNT(active)

  if (active.currentList === candidate) {
    const exclude = { start: active.currentStartIndex, count }
    const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, exclude)
    if (index !== active.currentStartIndex) {
      const fromStart = active.currentStartIndex
      const list = candidate
      flipAround([list], () => {
        const items: unknown[] = []
        for (let i = 0; i < count; i++) items.push(list.itemAt(fromStart))
        batchRemove(list, fromStart, count)
        batchInsert(list, index, items)
      })
      active.currentStartIndex = index
    }
    active.onMove({ pointerEvent: e, toList: candidate, toIndex: active.currentStartIndex, willInsertAfter: false })
    return
  }

  if (candidate === active.source) {
    const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, null)
    const items = active.sourceItems.map((s) => s.item)
    const previous = active.currentList
    const previousStart = active.currentStartIndex
    const flips = previous ? [previous, candidate] : [candidate]
    flipAround(flips, () => {
      if (previous) batchRemove(previous, previousStart, count)
      batchInsert(candidate!, index, items)
    })
    active.currentList = candidate
    active.currentStartIndex = index
    active.isClone = false
    active.onMove({ pointerEvent: e, toList: candidate, toIndex: index, willInsertAfter: false })
    return
  }

  const itemsForTarget = isClone
    ? active.sourceItems.map((s) =>
        active!.cloneFn ? active!.cloneFn(s.item) : structuredCloneSafe(s.item),
      )
    : active.sourceItems.map((s) => s.item)

  const { index: insertIndex } = computeTargetIndex(candidate, e.clientX, e.clientY, null)
  const previous = active.currentList
  const previousStart = active.currentStartIndex
  const removeFromPrevious = previous !== null && previous !== active.source

  const src = active.source
  const flips: RegisteredList[] = [candidate]
  if (previous && removeFromPrevious) flips.push(previous)
  if (!removeFromPrevious && !isClone && previous === src) flips.push(src)

  flipAround(flips, () => {
    if (removeFromPrevious && previous) batchRemove(previous, previousStart, count)
    if (!isClone && previous === src) batchRemove(src, previousStart, count)
    batchInsert(candidate!, insertIndex, itemsForTarget)
  })

  active.currentList = candidate
  active.currentStartIndex = insertIndex
  active.isClone = isClone
  active.onMove({ pointerEvent: e, toList: candidate, toIndex: insertIndex, willInsertAfter: false })
}

function onPointerUp(e: PointerEvent) {
  if (!active) return
  if (!active.thresholdCrossed) {
    teardown()
    return
  }
  // Dropped outside any valid target.
  if (active.currentList === null) {
    if (active.revertOnSpill) {
      void animateGhostBack().then(() => {
        const item = active!.sourceItems.map((s) => s.item)
        flipAround([active!.source], () => batchInsert(active!.source, active!.sourceItems[0].index, item))
        active!.onEnd({
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
      // Source items were already removed from the source array on first cross-list move.
      // Just emit end as a successful "spill removal".
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
  // revertClone: if we cloned into a target and that target is the source, animate back.
  // (Clone dropped on its own source — vuedraggable's revertClone behaviour.)
  if (
    active.revertClone &&
    active.isClone &&
    active.currentList === active.source
  ) {
    const fromList = active.source
    const fromIndex = active.currentStartIndex
    void animateGhostBack().then(() => {
      flipAround([fromList], () => batchRemove(fromList, fromIndex, COUNT(active!)))
      active!.onEnd({
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
  const pullMode: false | true | 'clone' = active.isClone ? 'clone' : true
  active.onEnd({
    cancelled: false,
    toList: active.currentList,
    toIndex: active.currentStartIndex,
    pullMode,
    originalEvent: e,
  })
  teardown()
}

function onPointerCancel(e: PointerEvent) {
  cancelDrag(e)
}

function animateGhostBack(): Promise<void> {
  if (!active?.ghost || !active.sourceItems[0].el.isConnected) return Promise.resolve()
  const rect = active.sourceItems[0].el.getBoundingClientRect()
  const ghost = active.ghost
  const ms = active.animationMs > 0 ? active.animationMs : 200
  const easing = active.easing
  return new Promise((resolve) => {
    const a = ghost.animate(
      [
        { transform: ghost.style.transform },
        { transform: `translate(${rect.left}px, ${rect.top}px)` },
      ],
      { duration: ms, easing, fill: 'forwards' },
    )
    a.onfinish = () => resolve()
    a.oncancel = () => resolve()
  })
}

function cancelDrag(e: PointerEvent | KeyboardEvent) {
  if (!active) return
  if (active.thresholdCrossed) {
    const count = COUNT(active)
    const restore = () => {
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
        const items: unknown[] = []
        const list = active.source
        flipAround([list], () => {
          for (let i = 0; i < count; i++) items.push(list.itemAt(fromStart))
          batchRemove(list, fromStart, count)
          batchInsert(list, toStart, items)
        })
      }
      active!.onEnd({
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
  teardown()
}

function teardown() {
  if (!active) return
  setPlaceholderStyle(active.sourceItems, false)
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
