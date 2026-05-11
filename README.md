# vue-dnd

Zero-dependency Vue 3 drag-and-drop. Lists, tables, nested trees, clone, handle, animated transitions — built from scratch on Pointer Events.

- **No runtime dependencies.** Vue 3 only.
- **One component.** `<Draggable>` is the whole API.
- **Pointer Events.** Mouse, touch, and pen out of the box.
- **FLIP animation.** Smooth reorders with the Web Animations API.
- **Cross-list drag.** Share items between any number of lists via `group`.
- **Clone mode.** Pull copies from a palette, or copy on `Ctrl`.
- **Nested.** Recursive trees, any depth.
- **Tables.** Sort rows or columns natively.
- **TypeScript.** Generic over your item type. Slot props are properly typed.
- **~5 KB gzipped.**

## Install

```sh
npm install vue-dnd
```

```ts
// main.ts
import 'vue-dnd/style.css'
```

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from 'vue-dnd'

const items = ref([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
])
</script>

<template>
  <Draggable v-model="items" item-key="id" :animation="200">
    <template #item="{ element }">
      <div class="item">{{ element.name }}</div>
    </template>
  </Draggable>
</template>
```

## API

### Props

| Prop          | Type                                              | Default | Description                                                              |
| ------------- | ------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `modelValue`  | `T[]`                                             | —       | The list of items. Use `v-model`.                                        |
| `group`       | `string \| DragGroupObject`                       | —       | Group name (string) or full config. Lists sharing a group share drops.   |
| `sort`        | `boolean`                                         | `true`  | Allow reordering within this list.                                       |
| `disabled`    | `boolean`                                         | `false` | Disable all drag interactions.                                           |
| `animation`   | `number`                                          | `200`   | FLIP animation duration in ms. Set `0` to disable.                       |
| `handle`      | `string`                                          | —       | CSS selector. Drag only starts on elements matching this within an item. |
| `filter`      | `string`                                          | —       | CSS selector. Drag is blocked when the pointerdown matches.              |
| `draggable`   | `string`                                          | —       | CSS selector items must match to be draggable.                           |
| `tag`         | `string`                                          | `'div'` | Tag for the container (e.g. `'ul'`, `'tbody'`, `'tr'`).                  |
| `itemTag`     | `string`                                          | `'div'` | Tag for each item wrapper (e.g. `'li'`, `'tr'`, `'th'`).                 |
| `itemKey`     | `keyof T \| (item, i) => string \| number`        | —       | Stable key per item. Strongly recommended.                               |
| `clone`       | `(item: T) => T`                                  | —       | Custom clone function used in `pull: 'clone'` mode.                      |
| `ghostClass`  | `string`                                          | —       | Class added to the source item while it's being dragged.                 |
| `chosenClass` | `string`                                          | —       | Class added to the source item on pointerdown.                           |
| `dragClass`   | `string`                                          | —       | Class added to the floating ghost element.                               |

### Group config

```ts
type DragGroup = string | {
  name: string
  pull?: boolean | 'clone' | string[] | ((to, from) => boolean | 'clone')
  put?: boolean | string[] | ((to, from) => boolean)
}
```

- `pull: false` — items can't leave this list.
- `pull: 'clone'` — items copy out, originals stay.
- `pull: ['a', 'b']` — only pull into groups named `a` or `b`.
- `put: false` — list rejects incoming items.

### Events

| Event              | Payload                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue`| `(value: T[])` — emitted on every change.                                                                                      |
| `start`            | `{ item, index, fromList, fromEl, originalEvent }`                                                                             |
| `end`              | `{ item, oldIndex, newIndex, fromList, toList, fromEl, toEl, pullMode, cancelled, originalEvent }`                             |
| `add`              | `{ element, newIndex }` — an item was added (incl. cross-list and clone).                                                      |
| `remove`           | `{ element, oldIndex }` — an item was removed from this list.                                                                  |
| `update`           | `{ element, oldIndex, newIndex }` — an item was reordered within this list.                                                    |
| `move`             | `{ item, fromList, toList, oldIndex, newIndex, originalEvent }` — fires while dragging, on every index change.                 |
| `change`           | `{ added? } \| { removed? } \| { moved? }` — single event covering all three categories.                                       |
| `choose` / `unchoose` | `{ item, index }` — fire on pointerdown / pointerup, regardless of whether a drag actually happened.                       |

### Slots

- `#item="{ element, index }"` — preferred. Renders each item.
- `#header` — rendered above items, not draggable.
- `#footer` — rendered below items, not draggable.

## Recipes

### Cross-list move

```vue
<Draggable v-model="todo" group="tasks" item-key="id">
  <template #item="{ element }"><div>{{ element.text }}</div></template>
</Draggable>

<Draggable v-model="done" group="tasks" item-key="id">
  <template #item="{ element }"><div>{{ element.text }}</div></template>
</Draggable>
```

### Clone (palette → canvas)

```vue
<Draggable
  v-model="palette"
  :group="{ name: 'blocks', pull: 'clone', put: false }"
  :sort="false"
  :clone="(item) => ({ ...item, id: crypto.randomUUID() })"
  item-key="id"
>
  <template #item="{ element }"><div>{{ element.label }}</div></template>
</Draggable>

<Draggable v-model="canvas" group="blocks" item-key="id">
  <template #item="{ element }"><div>{{ element.label }}</div></template>
</Draggable>
```

### Handle

```vue
<Draggable v-model="items" handle=".grip" item-key="id">
  <template #item="{ element }">
    <div class="row">
      <span class="grip">⋮⋮</span>
      <span>{{ element.name }}</span>
    </div>
  </template>
</Draggable>
```

### Table rows

```vue
<table>
  <thead>...</thead>
  <Draggable v-model="rows" tag="tbody" item-tag="tr" item-key="id">
    <template #item="{ element }">
      <td>{{ element.name }}</td>
      <td>{{ element.email }}</td>
    </template>
  </Draggable>
</table>
```

### Table columns

```vue
<thead>
  <Draggable v-model="columns" tag="tr" item-tag="th" item-key="key">
    <template #item="{ element }">{{ element.label }}</template>
  </Draggable>
</thead>
```

### Nested (recursive)

```vue
<!-- TreeNode.vue -->
<template>
  <Draggable
    :model-value="items"
    @update:model-value="(v) => items.splice(0, items.length, ...v)"
    group="tree"
    item-key="id"
  >
    <template #item="{ element }">
      <div>
        <div>{{ element.label }}</div>
        <TreeNode :items="element.children" />
      </div>
    </template>
  </Draggable>
</template>
```

Share the same `group` name across every level — items drag freely between branches.

### Cancel a drag

Press <kbd>Esc</kbd> while dragging. Order reverts and `end` fires with `cancelled: true`.

## Notes

- **`v-model` is the only source of truth.** The library never mutates your array in place — every change is emitted.
- **Touch.** Items have `touch-action: none` so the browser doesn't scroll while you drag. If you have a long list inside a scrollable container on mobile, use the `handle` prop so users can still scroll outside the grip.
- **SSR.** The component uses Pointer Events on mount; render is identical to a plain list during SSR.

## License

MIT
