import type { DragGroup, DragGroupObject, ListChange } from './types'

/**
 * Internal contract between a list (a `DndList` or vanilla sortable) and the
 * shared drag controller. All accessors are closures so option changes apply
 * live during a drag.
 */
export interface RegisteredList {
  id: number
  el: HTMLElement
  group: DragGroupObject
  disabled: () => boolean
  sortEnabled: () => boolean
  getItems: () => HTMLElement[]
  listRef: () => readonly unknown[]
  applyChange: (change: ListChange) => void
  itemAt: (index: number) => unknown
  emptyInsertThreshold: () => number
  rtl: () => boolean
  afterRender: (fn: () => void) => void
}

let _id = 0

const registry = new Set<RegisteredList>()

export function register(list: Omit<RegisteredList, 'id'>): RegisteredList {
  const entry = { ...list, id: ++_id }
  registry.add(entry)
  return entry
}

export function unregister(entry: RegisteredList): void {
  registry.delete(entry)
}

/** Registered lists whose element is under the given viewport point, topmost first. */
export function listsUnderPoint(x: number, y: number): RegisteredList[] {
  const els = document.elementsFromPoint(x, y) as HTMLElement[]
  const matches: RegisteredList[] = []
  const seen = new Set<RegisteredList>()
  for (const el of els) {
    for (const entry of registry) {
      if (!seen.has(entry) && (entry.el === el || entry.el.contains(el))) {
        seen.add(entry)
        matches.push(entry)
      }
    }
  }
  // Extend with empty lists whose bounds (inflated by emptyInsertThreshold) contain the point.
  for (const entry of registry) {
    if (seen.has(entry)) continue
    const threshold = entry.emptyInsertThreshold()
    if (threshold <= 0) continue
    if (entry.getItems().length > 0) continue
    const r = entry.el.getBoundingClientRect()
    if (
      x >= r.left - threshold &&
      x <= r.right + threshold &&
      y >= r.top - threshold &&
      y <= r.bottom + threshold
    ) {
      seen.add(entry)
      matches.push(entry)
    }
  }
  return matches
}

export function normalizeGroup(group: DragGroup | undefined): DragGroupObject {
  if (!group) return { name: '__default__', pull: true, put: true }
  if (typeof group === 'string') return { name: group, pull: true, put: true }
  return { pull: true, put: true, ...group }
}

export function resolvePull(from: RegisteredList, to: RegisteredList): false | true | 'clone' {
  const pull = from.group.pull
  const toCtx = { name: to.group.name, el: to.el }
  const fromCtx = { name: from.group.name, el: from.el }
  if (typeof pull === 'function') {
    const r = pull(toCtx, fromCtx)
    return r === undefined ? true : r
  }
  if (Array.isArray(pull)) return pull.includes(to.group.name)
  // Boolean modes transfer only between lists sharing a group name; arrays and
  // functions above opt into cross-name transfers explicitly.
  const sameName = from.group.name === to.group.name
  if (pull === undefined || pull === true) return sameName
  if (pull === 'clone') return sameName ? 'clone' : false
  return false
}

export function resolvePut(from: RegisteredList, to: RegisteredList): boolean {
  const put = to.group.put
  const toCtx = { name: to.group.name, el: to.el }
  const fromCtx = { name: from.group.name, el: from.el }
  if (typeof put === 'function') {
    const r = put(toCtx, fromCtx)
    return r === undefined ? true : !!r
  }
  if (Array.isArray(put)) return put.includes(from.group.name)
  if (put === undefined || put === true) return from.group.name === to.group.name
  return false
}
