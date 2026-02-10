# vue-dnd

Zero-dependency Vue 3 drag-and-drop. Lists, tables, nested trees, clone, handle, animated transitions — built from scratch on Pointer Events.

- **No runtime dependencies.** Vue 3 only.
- **One component.** `<Draggable>` is the whole API.
- **Pointer Events** — mouse, touch, pen, and `delay` for long-press touch UX.
- **Keyboard + ARIA** — Space-to-grab, arrow keys, `aria-live` announcements.
- **FLIP animation** via the Web Animations API; opt-in TransitionGroup for entrance/exit.
- **Cross-list drag** with `group`, `pull`, `put` (boolean, array, or function).
- **Clone mode** — palette → canvas, with optional `clone(item)` transform.
- **Multi-drag** — Ctrl/Cmd-click to select N items, drag as a batch.
- **Swap mode** with `swapThreshold` / `invertSwap` for grid-style boards.
- **Axis lock** — constrain to X or Y.
- **Custom ghost** — render any HTML as the drag preview.
- **Revert on spill** — animate ghost back when dropped outside any list.
- **Nested / recursive** trees, any depth.
- **Tables** — sort rows or columns natively.
- **TypeScript** — generic over your item type, typed slot props, full `.d.ts` output.
- **~7 KB gzipped.**

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
| `selectedClass` | `string`                                        | `vue-dnd-selected` | Class added to items selected via multi-drag.                  |
| `delay`       | `number`                                          | `0`     | ms to wait before drag actually starts. Use ~200 for touch UX.           |
| `delayOnTouchOnly` | `boolean`                                    | `true`  | Apply `delay` only when `pointerType === 'touch'`.                       |
| `touchStartThreshold` | `number`                                  | `5`     | Pixels the pointer may drift during `delay` before drag is cancelled.    |
| `axis`        | `'x' \| 'y'`                                      | —       | Lock the ghost (and hit-testing) to one axis.                            |
| `direction`   | `'horizontal' \| 'vertical' \| 'auto'`            | `'auto'`| Force axis interpretation instead of auto-detection.                     |
| `easing`      | `string`                                          | `'cubic-bezier(0.2,0,0,1)'` | CSS easing used for FLIP and revert animations.       |
| `swap`        | `boolean`                                         | `false` | Swap with the hovered item instead of inserting.                         |
| `swapThreshold` | `number` (0..1)                                 | `1`     | How much overlap triggers a reorder/swap.                                |
| `invertSwap`  | `boolean`                                         | `false` | Reverse the swap-zone direction.                                         |
| `ghostFactory` | `(info) => HTMLElement`                          | —       | Build a custom drag preview instead of cloning the item.                 |
| `revertOnSpill` | `boolean`                                       | `false` | Animate ghost back to source when dropped outside any list.              |
| `removeOnSpill` | `boolean`                                       | `false` | Remove the item entirely when dropped outside any list.                  |
| `revertClone` | `boolean`                                         | `false` | Animate the cloned ghost back when dropped on the source itself.         |
| `scrollSpeed` | `number`                                          | `18`    | Autoscroll velocity (px / frame).                                        |
| `scrollSensitivity` | `number`                                    | `48`    | Distance from edge (px) before autoscroll engages.                       |
| `scrollDisabled` | `boolean`                                      | `false` | Disable the autoscroll loop.                                             |
| `emptyInsertThreshold` | `number`                                 | `0`     | Px of slack around an empty list before it counts as a drop target.      |
| `preventOnFilter` | `boolean`                                     | `true`  | preventDefault on pointerdowns matching `filter`.                        |
| `dragMaxItems` | `number`                                         | `0`     | Cap on multi-drag batch size (0 = unlimited).                            |
| `rtl`         | `boolean`                                         | —       | Force right-to-left horizontal logic (auto-detected from CSS otherwise). |
| `multiDrag`   | `boolean`                                         | `false` | Enable Ctrl/Cmd/Shift-click selection + batch dragging.                  |
| `keyboard`    | `boolean`                                         | `false` | Enable keyboard reordering + ARIA announcements.                         |
| `ariaLabel`   | `string`                                          | —       | Name used in keyboard-mode aria-live announcements.                      |
| `transitionName` | `string`                                       | —       | Vue TransitionGroup name. When set, items animate on add/remove.         |

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

