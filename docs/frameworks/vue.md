# Vue 3

```sh
npm install @anil-labs/dnd
```

## `<Draggable>`

`v-model` in, reordered array out — your array is never mutated in place:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '@anil-labs/dnd'
import '@anil-labs/dnd-core/styles.css'

const items = ref([
  { id: 1, text: 'Apple' },
  { id: 2, text: 'Banana' },
])
</script>

<template>
  <Draggable
    v-model="items"
    item-key="id"
    group="tasks"
    :animation="200"
    tag="ul"
    item-tag="li"
    @end="(e) => console.log('dropped', e.oldIndex, '→', e.newIndex)"
  >
    <template #item="{ element, index, selected }">
      <div class="card">{{ element.text }}</div>
    </template>
    <template #header><h3>Tasks</h3></template>
    <template #footer><small>Drop here too</small></template>
  </Draggable>
</template>
```

### Props

Everything from the [options reference](/reference/options) as props, plus:

| Prop | Type | Description |
| --- | --- | --- |
| `modelValue` | `T[]` | The list — use `v-model` (required). |
| `itemKey` | `keyof T \| (item, i) => string \| number` | Stable key per item — strongly recommended. |
| `tag` / `itemTag` | `string` | Container / item wrapper tags (`'div'` default). |
| `transitionName` | `string` | Renders the container as `<TransitionGroup :name>` for enter/leave animations (header/footer disabled in this mode). |

### Slots

- `#item="{ element, item, index, selected }"` — renders each item (`element` and `item` are the same value; `element` matches the classic vue-dnd/vuedraggable name).
- `#header` / `#footer` — static, non-draggable content around the items.

### Events

`update:modelValue`, `start`, `end`, `add`, `remove`, `update`, `change`, `move`, `choose`, `unchoose`, `selection-change`, `keyboard-move` — payloads in the [events reference](/reference/events).

### Template ref

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { DraggableExpose } from '@anil-labs/dnd'

const dnd = useTemplateRef<DraggableExpose<Task>>('dnd')
dnd.value?.insertAt(0, { id: 99, text: 'Top' })
</script>

<template>
  <Draggable ref="dnd" v-model="items" item-key="id">…</Draggable>
</template>
```

Methods: `move`, `insertAt`, `removeAt`, `select`, `clearSelection`, `getSelection`.

## `useDraggable` (headless composable)

You render, the engine drags. Items must be keyed direct children with `data-dnd-index` and the `dnd-item` class:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDraggable } from '@anil-labs/dnd'

const items = ref([{ id: 1, text: 'Apple' }])
const { containerRef, selection, keyboardIndex } = useDraggable(items, () => ({
  animation: 200,
}))
</script>

<template>
  <ul ref="containerRef">
    <li v-for="(item, i) in items" :key="item.id" :data-dnd-index="i" class="dnd-item">
      {{ item.text }}
    </li>
  </ul>
</template>
```

The options getter is reactive — return different options and the engine updates live.

## Global registration

```ts
import { DndPlugin } from '@anil-labs/dnd'
app.use(DndPlugin) // registers <Draggable> globally
```
