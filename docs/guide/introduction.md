# What is @anil-labs/dnd?

A drag-and-drop engine for sortable lists, built from scratch on Pointer Events, with first-class bindings for every major framework.

The project is a small family of packages sharing one engine:

| Package | What it gives you |
| --- | --- |
| `@anil-labs/dnd-core` | The zero-dependency engine: `createSortable()` for vanilla DOM, plus the `DndList` controller and adapter contract the bindings are built on. |
| `@anil-labs/dnd-react` | `<Draggable>` component and `useDraggable()` hook. |
| `@anil-labs/dnd-vue` | `<Draggable>` component (v-model) and `useDraggable()` composable. |
| `@anil-labs/dnd-svelte` | The `use:draggable` action. |
| `@anil-labs/dnd-solid` | The `createDraggable()` primitive. |
| `@anil-labs/dnd-element` | The `<dnd-list>` Web Component — any framework or plain HTML. |

## Feature highlights

- **Sorting & cross-list groups** — drag within a list or between lists sharing a `group`; control transfers with `pull`/`put` booleans, allow-lists or functions.
- **Clone mode** — palette → canvas flows with `pull: 'clone'` and an optional `clone(item)` transform.
- **Multi-drag** — Ctrl/Cmd-click to select several items and drag them as one batch, with a count badge on the ghost.
- **Swap mode** — exchange positions instead of inserting; ideal for grid dashboards.
- **Keyboard & ARIA** — Space to grab, arrows to move, `aria-live` announcements; fully usable without a pointer.
- **FLIP animation** — reorder transitions via the Web Animations API, honoring `prefers-reduced-motion`.
- **Handles, filters, touch delay** — start drags only from a grip, block interactive children, long-press on touch.
- **Autoscroll** — window and nested scroll containers scroll when you drag near an edge.
- **Custom ghosts** — render any element as the floating drag preview.
- **Spill behaviour** — revert or remove items dropped outside every list.

## The data model

The engine never mutates your arrays. You own the state; the engine hit-tests the DOM and asks your binding to apply primitive changes (`move`, `insert`, `remove`). Each binding translates those into idiomatic updates — a `v-model` emit in Vue, a `setState` in React, a reassignment in Svelte, a signal write in Solid. In vanilla mode the DOM itself is the state and the engine reorders children in place.

That architecture is why one engine drives every framework identically: the gesture logic, group rules, keyboard interaction and animation all live in `@anil-labs/dnd-core`, and each binding is a thin adapter.

## Browser support

Modern evergreen browsers. The engine relies on Pointer Events, `document.elementsFromPoint` and the Web Animations API — available everywhere since ~2020. SSR is safe: nothing touches the DOM until a list is constructed in the browser.
