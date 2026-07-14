import { createEffect, createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'
import { DndList, applyListChange } from '@anil-labs/dnd-core'
import type { DndListOptions } from '@anil-labs/dnd-core'

export * from '@anil-labs/dnd-core'

export interface CreateDraggableResult<T = unknown> {
  /** Attach to the container element: `<ul ref={dnd.ref}>`. */
  ref: (el: HTMLElement) => void
  /** Spread onto each item element: `<li {...dnd.itemProps(i())}>`. */
  itemProps: (index: number) => Record<string, string | number | undefined>
  /** Indices currently in the multi-drag selection. */
  selection: Accessor<number[]>
  /** Index currently held in keyboard mode, or `null`. */
  keyboardIndex: Accessor<number | null>
  move(from: number, to: number): void
  insertAt(index: number, item: T): void
  removeAt(index: number): T | undefined
  select(indices: number[]): void
  clearSelection(): void
  getSelection(): number[]
}

/**
 * Solid primitive — you render the list, the engine handles the drags.
 *
 * ```tsx
 * import { createSignal, For } from 'solid-js'
 * import { createDraggable } from '@anil-labs/dnd-solid'
 * import '@anil-labs/dnd-core/styles.css'
 *
 * const [items, setItems] = createSignal([{ id: 1, name: 'Apple' }])
 * const dnd = createDraggable(items, setItems, () => ({ animation: 200 }))
 *
 * <ul ref={dnd.ref}>
 *   <For each={items()}>
 *     {(item, i) => <li {...dnd.itemProps(i())}>{item.name}</li>}
 *   </For>
 * </ul>
 * ```
 */
export function createDraggable<T>(
  items: Accessor<T[]>,
  setItems: (items: T[]) => void,
  options: Accessor<DndListOptions<T>> | DndListOptions<T> = {},
): CreateDraggableResult<T> {
  const getOptions = typeof options === 'function' ? options : () => options
  const [selection, setSelection] = createSignal<number[]>([])
  const [keyboardIndex, setKeyboardIndex] = createSignal<number | null>(null)

  let list: DndList<T> | null = null

  const buildOptions = (): DndListOptions<T> => {
    const user = getOptions()
    return {
      ...user,
      onSelectionChange: (event) => {
        setSelection(event.indices)
        user.onSelectionChange?.(event)
      },
      onKeyboardStateChange: (index) => {
        setKeyboardIndex(index)
        user.onKeyboardStateChange?.(index)
      },
    }
  }

  const adapter = {
    getItems: () => items(),
    apply: (change: Parameters<typeof applyListChange<T>>[1]) => {
      setItems(applyListChange(items(), change))
    },
    // Solid commits DOM updates synchronously outside batch().
    afterRender: (fn: () => void) => fn(),
  }

  const ref = (el: HTMLElement): void => {
    list?.destroy()
    list = new DndList<T>(el, buildOptions(), adapter)
  }

  createEffect(() => {
    const next = buildOptions()
    list?.setOptions(next)
  })

  onCleanup(() => {
    list?.destroy()
    list = null
  })

  const itemProps = (index: number): Record<string, string | number | undefined> => {
    const user = getOptions()
    const keyboard = user.keyboard ?? false
    const disabled = user.disabled ?? false
    const selectedClass = user.selectedClass ?? 'dnd-selected'
    const selected = selection().includes(index)
    const keyboardActive = keyboardIndex() === index
    const classes = ['dnd-item']
    if (selected) classes.push(selectedClass)
    if (keyboardActive) classes.push('dnd-keyboard-active')
    return {
      'data-dnd-index': index,
      class: classes.join(' '),
      tabindex: keyboard && !disabled ? 0 : undefined,
      role: keyboard ? 'option' : undefined,
      'aria-grabbed': keyboard && keyboardActive ? 'true' : undefined,
      'aria-posinset': keyboard ? index + 1 : undefined,
      'aria-setsize': keyboard ? items().length : undefined,
    }
  }

  return {
    ref,
    itemProps,
    selection,
    keyboardIndex,
    move: (from, to) => list?.move(from, to),
    insertAt: (index, item) => list?.insertAt(index, item),
    removeAt: (index) => list?.removeAt(index),
    select: (indices) => list?.select(indices),
    clearSelection: () => list?.clearSelection(),
    getSelection: () => list?.getSelection() ?? [],
  }
}
