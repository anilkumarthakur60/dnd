# Getting Started

## Install

Install the binding for your framework (each depends on `@anil-labs/dnd-core`):

::: code-group

```sh [React]
npm install @anil-labs/dnd-react
```

```sh [Vue]
npm install @anil-labs/dnd-vue
```

```sh [Svelte]
npm install @anil-labs/dnd-svelte
```

```sh [Solid]
npm install @anil-labs/dnd-solid
```

```sh [Web Component]
npm install @anil-labs/dnd-element
```

```sh [Vanilla]
npm install @anil-labs/dnd-core
```

:::

Then import the stylesheet once (the Web Component injects it automatically):

```ts
import '@anil-labs/dnd-core/styles.css'
```

It only contains structural styles — cursors, `touch-action`, the placeholder/ghost/selection classes. Your items keep their own look.

## Quick start

::: code-group

```tsx [React]
import { useState } from 'react'
import { Draggable } from '@anil-labs/dnd-react'
import '@anil-labs/dnd-core/styles.css'

export function TaskList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Apple' },
    { id: 2, text: 'Banana' },
    { id: 3, text: 'Cherry' },
  ])

  return (
    <Draggable
      items={items}
      onItemsChange={setItems}
      itemKey="id"
      animation={200}
      renderItem={({ item }) => <div className="card">{item.text}</div>}
    />
  )
}
```

```vue [Vue]
<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '@anil-labs/dnd-vue'
import '@anil-labs/dnd-core/styles.css'

const items = ref([
  { id: 1, text: 'Apple' },
  { id: 2, text: 'Banana' },
  { id: 3, text: 'Cherry' },
])
</script>

<template>
  <Draggable v-model="items" item-key="id" :animation="200">
    <template #item="{ element }">
      <div class="card">{{ element.text }}</div>
    </template>
  </Draggable>
</template>
```

```svelte [Svelte]
<script>
  import { draggable } from '@anil-labs/dnd-svelte'
  import '@anil-labs/dnd-core/styles.css'

  let items = $state([
    { id: 1, text: 'Apple' },
    { id: 2, text: 'Banana' },
    { id: 3, text: 'Cherry' },
  ])
</script>

<ul use:draggable={{ items, onItemsChange: (v) => (items = v), animation: 200 }}>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">{item.text}</li>
  {/each}
</ul>
```

```tsx [Solid]
import { createSignal, For } from 'solid-js'
import { createDraggable } from '@anil-labs/dnd-solid'
import '@anil-labs/dnd-core/styles.css'

const [items, setItems] = createSignal([
  { id: 1, text: 'Apple' },
  { id: 2, text: 'Banana' },
  { id: 3, text: 'Cherry' },
])
const dnd = createDraggable(items, setItems, { animation: 200 })

export const TaskList = () => (
  <ul ref={dnd.ref}>
    <For each={items()}>{(item, i) => <li {...dnd.itemProps(i())}>{item.text}</li>}</For>
  </ul>
)
```

```html [Web Component]
<script type="module">
  import '@anil-labs/dnd-element'
</script>

<dnd-list animation="200">
  <div>Apple</div>
  <div>Banana</div>
  <div>Cherry</div>
</dnd-list>
```

```ts [Vanilla]
import { createSortable } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'

createSortable(document.querySelector('#list'), {
  animation: 200,
  onEnd: ({ oldIndex, newIndex }) => console.log(oldIndex, '→', newIndex),
})
```

:::

## Two lists, one group

Give lists the same `group` and items drag freely between them:

```vue
<Draggable v-model="todo" group="tasks" item-key="id">…</Draggable>
<Draggable v-model="done" group="tasks" item-key="id">…</Draggable>
```

Lists **without** a group are isolated — they only sort within themselves. See [Groups & Cloning](/guide/groups) for `pull`/`put` rules and clone mode.

## Next steps

- Browse every option in the [Options reference](/reference/options).
- See the [framework pages](/frameworks/react) for the full API of your binding.
- Open the [live demos](https://anil-labs-dnd.vercel.app) to try each binding.
