# Events

Callbacks in the options object everywhere; additionally emitted as component events in Vue (`@end`) and as DOM CustomEvents on `<dnd-list>` (`dnd-end`).

Because the model updates **live during the drag** (that's what moves the items on screen), the granular events also fire live — not just on drop. `onEnd` is the "commit" signal.

| Callback | Vue event | `<dnd-list>` event | Fires |
| --- | --- | --- | --- |
| `onStart` | `start` | `dnd-start` | The pointer crossed the threshold — drag is live. |
| `onEnd` | `end` | `dnd-end` | Drag finished (dropped, cancelled or spilled). |
| `onMove` | `move` | — | The dragged block moved to a new list/index. |
| `onAdd` | `add` | `dnd-add` | This list gained an item (cross-list or clone). |
| `onRemove` | `remove` | `dnd-remove` | This list lost an item. |
| `onUpdate` | `update` | `dnd-update` | An item was reordered within this list. |
| `onChange` | `change` | `dnd-change` | Union event — one of `added`/`removed`/`moved`. |
| `onChoose` | `choose` | `dnd-choose` | Pointer went down on an item. |
| `onUnchoose` | `unchoose` | `dnd-unchoose` | Pointer released (drag or not). |
| `onSelectionChange` | `selection-change` | `dnd-select` | Multi-drag selection changed. |
| `onKeyboardMove` | `keyboard-move` | `dnd-keyboard` | A keyboard reorder was committed. |
| `onKeyboardStateChange` | — (internal) | — | The keyboard-held index changed (`number \| null`). |

## Payloads

```ts
interface DragStartEvent<T> {
  item: T
  index: number
  fromList: readonly T[]
  fromEl: HTMLElement
  originalEvent: PointerEvent
}

interface DragEndEvent<T> {
  item: T
  oldIndex: number
  newIndex: number            // -1 when cancelled/spilled
  fromList: readonly T[]
  toList: readonly T[]
  fromEl: HTMLElement
  toEl: HTMLElement
  pullMode: false | true | 'clone'
  cancelled: boolean
  originalEvent: PointerEvent | KeyboardEvent
}

interface DragMoveEvent<T> {
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

interface AddEvent<T>    { item: T; newIndex: number }
interface RemoveEvent<T> { item: T; oldIndex: number }
interface UpdateEvent<T> { item: T; oldIndex: number; newIndex: number }

interface ChangePayload<T> {
  added?:   { item: T; newIndex: number }
  removed?: { item: T; oldIndex: number }
  moved?:   { item: T; oldIndex: number; newIndex: number }
}

interface ChooseEvent<T>          { item: T; index: number }
interface SelectionChangeEvent<T> { items: T[]; indices: number[] }
interface KeyboardMoveEvent<T>    { item: T; oldIndex: number; newIndex: number }
```

## Patterns

**Persist on drop only:**

```ts
onEnd: ({ cancelled }) => {
  if (!cancelled) saveOrder(items)
}
```

**Track cross-list transfers:**

```ts
// On the receiving list:
onAdd: ({ item, newIndex }) => api.assign(item.id, laneId, newIndex)
// On the giving list:
onRemove: ({ item }) => api.unassign(item.id, laneId)
```

**Escape / spill detection:** `onEnd` fires with `cancelled: true` for Escape, `pointercancel` and `revertOnSpill`; `removeOnSpill` drops arrive with `cancelled: false` and `toEl` = the source container.
