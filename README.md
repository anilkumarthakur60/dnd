# @anil-labs/dnd

[![CI](https://github.com/anilkumarthakur60/vue-dnd/actions/workflows/ci.yml/badge.svg)](https://github.com/anilkumarthakur60/vue-dnd/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@anil-labs/dnd-core?label=dnd-core)](https://www.npmjs.com/package/@anil-labs/dnd-core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Zero-dependency drag & drop — sortable lists, cross-list groups, clone, multi-drag, swap mode, keyboard a11y, FLIP animation and autoscroll. One engine built on Pointer Events, with first-class bindings for **React, Vue 3, Svelte, Solid and Web Components**.

- **[Documentation](https://anilkumarthakur60.github.io/vue-dnd/)**
- **[Live demos](https://anil-labs-dnd.vercel.app)** — one per framework

## Packages

| Package | What you get |
| --- | --- |
| [`@anil-labs/dnd-core`](./packages/core) | The zero-dependency engine: `createSortable()` for vanilla DOM + the `DndList` controller the bindings are built on. |
| [`@anil-labs/dnd-react`](./packages/react) | `<Draggable>` component + `useDraggable()` hook. |
| [`@anil-labs/dnd`](./packages/vue) | `<Draggable>` component (v-model) + `useDraggable()` composable. |
| [`@anil-labs/dnd-svelte`](./packages/svelte) | The `use:draggable` action. |
| [`@anil-labs/dnd-solid`](./packages/solid) | The `createDraggable()` primitive. |
| [`@anil-labs/dnd-element`](./packages/element) | The `<dnd-list>` Web Component — any framework or plain HTML. |

## Features

- **No runtime dependencies.** Plain TypeScript on Pointer Events — mouse, touch and pen.
- **Cross-list groups** — share a `group` to drag between lists; control transfers with `pull`/`put` booleans, allow-lists or functions.
- **Clone mode** — palette → canvas with `pull: 'clone'` and an optional `clone(item)` transform.
- **Multi-drag** — Ctrl/Cmd-click to select several items and drag them as a batch (count badge included).
- **Swap mode** — exchange positions instead of inserting, for grid boards.
- **Keyboard + ARIA** — Space to grab, arrows to move, Escape to cancel, `aria-live` announcements.
- **FLIP animation** via the Web Animations API, honoring `prefers-reduced-motion`.
- **Handles, filters, touch delay, axis lock, RTL, autoscroll, custom ghosts, revert/remove on spill.**
- **Your state stays yours** — the engine never mutates your arrays; every change arrives as an event or an immutable update.
- **Strict TypeScript** — generic over your item type, no `any` anywhere, full `.d.ts` output.

## Quick start

### React

```tsx
import { useState } from 'react'
import { Draggable } from '@anil-labs/dnd-react'
import '@anil-labs/dnd-core/styles.css'

const [items, setItems] = useState([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])

<Draggable
  items={items}
  onItemsChange={setItems}
  itemKey="id"
  animation={200}
  renderItem={({ item }) => <div className="card">{item.text}</div>}
/>
```

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Draggable } from '@anil-labs/dnd'
import '@anil-labs/dnd-core/styles.css'

const items = ref([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])
</script>

<template>
  <Draggable v-model="items" item-key="id" :animation="200">
    <template #item="{ element }">
      <div class="card">{{ element.text }}</div>
    </template>
  </Draggable>
</template>
```

### Svelte

```svelte
<script>
  import { draggable } from '@anil-labs/dnd-svelte'
  import '@anil-labs/dnd-core/styles.css'

  let items = $state([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])
</script>

<ul use:draggable={{ items, onItemsChange: (v) => (items = v), animation: 200 }}>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">{item.text}</li>
  {/each}
</ul>
```

### Solid

```tsx
import { createSignal, For } from 'solid-js'
import { createDraggable } from '@anil-labs/dnd-solid'
import '@anil-labs/dnd-core/styles.css'

const [items, setItems] = createSignal([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])
const dnd = createDraggable(items, setItems, { animation: 200 })

<ul ref={dnd.ref}>
  <For each={items()}>{(item, i) => <li {...dnd.itemProps(i())}>{item.text}</li>}</For>
</ul>
```

### Web Component / plain HTML

```html
<script type="module">
  import '@anil-labs/dnd-element' // or the unpkg script tag
</script>

<dnd-list group="tasks" animation="200">
  <div>Apple</div>
  <div>Banana</div>
</dnd-list>
```

### Vanilla

```ts
import { createSortable } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'

createSortable(document.querySelector('#list'), {
  group: 'tasks',
  animation: 200,
  onEnd: ({ oldIndex, newIndex }) => console.log(oldIndex, '→', newIndex),
})
```

## Going further

- **[Groups & cloning](https://anilkumarthakur60.github.io/vue-dnd/guide/groups)** — `pull`/`put` rules, one-way lanes, spill behaviour
- **[Multi-drag](https://anilkumarthakur60.github.io/vue-dnd/guide/multi-drag)** and **[keyboard a11y](https://anilkumarthakur60.github.io/vue-dnd/guide/keyboard)**
- **[Swap, grids & tables](https://anilkumarthakur60.github.io/vue-dnd/guide/swap-and-grids)** and **[nested trees](https://anilkumarthakur60.github.io/vue-dnd/guide/nested)**
- **[All options](https://anilkumarthakur60.github.io/vue-dnd/reference/options)** · **[Events](https://anilkumarthakur60.github.io/vue-dnd/reference/events)** · **[API](https://anilkumarthakur60.github.io/vue-dnd/reference/api)**

## Development

This is a pnpm workspace. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

```bash
pnpm install
pnpm build          # all packages (ESM + CJS + IIFE + .d.ts)
pnpm test           # vitest suites
pnpm check          # lint + format + typecheck + test
pnpm example:react  # run a demo app (:vue :svelte :solid :element :vanilla)
pnpm docs:dev       # docs site
```

## License

[MIT](./LICENSE) © Er. Anil Kumar Thakur
