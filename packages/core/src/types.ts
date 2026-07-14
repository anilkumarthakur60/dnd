/** Resolve a stable key for an item — a property name or a getter function. */
export type ItemKey<T> = keyof T | ((item: T, index: number) => string | number)

/** Passed to `pull`/`put` functions when a cross-list transfer is evaluated. */
export interface GroupContext {
  name: string
  el: HTMLElement
}

export interface DragGroupObject {
  /** Lists sharing a `name` accept drops from each other (subject to `pull`/`put`). */
  name: string
  /**
   * Whether items may leave this list: `true`/`false`, `'clone'` (copy out,
   * original stays), an allow-list of target group names, or a function.
   */
  pull?:
    | boolean
    | 'clone'
    | string[]
    | ((to: GroupContext, from: GroupContext) => boolean | 'clone' | undefined)
  /**
   * Whether this list accepts incoming items: `true`/`false`, an allow-list of
   * source group names, or a function.
   */
  put?: boolean | string[] | ((to: GroupContext, from: GroupContext) => boolean | undefined)
}

/** Group name (string shorthand) or full `pull`/`put` config. */
export type DragGroup = string | DragGroupObject

/** How the dragged items left their source list. */
export type PullMode = false | true | 'clone'

/** Lock the ghost (and hit-testing) to one axis. */
export type DndAxis = 'x' | 'y' | null

/** Hit-testing direction; `'auto'` detects from item layout. */
export type DndDirection = 'horizontal' | 'vertical' | 'auto'

export interface GhostFactoryInfo<T = unknown> {
  /** The dragged items (one, or the multi-drag batch). */
  items: T[]
  /** The source item element the drag started on. */
  sourceEl: HTMLElement
  /** Number of items in the batch. */
  count: number
}

/** Build a custom floating drag preview instead of cloning the item element. */
export type GhostFactory<T = unknown> = (info: GhostFactoryInfo<T>) => HTMLElement

/** Produce the copy used by `pull: 'clone'`. */
export type CloneFn<T = unknown> = (original: T) => T

export interface DragStartEvent<T = unknown> {
  item: T
  index: number
  fromList: readonly T[]
  fromEl: HTMLElement
  originalEvent: PointerEvent
}

export interface DragEndEvent<T = unknown> {
  item: T
  oldIndex: number
  newIndex: number
  fromList: readonly T[]
  toList: readonly T[]
  fromEl: HTMLElement
  toEl: HTMLElement
  pullMode: PullMode
  /** `true` when the drag was cancelled (Escape, pointercancel or revert). */
  cancelled: boolean
  originalEvent: PointerEvent | KeyboardEvent
}

export interface DragMoveEvent<T = unknown> {
  item: T
  fromList: readonly T[]
  toList: readonly T[]
  fromEl: HTMLElement
  toEl: HTMLElement
  oldIndex: number
  newIndex: number
  willInsertAfter: boolean
  originalEvent: PointerEvent
}

export interface AddEvent<T = unknown> {
  item: T
  newIndex: number
}

export interface RemoveEvent<T = unknown> {
  item: T
  oldIndex: number
}

export interface UpdateEvent<T = unknown> {
  item: T
  oldIndex: number
  newIndex: number
}

/** Union payload for `onChange` — exactly one property is set per call. */
export interface ChangePayload<T = unknown> {
  added?: { item: T; newIndex: number }
  removed?: { item: T; oldIndex: number }
  moved?: { item: T; oldIndex: number; newIndex: number }
}

export interface ChooseEvent<T = unknown> {
  item: T
  index: number
}

export interface SelectionChangeEvent<T = unknown> {
  items: T[]
  indices: number[]
}

export interface KeyboardMoveEvent<T = unknown> {
  item: T
  oldIndex: number
  newIndex: number
}

export interface DndListCallbacks<T = unknown> {
  /** A drag actually started (pointer crossed the drag threshold). */
  onStart?: (event: DragStartEvent<T>) => void
  /** The drag finished — dropped, cancelled or spilled. */
  onEnd?: (event: DragEndEvent<T>) => void
  /** Fires while dragging, on every index or list change. */
  onMove?: (event: DragMoveEvent<T>) => void
  /** An item was added to this list (cross-list drop or clone). */
  onAdd?: (event: AddEvent<T>) => void
  /** An item was removed from this list. */
  onRemove?: (event: RemoveEvent<T>) => void
  /** An item was reordered within this list. */
  onUpdate?: (event: UpdateEvent<T>) => void
  /** Single event covering added / removed / moved. */
  onChange?: (event: ChangePayload<T>) => void
  /** Pointer went down on an item (before any drag). */
  onChoose?: (event: ChooseEvent<T>) => void
  /** Pointer released, whether or not a drag happened. */
  onUnchoose?: (event: ChooseEvent<T>) => void
  /** The multi-drag selection changed. */
  onSelectionChange?: (event: SelectionChangeEvent<T>) => void
  /** A keyboard reorder was committed (Space/Enter drop). */
  onKeyboardMove?: (event: KeyboardMoveEvent<T>) => void
  /** The keyboard "grabbed" item changed (`null` = nothing held). */
  onKeyboardStateChange?: (index: number | null) => void
}

