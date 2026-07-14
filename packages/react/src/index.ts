import {
  createElement,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { ForwardedRef, ReactElement, ReactNode, Ref } from 'react'
import { flushSync } from 'react-dom'
import { DndList, applyListChange } from '@anil-labs/dnd-core'
import type { DndListOptions, ItemKey, ListAdapter } from '@anil-labs/dnd-core'

export * from '@anil-labs/dnd-core'

export interface DraggableRenderContext<T = unknown> {
  item: T
  index: number
  /** `true` when the item is in the multi-drag selection. */
  selected: boolean
  /** `true` when the item is currently held in keyboard mode. */
  keyboardActive: boolean
}

/** Imperative handle exposed via `ref` on `<Draggable>`. */
export interface DraggableHandle<T = unknown> {
  move(from: number, to: number): void
  insertAt(index: number, item: T): void
  removeAt(index: number): T | undefined
  select(indices: number[]): void
  clearSelection(): void
  getSelection(): number[]
}

export interface DraggableProps<T = unknown> extends DndListOptions<T> {
  /** The list of items (controlled). */
  items: T[]
  /** Called with the next array on every change — set your state here. */
  onItemsChange: (items: T[]) => void
  /** Render one item. */
  renderItem: (context: DraggableRenderContext<T>) => ReactNode
  /** Stable key per item — strongly recommended. */
  itemKey?: ItemKey<T>
  /** Container tag. @default 'div' */
  tag?: string
  /** Item wrapper tag. @default 'div' */
  itemTag?: string
  /** Extra class for the container. */
  className?: string
  /** Extra class for every item wrapper. */
  itemClassName?: string
  /** Static content rendered before the items (not draggable). */
  header?: ReactNode
  /** Static content rendered after the items (not draggable). */
  footer?: ReactNode
}

function resolveKey<T>(itemKey: ItemKey<T> | undefined, item: T, index: number): string | number {
  if (itemKey == null) return index
  if (typeof itemKey === 'function') return itemKey(item, index)
  const value = (item as Record<PropertyKey, unknown>)[itemKey]
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * Wire the DndList engine to React state. The adapter applies engine changes
 * inside `flushSync` so the DOM is committed before FLIP measurements run.
 */
function useDndEngine<T>(
  items: T[],
  onItemsChange: (items: T[]) => void,
  options: DndListOptions<T>,
): {
  attach: (el: HTMLElement | null) => void
  list: () => DndList<T> | null
  selection: number[]
  keyboardIndex: number | null
} {
  const listRef = useRef<DndList<T> | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items
  const onItemsChangeRef = useRef(onItemsChange)
  onItemsChangeRef.current = onItemsChange

  const [selection, setSelection] = useState<number[]>([])
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null)

  const optionsRef = useRef<DndListOptions<T>>(options)
  optionsRef.current = {
    ...options,
    onSelectionChange: (event) => {
      setSelection(event.indices)
      options.onSelectionChange?.(event)
    },
    onKeyboardStateChange: (index) => {
      setKeyboardIndex(index)
      options.onKeyboardStateChange?.(index)
    },
  }

  const adapterRef = useRef<ListAdapter<T> | null>(null)
  if (!adapterRef.current) {
    adapterRef.current = {
      getItems: () => itemsRef.current,
      apply: (change) => {
        const next = applyListChange(itemsRef.current, change)
        itemsRef.current = next
        flushSync(() => onItemsChangeRef.current(next))
      },
      // flushSync above commits synchronously, so the DOM is already current.
      afterRender: (fn) => fn(),
    }
  }

  const attach = useCallback((el: HTMLElement | null): void => {
    if (listRef.current) {
      listRef.current.destroy()
      listRef.current = null
    }
    if (el) {
      listRef.current = new DndList<T>(el, optionsRef.current, adapterRef.current!)
    }
  }, [])

  // Keep engine options in sync with the latest props on every commit.
  useLayoutEffect(() => {
    listRef.current?.setOptions(optionsRef.current)
  })

  return { attach, list: () => listRef.current, selection, keyboardIndex }
}

function DraggableInner<T>(
  props: DraggableProps<T>,
  ref: ForwardedRef<DraggableHandle<T>>,
): ReactElement {
  const {
    items,
    onItemsChange,
    renderItem,
    itemKey,
    tag = 'div',
    itemTag = 'div',
    className,
    itemClassName,
    header,
    footer,
    ...options
  } = props

  const { attach, list, selection, keyboardIndex } = useDndEngine(items, onItemsChange, options)
  const selectedSet = new Set(selection)

  useImperativeHandle(
    ref,
    () => ({
      move: (from, to) => list()?.move(from, to),
      insertAt: (index, item) => list()?.insertAt(index, item),
      removeAt: (index) => list()?.removeAt(index),
      select: (indices) => list()?.select(indices),
      clearSelection: () => list()?.clearSelection(),
      getSelection: () => list()?.getSelection() ?? [],
    }),
    // `list` is a stable getter around a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const keyboard = options.keyboard ?? false
  const disabled = options.disabled ?? false
  const selectedClass = options.selectedClass ?? 'dnd-selected'

  const itemNodes = items.map((item, index) => {
    const selected = selectedSet.has(index)
    const keyboardActive = keyboardIndex === index
    return createElement(
      itemTag,
      {
        key: resolveKey(itemKey, item, index),
        'data-dnd-index': index,
        className: classNames(
          'dnd-item',
          selected && selectedClass,
          keyboardActive && 'dnd-keyboard-active',
          itemClassName,
        ),
        tabIndex: keyboard && !disabled ? 0 : undefined,
        role: keyboard ? 'option' : undefined,
        'aria-grabbed': keyboard && keyboardActive ? 'true' : undefined,
        'aria-posinset': keyboard ? index + 1 : undefined,
        'aria-setsize': keyboard ? items.length : undefined,
      },
      renderItem({ item, index, selected, keyboardActive }),
    )
  })

  return createElement(
    tag,
    { ref: attach, className: classNames('dnd-container', className) },
    header,
    itemNodes,
    footer,
  )
}

/**
 * Controlled sortable list.
 *
 * ```tsx
 * const [items, setItems] = useState([{ id: 1, name: 'Apple' }])
 *
 * <Draggable
 *   items={items}
 *   onItemsChange={setItems}
 *   itemKey="id"
 *   animation={200}
 *   renderItem={({ item }) => <div className="card">{item.name}</div>}
 * />
 * ```
 */
export const Draggable = forwardRef(
  DraggableInner as (
    props: DraggableProps<unknown>,
    ref: ForwardedRef<DraggableHandle<unknown>>,
  ) => ReactElement,
) as <T = unknown>(props: DraggableProps<T> & { ref?: Ref<DraggableHandle<T>> }) => ReactElement

export interface UseDraggableResult<T = unknown> {
  /** Attach to the container element: `<ul ref={dnd.ref}>`. */
  ref: (el: HTMLElement | null) => void
  /** Spread onto each item element (index, classes, a11y attributes). */
  itemProps: (index: number) => Record<string, string | number | undefined>
  /** Indices currently in the multi-drag selection. */
  selection: number[]
  /** Index currently held in keyboard mode, or `null`. */
  keyboardIndex: number | null
  move(from: number, to: number): void
  insertAt(index: number, item: T): void
  removeAt(index: number): T | undefined
  select(indices: number[]): void
  clearSelection(): void
  getSelection(): number[]
}

/**
 * Headless hook — you render the list, the engine handles the drags.
 *
 * ```tsx
 * const dnd = useDraggable(items, setItems, { animation: 200 })
 *
 * <ul ref={dnd.ref}>
 *   {items.map((item, i) => (
 *     <li key={item.id} {...dnd.itemProps(i)}>{item.name}</li>
 *   ))}
 * </ul>
 * ```
 */
export function useDraggable<T>(
  items: T[],
  onItemsChange: (items: T[]) => void,
  options: DndListOptions<T> = {},
): UseDraggableResult<T> {
  const { attach, list, selection, keyboardIndex } = useDndEngine(items, onItemsChange, options)
  const selectedSet = new Set(selection)
  const keyboard = options.keyboard ?? false
  const disabled = options.disabled ?? false
  const selectedClass = options.selectedClass ?? 'dnd-selected'

  const itemProps = (index: number): Record<string, string | number | undefined> => ({
    'data-dnd-index': index,
    className: classNames(
      'dnd-item',
      selectedSet.has(index) && selectedClass,
      keyboardIndex === index && 'dnd-keyboard-active',
    ),
    tabIndex: keyboard && !disabled ? 0 : undefined,
    role: keyboard ? 'option' : undefined,
    'aria-grabbed': keyboard && keyboardIndex === index ? 'true' : undefined,
    'aria-posinset': keyboard ? index + 1 : undefined,
    'aria-setsize': keyboard ? items.length : undefined,
  })

  return {
    ref: attach,
    itemProps,
    selection,
    keyboardIndex,
    move: (from, to) => list()?.move(from, to),
    insertAt: (index, item) => list()?.insertAt(index, item),
    removeAt: (index) => list()?.removeAt(index),
    select: (indices) => list()?.select(indices),
    clearSelection: () => list()?.clearSelection(),
    getSelection: () => list()?.getSelection() ?? [],
  }
}
