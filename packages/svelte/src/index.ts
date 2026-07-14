import { tick } from 'svelte'
import { DndList, applyListChange } from '@anil-labs/dnd-core'
import type { DndListOptions } from '@anil-labs/dnd-core'

export * from '@anil-labs/dnd-core'

export interface DraggableActionOptions<T = unknown> extends DndListOptions<T> {
  /** The array backing the list (must match the rendered `{#each}`). */
  items: T[]
  /** Called with the next array on every change — reassign your state here. */
  onItemsChange: (items: T[]) => void
}

export interface DraggableActionReturn<T = unknown> {
  update(options: DraggableActionOptions<T>): void
  destroy(): void
}

/**
 * Svelte action — you render the list, the engine handles the drags. Items
 * must be keyed direct children carrying `data-dnd-index` and the `dnd-item`
 * class:
 *
 * ```svelte
 * <script>
 *   import { draggable } from '@anil-labs/dnd-svelte'
 *   import '@anil-labs/dnd-core/styles.css'
 *
 *   let items = $state([{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }])
 * </script>
 *
 * <ul use:draggable={{ items, onItemsChange: (v) => (items = v), animation: 200 }}>
 *   {#each items as item, i (item.id)}
 *     <li data-dnd-index={i} class="dnd-item">{item.name}</li>
 *   {/each}
 * </ul>
 * ```
 *
 * Works with Svelte 4 stores and Svelte 5 runes alike — the action only needs
 * `items` plus a callback that reassigns them.
 */
export function draggable<T>(
  node: HTMLElement,
  options: DraggableActionOptions<T>,
): DraggableActionReturn<T> {
  let current = options
  // Internal mirror so batched engine changes see each other synchronously,
  // even before Svelte re-renders and calls `update`.
  let items = [...options.items]

  const toListOptions = (opts: DraggableActionOptions<T>): DndListOptions<T> => {
    const { items: _items, onItemsChange: _onItemsChange, ...rest } = opts
    return rest
  }

  const list = new DndList<T>(node, toListOptions(current), {
    getItems: () => items,
    apply: (change) => {
      items = applyListChange(items, change)
      current.onItemsChange(items)
    },
    afterRender: (fn) => {
      void tick().then(fn)
    },
  })

  return {
    update(next: DraggableActionOptions<T>) {
      current = next
      if (next.items !== items) items = [...next.items]
      list.setOptions(toListOptions(next))
    },
    destroy() {
      list.destroy()
    },
  }
}