export interface DndListOptions<T = unknown> extends DndListCallbacks<T> {
  /** Group name or `pull`/`put` config for cross-list dragging. */
  group?: DragGroup
  /**
   * Allow reordering within this list.
   * @default true
   */
  sort?: boolean
  /**
   * Disable all drag interactions.
   * @default false
   */
  disabled?: boolean
  /**
   * FLIP animation duration in ms. Set `0` to disable.
   * @default 200
   */
  animation?: number
  /**
   * CSS easing used for FLIP and revert animations.
   * @default 'cubic-bezier(0.2, 0, 0, 1)'
   */
  easing?: string
  /** CSS selector — drag only starts on elements matching this within an item. */
  handle?: string
  /** CSS selector — drag is blocked when the pointerdown target matches. */
  filter?: string
  /**
   * Call `preventDefault` on pointerdowns matching `filter`.
   * @default true
   */
  preventOnFilter?: boolean
  /** CSS selector items must match to be draggable. */
  draggable?: string
  /** Class added to the source item while it is being dragged. */
  ghostClass?: string
  /** Class added to the source item on pointerdown. */
  chosenClass?: string
  /** Class added to the floating ghost element. */
  dragClass?: string
  /**
   * Class added to items selected via multi-drag.
   * @default 'dnd-selected'
   */
  selectedClass?: string
  /**
   * Milliseconds to wait before a drag actually starts. Use ~200 for touch UX.
   * @default 0
   */
  delay?: number
  /**
   * Apply `delay` only when `pointerType === 'touch'`.
   * @default true
   */
  delayOnTouchOnly?: boolean
  /**
   * Pixels the pointer may drift during `delay` before the drag is cancelled.
   * @default 5
   */
  touchStartThreshold?: number
  /**
   * Pixels the pointer must travel before a drag begins (`0` when `delay` is used).
   * @default 5
   */
  dragThreshold?: number
  /**
   * Lock the ghost (and hit-testing) to one axis.
   * @default null
   */
  axis?: DndAxis
  /**
   * Force hit-testing direction instead of auto-detection.
   * @default 'auto'
   */
  direction?: DndDirection
  /**
   * Swap with the hovered item instead of inserting.
   * @default false
   */
  swap?: boolean
  /**
   * 0..1 — how much overlap triggers a reorder/swap.
   * @default 1
   */
  swapThreshold?: number
  /**
   * Reverse the swap-zone direction.
   * @default false
   */
  invertSwap?: boolean
  /** Build a custom drag preview instead of cloning the item element. */
  ghostFactory?: GhostFactory<T>
  /** Custom clone function used in `pull: 'clone'` mode. */
  clone?: CloneFn<T>
  /**
   * Animate the ghost back and restore order when dropped outside any list.
   * @default false
   */
  revertOnSpill?: boolean
  /**
   * Remove the dragged items entirely when dropped outside any list.
   * @default false
   */
  removeOnSpill?: boolean
  /**
   * Animate a cloned ghost back when the clone is dropped on its own source.
   * @default false
   */
  revertClone?: boolean
  /**
   * Autoscroll velocity in px per frame.
   * @default 18
   */
  scrollSpeed?: number
  /**
   * Distance from an edge (px) before autoscroll engages.
   * @default 48
   */
  scrollSensitivity?: number
  /**
   * Disable the autoscroll loop.
   * @default false
   */
  scrollDisabled?: boolean
  /**
   * Treat an *empty* list as a drop target while the pointer is within N px of
   * its bounds.
   * @default 5
   */
  emptyInsertThreshold?: number
  /**
   * Cap on the multi-drag batch size (`0` = unlimited).
   * @default 0
   */
  dragMaxItems?: number
  /** Force right-to-left horizontal logic (auto-detected from CSS otherwise). */
  rtl?: boolean
  /**
   * Enable Ctrl/Cmd/Shift-click selection of multiple items, dragged as a batch.
   * @default false
   */
  multiDrag?: boolean
  /**
   * Enable keyboard reordering — Space/Enter to grab and drop, arrows to move,
   * Escape to cancel — with `aria-live` announcements.
   * @default false
   */
  keyboard?: boolean
  /** Accessible name for the list, used in keyboard announcements. */
  ariaLabel?: string
}

/** A single primitive mutation the engine asks the list owner to apply. */
export type ListChange<T = unknown> =
  | { type: 'move'; from: number; to: number }
  | { type: 'insert'; index: number; item: T }
  | { type: 'remove'; index: number }

/**
 * How a `DndList` reads and mutates the data it renders. Framework bindings
 * implement this over their own state; `createSortable` implements it over
 * plain DOM children.
 */
export interface ListAdapter<T = unknown> {
  /** The current item array (or array-like snapshot) backing the list. */
  getItems(): readonly T[]
  /**
   * Apply one primitive change to the data. Must update `getItems()`
   * synchronously (the engine may apply several changes in one batch).
   */
  apply(change: ListChange<T>): void
  /**
   * Invoke `fn` once the DOM reflects every change applied so far — e.g.
   * `nextTick` in Vue, `tick()` in Svelte, or synchronously after `flushSync`
   * in React. Used to time FLIP animations and focus management.
   */
  afterRender(fn: () => void): void
}

export interface ScrollConfig {
  disabled?: boolean
  speed?: number
  sensitivity?: number
}
