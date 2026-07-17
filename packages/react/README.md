# @anil-labs/dnd-react

React bindings for [`@anil-labs/dnd-core`](https://www.npmjs.com/package/@anil-labs/dnd-core) — zero-dependency drag & drop with groups, clone, multi-drag, swap and keyboard a11y.

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

Also ships the headless `useDraggable(items, setItems, options)` hook.

- **[Documentation](https://anilkumarthakur60.github.io/dnd/frameworks/react)** · **[Live demo](https://anil-labs-dnd.vercel.app/react/)**

MIT © Er. Anil Kumar Thakur
