import {
  TransitionGroup,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type App,
  type PropType,
  type Ref,
  type VNode,
} from 'vue'
import { DndList, applyListChange } from '@anil-labs/dnd-core'
import type {
  ChangePayload,
  ChooseEvent,
  CloneFn,
  DndAxis,
  DndDirection,
  DndListOptions,
  DragEndEvent,
  DragGroup,
  DragMoveEvent,
  DragStartEvent,
  GhostFactory,
  ItemKey,
  KeyboardMoveEvent,
  SelectionChangeEvent,
} from '@anil-labs/dnd-core'

export * from '@anil-labs/dnd-core'

/** Methods exposed on the `<Draggable>` template ref. */
export interface DraggableExpose<T = unknown> {
  /** Move an item from one index to another (emits `update:modelValue`). */
  move(from: number, to: number): void
  /** Insert an item at an index (clamped to the list length). */
  insertAt(index: number, item: T): void
  /** Remove an item by index; returns the removed item. */
  removeAt(index: number): T | undefined
  /** Set the multi-drag selection by index. */
  select(indices: number[]): void
  /** Clear the multi-drag selection. */
  clearSelection(): void
  /** Read the current multi-drag selection. */
  getSelection(): number[]
}

export interface DraggableSlotProps<T = unknown> {
  /** The item being rendered (alias of `item`, kept for vue-dnd compatibility). */
  element: T
  item: T
  index: number
  selected: boolean
}

export interface DraggableProps<T = unknown> {
  /** The list of items. Use `v-model`. */
  modelValue: T[]
  group?: DragGroup
  sort?: boolean
  disabled?: boolean
  animation?: number
  easing?: string
  handle?: string
  filter?: string
  preventOnFilter?: boolean
  draggable?: string
  /** Tag for the container element. @default 'div' */
  tag?: string
  /** Tag for each item wrapper. @default 'div' */
  itemTag?: string
  /** Stable key per item — strongly recommended. */
  itemKey?: ItemKey<T>
  clone?: CloneFn<T>
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  selectedClass?: string
  delay?: number
  delayOnTouchOnly?: boolean
  touchStartThreshold?: number
  axis?: DndAxis
  direction?: DndDirection
  swap?: boolean
  swapThreshold?: number
  invertSwap?: boolean
  ghostFactory?: GhostFactory<T>
  revertOnSpill?: boolean
  removeOnSpill?: boolean
  revertClone?: boolean
  scrollDisabled?: boolean
  scrollSpeed?: number
  scrollSensitivity?: number
  emptyInsertThreshold?: number
  dragMaxItems?: number
  rtl?: boolean
  multiDrag?: boolean
  keyboard?: boolean
  ariaLabel?: string
  /** Vue `<TransitionGroup>` name; when set, items animate in/out. */
  transitionName?: string
  'onUpdate:modelValue'?: (value: T[]) => void
  onStart?: (event: DragStartEvent<T>) => void
  onEnd?: (event: DragEndEvent<T>) => void
  onMove?: (event: DragMoveEvent<T>) => void
  onAdd?: (event: { item: T; newIndex: number }) => void
  onRemove?: (event: { item: T; oldIndex: number }) => void
  onUpdate?: (event: { item: T; oldIndex: number; newIndex: number }) => void
  onChange?: (event: ChangePayload<T>) => void
  onChoose?: (event: ChooseEvent<T>) => void
  onUnchoose?: (event: ChooseEvent<T>) => void
  onSelectionChange?: (event: SelectionChangeEvent<T>) => void
  onKeyboardMove?: (event: KeyboardMoveEvent<T>) => void
}

