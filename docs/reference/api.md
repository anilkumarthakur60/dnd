# API

## `createSortable(el, options?)` — vanilla

Makes a container's element children sortable in place.

```ts
import { createSortable } from '@anil-labs/dnd-core'

const sortable = createSortable(el, { group: 'tasks', animation: 200 })
```

Returns a `Sortable`:

| Member | Description |
| --- | --- |
| `el` | The container element. |
| `list` | The underlying [`DndList`](#dndlist) controller. |
| `refresh()` | Re-scan children and refresh `data-dnd-index` (a MutationObserver also does this automatically). |
| `setOptions(options)` | Replace the options. |
| `destroy()` | Remove listeners, observers and registry entries. |

Extra option: `itemSelector` — which direct children count as items (default: all element children).

## `DndList` {#dndlist}

The framework-agnostic controller every binding wraps. Use it directly to build your own integration:

```ts
import { DndList, applyListChange } from '@anil-labs/dnd-core'

let items = ['A', 'B', 'C']

const list = new DndList<string>(containerEl, { animation: 200 }, {
  getItems: () => items,
  apply: (change) => {
    items = applyListChange(items, change)
    rerender() // must update the DOM (synchronously or schedule it)
  },
  afterRender: (fn) => queueRenderCallback(fn), // call fn once the DOM is current
})
```

### The adapter

```ts
interface ListAdapter<T> {
  getItems(): readonly T[]
  apply(change: ListChange<T>): void
  afterRender(fn: () => void): void
}

type ListChange<T> =
  | { type: 'move'; from: number; to: number }
  | { type: 'insert'; index: number; item: T }
  | { type: 'remove'; index: number }
```

- `apply` must update `getItems()` **synchronously** — the engine batches several changes in one gesture.
- `afterRender` times FLIP animation and focus: `nextTick` (Vue), `tick()` (Svelte), a plain `fn()` after `flushSync` (React) or for synchronous renderers (Solid, vanilla DOM).

The rendered items must be direct children of the container carrying `data-dnd-index` equal to their array position.

### Methods

| Method | Description |
| --- | --- |
| `setOptions(options)` | Replace the options (omitted keys reset to defaults). |
| `move(from, to)` | Programmatic reorder. |
| `insertAt(index, item)` | Insert (index clamped). |
| `removeAt(index)` | Remove; returns the item. |
| `select(indices)` / `clearSelection()` / `getSelection()` | Multi-drag selection. |
| `isSelected(index)` | Selection check. |
| `keyboardIndex` | Getter — index held via keyboard, or `null`. |
| `destroy()` | Unregister and remove listeners. |

## Utilities

| Export | Description |
| --- | --- |
| `applyListChange(items, change)` | Pure helper — new array with one `ListChange` applied. |
| `isDragging()` | `true` while any pointer drag is live (global). |
| `normalizeGroup(group)` | Expand a `DragGroup` to its object form. |
| `captureRects(els)` / `playFlip(snapshot, ms, easing?)` | The FLIP primitives, exported for custom animations. |
| `announce(message)` | Post to the shared `aria-live` region. |

## Package entry points

| Package | Main exports |
| --- | --- |
| `@anil-labs/dnd-core` | `createSortable`, `DndList`, `applyListChange`, utilities, all types, `./styles.css`. |
| `@anil-labs/dnd-react` | `Draggable`, `useDraggable`, `DraggableHandle`, re-exports core. |
| `@anil-labs/dnd` | `Draggable`, `useDraggable`, `DndPlugin`, `DraggableExpose`, re-exports core. |
| `@anil-labs/dnd-svelte` | `draggable` action, re-exports core. |
| `@anil-labs/dnd-solid` | `createDraggable`, re-exports core. |
| `@anil-labs/dnd-element` | `<dnd-list>` (self-registering), `DndListElement`, `register(tag)`, re-exports core. |

All packages ship ESM + CJS + `.d.ts`; the core and element packages also ship IIFE builds for CDN use (globals `DndCore` and `DndListElement`).
