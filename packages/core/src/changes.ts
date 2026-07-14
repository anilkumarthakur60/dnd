import type { ListChange } from './types'

/**
 * Pure helper — return a new array with one {@link ListChange} applied.
 * Framework bindings use this to turn engine changes into immutable state
 * updates.
 */
export function applyListChange<T>(items: readonly T[], change: ListChange<T>): T[] {
  const next = items.slice()
  switch (change.type) {
    case 'move': {
      const [it] = next.splice(change.from, 1)
      next.splice(change.to, 0, it)
      return next
    }
    case 'insert': {
      next.splice(change.index, 0, change.item)
      return next
    }
    case 'remove': {
      next.splice(change.index, 1)
      return next
    }
  }
}