const DraggableImpl = defineComponent({
  name: 'Draggable',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, required: true },
    group: { type: [String, Object] as PropType<DragGroup>, default: undefined },
    sort: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    animation: { type: Number, default: 200 },
    easing: { type: String, default: undefined },
    handle: { type: String, default: undefined },
    filter: { type: String, default: undefined },
    preventOnFilter: { type: Boolean, default: true },
    draggable: { type: String, default: undefined },
    tag: { type: String, default: 'div' },
    itemTag: { type: String, default: 'div' },
    itemKey: {
      type: [String, Number, Symbol, Function] as PropType<ItemKey<unknown>>,
      default: undefined,
    },
    clone: { type: Function as PropType<CloneFn<unknown>>, default: undefined },
    ghostClass: { type: String, default: undefined },
    chosenClass: { type: String, default: undefined },
    dragClass: { type: String, default: undefined },
    selectedClass: { type: String, default: 'dnd-selected' },
    delay: { type: Number, default: 0 },
    delayOnTouchOnly: { type: Boolean, default: true },
    touchStartThreshold: { type: Number, default: 5 },
    axis: { type: String as PropType<Exclude<DndAxis, null>>, default: undefined },
    direction: { type: String as PropType<DndDirection>, default: 'auto' },
    swap: { type: Boolean, default: false },
    swapThreshold: { type: Number, default: 1 },
    invertSwap: { type: Boolean, default: false },
    ghostFactory: { type: Function as PropType<GhostFactory<unknown>>, default: undefined },
    revertOnSpill: { type: Boolean, default: false },
    removeOnSpill: { type: Boolean, default: false },
    revertClone: { type: Boolean, default: false },
    scrollDisabled: { type: Boolean, default: false },
    scrollSpeed: { type: Number, default: 18 },
    scrollSensitivity: { type: Number, default: 48 },
    emptyInsertThreshold: { type: Number, default: 5 },
    dragMaxItems: { type: Number, default: 0 },
    rtl: { type: Boolean, default: undefined },
    multiDrag: { type: Boolean, default: false },
    keyboard: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined },
    transitionName: { type: String, default: undefined },
  },
  emits: {
    'update:modelValue': (_value: unknown[]) => true,
    start: (_event: DragStartEvent) => true,
    end: (_event: DragEndEvent) => true,
    move: (_event: DragMoveEvent) => true,
    add: (_event: { item: unknown; newIndex: number }) => true,
    remove: (_event: { item: unknown; oldIndex: number }) => true,
    update: (_event: { item: unknown; oldIndex: number; newIndex: number }) => true,
    change: (_event: ChangePayload) => true,
    choose: (_event: ChooseEvent) => true,
    unchoose: (_event: ChooseEvent) => true,
    'selection-change': (_event: SelectionChangeEvent) => true,
    'keyboard-move': (_event: KeyboardMoveEvent) => true,
  },
  setup(props, { emit, slots, expose }) {
    const internal = shallowRef<unknown[]>([...props.modelValue])
    const selection = shallowRef<number[]>([])
    const kbIndex = shallowRef<number | null>(null)
    const containerEl = shallowRef<HTMLElement | null>(null)

    let list: DndList<unknown> | null = null

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== internal.value) internal.value = [...value]
      },
    )

    const buildOptions = (): DndListOptions<unknown> => ({
      group: props.group,
      sort: props.sort,
      disabled: props.disabled,
      animation: props.animation,
      easing: props.easing,
      handle: props.handle,
      filter: props.filter,
      preventOnFilter: props.preventOnFilter,
      draggable: props.draggable,
      ghostClass: props.ghostClass,
      chosenClass: props.chosenClass,
      dragClass: props.dragClass,
      selectedClass: props.selectedClass,
      delay: props.delay,
      delayOnTouchOnly: props.delayOnTouchOnly,
      touchStartThreshold: props.touchStartThreshold,
      axis: props.axis ?? null,
      direction: props.direction,
      swap: props.swap,
      swapThreshold: props.swapThreshold,
      invertSwap: props.invertSwap,
      ghostFactory: props.ghostFactory,
      clone: props.clone,
      revertOnSpill: props.revertOnSpill,
      removeOnSpill: props.removeOnSpill,
      revertClone: props.revertClone,
      scrollSpeed: props.scrollSpeed,
      scrollSensitivity: props.scrollSensitivity,
      scrollDisabled: props.scrollDisabled,
      emptyInsertThreshold: props.emptyInsertThreshold,
      dragMaxItems: props.dragMaxItems,
      rtl: props.rtl,
      multiDrag: props.multiDrag,
      keyboard: props.keyboard,
      ariaLabel: props.ariaLabel,
      onStart: (e) => emit('start', e),
      onEnd: (e) => emit('end', e),
      onMove: (e) => emit('move', e),
      onAdd: (e) => emit('add', e),
      onRemove: (e) => emit('remove', e),
      onUpdate: (e) => emit('update', e),
      onChange: (e) => emit('change', e),
      onChoose: (e) => emit('choose', e),
      onUnchoose: (e) => emit('unchoose', e),
      onSelectionChange: (e) => {
        selection.value = e.indices
        emit('selection-change', e)
      },
      onKeyboardMove: (e) => emit('keyboard-move', e),
      onKeyboardStateChange: (index) => {
        kbIndex.value = index
      },
    })

    const adapter = {
      getItems: () => internal.value,
      apply: (change: Parameters<typeof applyListChange<unknown>>[1]) => {
        const next = applyListChange(internal.value, change)
        internal.value = next
        emit('update:modelValue', next)
      },
      afterRender: (fn: () => void) => {
        void nextTick(fn)
      },
    }

    const createList = (el: HTMLElement): void => {
      list?.destroy()
      list = new DndList(el, buildOptions(), adapter)
    }

    onMounted(() => {
      if (containerEl.value) createList(containerEl.value)
    })

    // The rendered root changes when `transitionName` toggles — rebind then.
    watch(containerEl, (el, prev) => {
      if (el && el !== prev && list) createList(el)
    })

    watch(
      () => [
        props.group,
        props.sort,
        props.disabled,
        props.animation,
        props.easing,
        props.handle,
        props.filter,
        props.preventOnFilter,
        props.draggable,
        props.ghostClass,
        props.chosenClass,
        props.dragClass,
        props.selectedClass,
        props.delay,
        props.delayOnTouchOnly,
        props.touchStartThreshold,
        props.axis,
        props.direction,
        props.swap,
        props.swapThreshold,
        props.invertSwap,
        props.ghostFactory,
        props.clone,
        props.revertOnSpill,
        props.removeOnSpill,
        props.revertClone,
        props.scrollSpeed,
        props.scrollSensitivity,
        props.scrollDisabled,
        props.emptyInsertThreshold,
        props.dragMaxItems,
        props.rtl,
        props.multiDrag,
        props.keyboard,
        props.ariaLabel,
      ],
      () => list?.setOptions(buildOptions()),
    )

    onBeforeUnmount(() => {
      list?.destroy()
      list = null
    })

    const setContainer = (ref: unknown): void => {
      const el =
        ref instanceof HTMLElement
          ? ref
          : ((ref as { $el?: unknown } | null)?.$el as HTMLElement | undefined)
      containerEl.value = el instanceof HTMLElement ? el : null
    }

    const resolveKey = (item: unknown, index: number): string | number => {
      const key = props.itemKey
      if (key == null) return index
      if (typeof key === 'function') return key(item, index)
      const value = (item as Record<PropertyKey, unknown>)[key]
      return typeof value === 'string' || typeof value === 'number' ? value : index
    }

    expose({
      move: (from: number, to: number) => list?.move(from, to),
      insertAt: (index: number, item: unknown) => list?.insertAt(index, item),
      removeAt: (index: number) => list?.removeAt(index),
      select: (indices: number[]) => list?.select(indices),
      clearSelection: () => list?.clearSelection(),
      getSelection: () => list?.getSelection() ?? [],
    })

    return () => {
      const selected = new Set(selection.value)
      const itemNodes = internal.value.map((item, index) =>
        h(
          props.itemTag,
          {
            key: resolveKey(item, index),
            'data-dnd-index': index,
            class: [
              'dnd-item',
              {
                [props.selectedClass]: selected.has(index),
                'dnd-keyboard-active': kbIndex.value === index,
              },
            ],
            tabindex: props.keyboard && !props.disabled ? 0 : undefined,
            role: props.keyboard ? 'option' : undefined,
            'aria-grabbed': props.keyboard && kbIndex.value === index ? 'true' : undefined,
            'aria-posinset': props.keyboard ? index + 1 : undefined,
            'aria-setsize': props.keyboard ? internal.value.length : undefined,
          },
          slots.item
            ? slots.item({ element: item, item, index, selected: selected.has(index) })
            : String(item),
        ),
      )

      if (props.transitionName) {
        return h(
          TransitionGroup,
          {
            ref: setContainer,
            tag: props.tag,
            name: props.transitionName,
            class: 'dnd-container',
          },
          { default: () => itemNodes },
        )
      }
      return h(props.tag, { ref: setContainer, class: 'dnd-container' }, [
        slots.header?.(),
        ...itemNodes,
        slots.footer?.(),
      ])
    }
  },
})

