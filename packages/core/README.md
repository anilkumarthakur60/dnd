# @anil-labs/dnd-core

Zero-dependency drag & drop engine — sortable lists, cross-list groups, clone, multi-drag, swap mode, keyboard a11y, FLIP animation and autoscroll, built on Pointer Events.

```ts
import { createSortable } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'

createSortable(document.querySelector('#list'), {
  group: 'tasks',
  animation: 200,
  onEnd: ({ oldIndex, newIndex }) => console.log(oldIndex, '→', newIndex),
})
```

Framework bindings: [`@anil-labs/dnd-react`](https://www.npmjs.com/package/@anil-labs/dnd-react) · [`@anil-labs/dnd`](https://www.npmjs.com/package/@anil-labs/dnd) · [`@anil-labs/dnd-svelte`](https://www.npmjs.com/package/@anil-labs/dnd-svelte) · [`@anil-labs/dnd-solid`](https://www.npmjs.com/package/@anil-labs/dnd-solid) · [`@anil-labs/dnd-element`](https://www.npmjs.com/package/@anil-labs/dnd-element)

- **[Documentation](https://anilkumarthakur60.github.io/vue-dnd/)** · **[Live demos](https://anil-labs-dnd.vercel.app)**

MIT © Er. Anil Kumar Thakur