- `#item="{ element, index, selected }"` — preferred. Renders each item. `selected` is `true` when the item is in the multi-drag selection.
- `#header` — rendered above items, not draggable. (Disabled when `transitionName` is set.)
- `#footer` — rendered below items, not draggable. (Disabled when `transitionName` is set.)

### Keyboard interaction (when `keyboard` is true)

| Key                            | Action                                           |
| ------------------------------ | ------------------------------------------------ |
| <kbd>Tab</kbd>                 | Focus the next item.                             |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Pick up the focused item (or drop the held item). |
| <kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>←</kbd> / <kbd>→</kbd> | Move the held item one slot. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Move the held item to the start / end.           |
| <kbd>Esc</kbd>                 | Cancel and restore the original position.        |

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

### Touch delay (long-press to drag)

```vue
<Draggable
  v-model="items"
  :delay="200"
  delay-on-touch-only
  :touch-start-threshold="6"
  item-key="id"
>
  ...
</Draggable>
```

Mobile users can scroll past items with a tap-swipe; long-press starts a drag.

### Multi-drag

```vue
<Draggable v-model="files" multi-drag item-key="id">
  <template #item="{ element, selected }">
    <div :class="{ row: true, sel: selected }">{{ element.name }}</div>
  </template>
</Draggable>
```

Ctrl/Cmd-click toggles selection. Dragging any selected item moves them all as a batch.

### Swap mode

```vue
<Draggable v-model="tiles" swap :swap-threshold="0.7" item-key="id">
  <template #item="{ element }"><div>{{ element.label }}</div></template>
</Draggable>
```

Dropping on a tile swaps positions instead of inserting. Useful for grids and dashboards.

### Custom ghost

```vue
<script setup>
import type { GhostFactoryInfo } from 'vue-dnd'
function makeGhost(info: GhostFactoryInfo) {
  const el = document.createElement('div')
  el.textContent = `${info.count} item${info.count > 1 ? 's' : ''}`
  el.style.padding = '10px 16px'
  el.style.background = '#6ea8ff'
  el.style.borderRadius = '999px'
  return el
}
</script>

<template>
  <Draggable v-model="items" :ghost-factory="makeGhost" item-key="id">
    ...
  </Draggable>
</template>
```

### Revert on spill

```vue
<Draggable v-model="items" revert-on-spill :group="{ name: 'a', put: false }" item-key="id">
  ...
</Draggable>
```

If a user drops outside any valid target, the ghost animates back to its starting position.

### Programmatic API

Expose methods on the component via a template ref:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { DraggableExpose } from 'vue-dnd'

const dnd = useTemplateRef<DraggableExpose<MyItem>>('dnd')

function insertFromAbove() {
  dnd.value?.insertAt(0, { id: crypto.randomUUID(), name: 'Top' })
}
</script>

<template>
  <Draggable ref="dnd" v-model="items" item-key="id"> ... </Draggable>
</template>
```

Exposed methods: `move(from, to)`, `insertAt(index, item)`, `removeAt(index)`, `select(indices)`, `clearSelection()`, `getSelection()`.

### Headless: `useDraggable`

For when you want full control over rendering:

```ts
import { useDraggable } from 'vue-dnd'

const { containerRef, internal, onPointerDown, move } = useDraggable<MyItem>({
  modelValue: items,
  onUpdate: (v) => (items.value = v),
  group: () => 'todos',
  animation: () => 200,
})
```

Wire `containerRef` to your element and `onPointerDown` to its `pointerdown` event. Items must carry `data-vue-dnd-index` so the engine can find them.

### Entrance / exit animation

```vue
<Draggable v-model="items" transition-name="list" item-key="id">
  ...
</Draggable>

<style>
.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from { opacity: 0; transform: translateY(-8px); }
.list-leave-to { opacity: 0; transform: translateX(20px); }
</style>
```

When `transitionName` is set, the container is rendered as Vue's `<TransitionGroup>`. Header/footer slots are disabled in this mode.

## Notes

- **`v-model` is the only source of truth.** The library never mutates your array in place — every change is emitted.
- **Touch.** Items have `touch-action: none` so the browser doesn't scroll while you drag. If you have a long list inside a scrollable container on mobile, use the `handle` prop so users can still scroll outside the grip.
- **SSR.** The component uses Pointer Events on mount; render is identical to a plain list during SSR.

## License

MIT