/**
 * Sortable list component. Renders `modelValue` via the `#item` slot and emits
 * every change through `v-model` — your array is never mutated in place.
 *
 * ```vue
 * <Draggable v-model="items" item-key="id" :animation="200" group="tasks">
 *   <template #item="{ element }">
 *     <div class="card">{{ element.name }}</div>
 *   </template>
 * </Draggable>
 * ```
 */
export const Draggable = DraggableImpl as unknown as new <T = unknown>(
  props: DraggableProps<T>,
) => {
  $props: DraggableProps<T>
  $slots: {
    item?: (props: DraggableSlotProps<T>) => VNode[]
    header?: () => VNode[]
    footer?: () => VNode[]
  }
} & DraggableExpose<T>

export interface UseDraggableReturn<T = unknown> {
  /** Attach to the container element (`ref="containerRef"`). */
  containerRef: Ref<HTMLElement | null>
  /** Indices currently in the multi-drag selection. */
  selection: Ref<number[]>
  /** Index currently held in keyboard mode, or `null`. */
  keyboardIndex: Ref<number | null>
  move(from: number, to: number): void
  insertAt(index: number, item: T): void
  removeAt(index: number): T | undefined
  select(indices: number[]): void
  clearSelection(): void
  getSelection(): number[]
}

/**
 * Headless composable — you render the list, the engine handles the drags.
 * Items must be direct children of the container carrying `data-dnd-index`
 * (and ideally the `dnd-item` class):
 *
 * ```vue
 * <script setup lang="ts">
 * const items = ref([{ id: 1, name: 'Apple' }])
 * const { containerRef } = useDraggable(items, () => ({ animation: 200 }))
 * </script>
 *
 * <template>
 *   <ul ref="containerRef">
 *     <li v-for="(item, i) in items" :key="item.id" :data-dnd-index="i" class="dnd-item">
 *       {{ item.name }}
 *     </li>
 *   </ul>
 * </template>
 * ```
 */
