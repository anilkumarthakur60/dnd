import { nextTick } from 'vue'
import type { RegisteredList } from './registry'
import { listsUnderPoint, resolvePull, resolvePut } from './registry'
import { snapshot, play } from './flip'
import { startAutoScroll, updateAutoScroll, stopAutoScroll } from './autoScroll'

export interface BeginDragOptions {
  source: RegisteredList
  sourceIndex: number
  sourceItem: unknown
  sourceEl: HTMLElement
  pointerEvent: PointerEvent
  animationMs: number
  thresholdPx: number
  cloneFn?: (item: unknown) => unknown
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
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
  currentList: RegisteredList | null
  currentIndex: number
  cloneItem: unknown | null
  startedAt: number
  startX: number
  startY: number
}

let active: Active | null = null

export function beginDrag(opts: BeginDragOptions) {
  if (active) return
  active = {
    ...opts,
    thresholdCrossed: false,
    ghost: null,
    ghostOffsetX: 0,
    ghostOffsetY: 0,
    currentList: opts.source,
    currentIndex: opts.sourceIndex,
    cloneItem: null,
    startedAt: performance.now(),
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

function makeGhost(sourceEl: HTMLElement, clientX: number, clientY: number) {
  const rect = sourceEl.getBoundingClientRect()
  const clone = sourceEl.cloneNode(true) as HTMLElement
  clone.removeAttribute('data-vue-dnd-index')
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '0'
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.pointerEvents = 'none'
  clone.style.zIndex = '99999'
  clone.style.margin = '0'
  clone.style.transition = 'none'
  clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  clone.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'
  clone.style.opacity = '0.95'
  clone.classList.add('vue-dnd-ghost')
  if (active?.dragClass) clone.classList.add(active.dragClass)
  document.body.appendChild(clone)
  active!.ghostOffsetX = clientX - rect.left
  active!.ghostOffsetY = clientY - rect.top
  return clone
}

function setSourcePlaceholderStyle(list: RegisteredList, index: number, on: boolean) {
  const items = list.getItems()
  const el = items[index]
  if (!el) return
  if (on) {
    el.classList.add('vue-dnd-placeholder')
    if (active?.ghostClass) el.classList.add(active.ghostClass)
  } else {
    el.classList.remove('vue-dnd-placeholder')
    if (active?.ghostClass) el.classList.remove(active.ghostClass)
  }
}

function detectAxis(list: RegisteredList): 'x' | 'y' {
  const items = list.getItems()
  if (items.length < 2) {
    const el = items[0] ?? list.el
    const cs = getComputedStyle(el?.parentElement ?? list.el)
    if (cs.display.includes('flex') && cs.flexDirection.startsWith('row')) return 'x'
    if (cs.display === 'inline' || cs.display === 'inline-block' || cs.display === 'table-row' || el?.tagName === 'TH' || el?.tagName === 'TD') return 'x'
    return 'y'
  }
  const a = items[0].getBoundingClientRect()
  const b = items[1].getBoundingClientRect()
  return Math.abs(b.left - a.left) > Math.abs(b.top - a.top) ? 'x' : 'y'
}

function computeTargetIndex(list: RegisteredList, x: number, y: number, excludeIndex: number | null): { index: number; insertAfter: boolean } {
  const items = list.getItems()
  if (items.length === 0) return { index: 0, insertAfter: false }
  const axis = detectAxis(list)
  for (let i = 0; i < items.length; i++) {
    if (i === excludeIndex) continue
    const rect = items[i].getBoundingClientRect()
    if (axis === 'y') {
      const mid = rect.top + rect.height / 2
      if (y < mid) {
        return { index: excludeIndex !== null && i > excludeIndex ? i - 1 : i, insertAfter: false }
      }
    } else {
      const mid = rect.left + rect.width / 2
      if (x < mid) {
        return { index: excludeIndex !== null && i > excludeIndex ? i - 1 : i, insertAfter: false }
      }
    }
  }
  const tail = excludeIndex !== null ? items.length - 1 : items.length
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
  nextTick(() => play(snap, active!.animationMs))
}

function onPointerMove(e: PointerEvent) {
  if (!active) return

  if (!active.thresholdCrossed) {
    const dx = e.clientX - active.startX
    const dy = e.clientY - active.startY
    if (Math.hypot(dx, dy) < active.thresholdPx) return
    active.thresholdCrossed = true
    active.ghost = makeGhost(active.sourceEl, e.clientX, e.clientY)
    setSourcePlaceholderStyle(active.source, active.sourceIndex, true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    startAutoScroll(e.clientX, e.clientY)
    active.onStart(e)
  }

  e.preventDefault()
  active.ghost!.style.transform = `translate(${e.clientX - active.ghostOffsetX}px, ${e.clientY - active.ghostOffsetY}px)`
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
      const fromIndex = active.currentIndex
      flipAround([fromList], () => {
        fromList.applyChange({ type: 'remove', index: fromIndex })
      })
      active.currentList = null
      active.currentIndex = -1
      active.cloneItem = null
    } else if (active.currentList === active.source && candidatePull !== 'clone') {
      // pointer left the source completely while moving: keep item in source for now, do nothing
    }
    return
  }

  const isClone = candidatePull === 'clone'
  const sourceListHasItem = active.currentList === active.source

  if (active.currentList === candidate) {
    if (isClone && candidate !== active.source) {
      const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, active.currentIndex)
      if (index !== active.currentIndex) {
        const from = active.currentIndex
        flipAround([candidate], () => {
          candidate!.applyChange({ type: 'move', from, to: index })
        })
        active.currentIndex = index
      }
    } else if (candidate === active.source && sourceListHasItem) {
      const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, active.currentIndex)
      if (index !== active.currentIndex) {
        const from = active.currentIndex
        flipAround([candidate], () => {
          candidate!.applyChange({ type: 'move', from, to: index })
        })
        active.currentIndex = index
      }
    } else if (candidate !== active.source) {
      const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, active.currentIndex)
      if (index !== active.currentIndex) {
        const from = active.currentIndex
        flipAround([candidate], () => {
          candidate!.applyChange({ type: 'move', from, to: index })
        })
        active.currentIndex = index
      }
    }
    active.onMove({ pointerEvent: e, toList: candidate, toIndex: active.currentIndex, willInsertAfter: false })
    return
  }

  if (candidate === active.source) {
    const { index } = computeTargetIndex(candidate, e.clientX, e.clientY, null)
    const item = active.sourceItem
    const previous = active.currentList
    const previousIndex = active.currentIndex
    const lists = previous ? [previous, candidate] : [candidate]
    flipAround(lists, () => {
      if (previous) previous.applyChange({ type: 'remove', index: previousIndex })
      candidate!.applyChange({ type: 'insert', index, item })
    })
    active.currentList = candidate
    active.currentIndex = index
    active.cloneItem = null
    active.onMove({ pointerEvent: e, toList: candidate, toIndex: index, willInsertAfter: false })
    return
  }

  const itemForTarget = isClone
    ? (active.cloneFn ? active.cloneFn(active.sourceItem) : structuredCloneSafe(active.sourceItem))
    : active.sourceItem

  const { index: insertIndex } = computeTargetIndex(candidate, e.clientX, e.clientY, null)
  const previous = active.currentList
  const previousIndex = active.currentIndex
  const removeFromPrevious = previous !== null && previous !== active.source

  const src = active.source
  const flipLists: RegisteredList[] = [candidate]
  if (previous && removeFromPrevious) flipLists.push(previous)
  if (!removeFromPrevious && !isClone && previous === src) flipLists.push(src)

  flipAround(flipLists, () => {
    if (removeFromPrevious && previous) previous.applyChange({ type: 'remove', index: previousIndex })
    if (!isClone && previous === src) src.applyChange({ type: 'remove', index: previousIndex })
    candidate!.applyChange({ type: 'insert', index: insertIndex, item: itemForTarget })
  })

  active.currentList = candidate
  active.currentIndex = insertIndex
  active.cloneItem = isClone ? itemForTarget : null
  active.onMove({ pointerEvent: e, toList: candidate, toIndex: insertIndex, willInsertAfter: false })
}

