# @anil-labs/dnd-solid

SolidJS bindings for [`@anil-labs/dnd-core`](https://www.npmjs.com/package/@anil-labs/dnd-core) — zero-dependency drag & drop with groups, clone, multi-drag, swap and keyboard a11y.

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

- **[Documentation](https://anilkumarthakur60.github.io/dnd/frameworks/solid)** · **[Live demo](https://anil-labs-dnd.vercel.app/solid/)**

MIT © Er. Anil Kumar Thakur