export function useDraggable<T>(
  items: Ref<T[]>,
  options: () => DndListOptions<T> = () => ({}),
): UseDraggableReturn<T> {
  const containerRef = shallowRef<HTMLElement | null>(null)
  const selection = shallowRef<number[]>([])
  const keyboardIndex = shallowRef<number | null>(null)

  let list: DndList<T> | null = null

  const buildOptions = (): DndListOptions<T> => {
    const user = options()
    return {
      ...user,
      onSelectionChange: (e) => {
        selection.value = e.indices
        user.onSelectionChange?.(e)
      },
      onKeyboardStateChange: (index) => {
        keyboardIndex.value = index
        user.onKeyboardStateChange?.(index)
      },
    }
  }

  const adapter = {
    getItems: () => items.value,
    apply: (change: Parameters<typeof applyListChange<T>>[1]) => {
      items.value = applyListChange(items.value, change)
    },
    afterRender: (fn: () => void) => {
      void nextTick(fn)
    },
  }

  onMounted(() => {
    if (containerRef.value) list = new DndList<T>(containerRef.value, buildOptions(), adapter)
  })

  watch(containerRef, (el, prev) => {
    if (el && el !== prev) {
      list?.destroy()
      list = new DndList<T>(el, buildOptions(), adapter)
    }
  })

  watch(options, () => list?.setOptions(buildOptions()))

  onBeforeUnmount(() => {
    list?.destroy()
    list = null
  })

  return {
    containerRef,
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

/** `app.use(DndPlugin)` registers the global `<Draggable>` component. */
export const DndPlugin = {
  install(app: App): void {
    app.component('Draggable', DraggableImpl)
  },
}

export default Draggable