function structuredCloneSafe(v: unknown): unknown {
  try {
    return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v))
  } catch {
    return JSON.parse(JSON.stringify(v))
  }
}

function onPointerUp(e: PointerEvent) {
  if (!active) return
  if (!active.thresholdCrossed) {
    teardown()
    return
  }
  const pullMode: false | true | 'clone' = active.cloneItem !== null ? 'clone' : true
  const info: EndInfo = {
    cancelled: false,
    toList: active.currentList,
    toIndex: active.currentIndex,
    pullMode,
    originalEvent: e,
  }
  active.onEnd(info)
  teardown()
}

function onPointerCancel(e: PointerEvent) {
  cancelDrag(e)
}

function cancelDrag(e: PointerEvent | KeyboardEvent) {
  if (!active) return
  if (active.thresholdCrossed) {
    if (active.cloneItem !== null && active.currentList && active.currentList !== active.source) {
      const fromList = active.currentList
      const fromIndex = active.currentIndex
      flipAround([fromList], () => fromList.applyChange({ type: 'remove', index: fromIndex }))
    } else if (active.currentList !== active.source) {
      const previous = active.currentList
      const previousIndex = active.currentIndex
      const restoreIndex = active.sourceIndex
      const item = active.sourceItem
      const lists = previous ? [previous, active.source] : [active.source]
      flipAround(lists, () => {
        if (previous) previous.applyChange({ type: 'remove', index: previousIndex })
        active!.source.applyChange({ type: 'insert', index: restoreIndex, item })
      })
    } else if (active.currentIndex !== active.sourceIndex) {
      const from = active.currentIndex
      const to = active.sourceIndex
      flipAround([active.source], () => active!.source.applyChange({ type: 'move', from, to }))
    }
    active.onEnd({
      cancelled: true,
      toList: null,
      toIndex: -1,
      pullMode: false,
      originalEvent: e,
    })
  }
  teardown()
}

function teardown() {
  if (!active) return
  setSourcePlaceholderStyle(active.source, active.sourceIndex, false)
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
