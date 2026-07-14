# Vanilla / CDN

`@anil-labs/dnd-core` works directly on the DOM — the container's element children are the items and the engine reorders them in place.

## Install

```sh
npm install @anil-labs/dnd-core
```

```ts
import { createSortable } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'

const sortable = createSortable(document.querySelector('#list')!, {
  group: 'tasks',
  animation: 200,
  handle: '.grip',
  onEnd: ({ item, oldIndex, newIndex, cancelled }) => {
    if (!cancelled) console.log(item, oldIndex, '→', newIndex)
  },
})
```

Items are indexed automatically (`data-dnd-index`, the `dnd-item` class, and a11y attributes when `keyboard` is on). A built-in MutationObserver re-indexes when you add or remove children yourself; call `sortable.refresh()` to force it.

## CDN

```html
<link rel="stylesheet" href="https://unpkg.com/@anil-labs/dnd-core/dist/styles.css" />
<script src="https://unpkg.com/@anil-labs/dnd-core"></script>
<script>
  DndCore.createSortable(document.querySelector('#list'), { animation: 200 })
</script>
```

(For markup-only usage prefer the [`<dnd-list>` Web Component](/frameworks/web-component).)

## The `Sortable` handle

```ts
sortable.el          // the container element
sortable.list        // the DndList controller — move(), select(), getSelection()…
sortable.refresh()   // re-scan children
sortable.setOptions({ disabled: true })
sortable.destroy()
```

In vanilla mode the "items" your events receive **are the child elements** (`item: HTMLElement`). Cross-list dragging between two `createSortable` containers moves the real nodes; `pull: 'clone'` clones them (`cloneNode(true)` by default, override with `clone`).

## Syncing your own data

If a data array backs the markup, mirror engine events onto it:

```ts
import { applyListChange } from '@anil-labs/dnd-core'

let tasks = ['Apple', 'Banana', 'Cherry']

createSortable(list, {
  animation: 200,
  onUpdate: ({ oldIndex, newIndex }) => {
    tasks = applyListChange(tasks, { type: 'move', from: oldIndex, to: newIndex })
  },
})
```

For anything more involved, reach for the [`DndList` adapter API](/reference/api#dndlist) — it's exactly how the framework bindings are built.

::: warning One group, one mode
Don't mix vanilla lists and data-driven (framework) lists in the same group — vanilla items are DOM nodes while framework items are your data objects.
:::
