# React

```sh
npm install @anil-labs/dnd-react
```

Requires React 18+ (the binding uses `flushSync` to keep FLIP animations in step with rendering).

## `<Draggable>`

A controlled component — you own the array, it renders and reorders it:

```tsx
import { useState } from 'react'
import { Draggable } from '@anil-labs/dnd-react'
import '@anil-labs/dnd-core/styles.css'

interface Task {
  id: number
  text: string
}

export function Board() {
  const [items, setItems] = useState<Task[]>([
    { id: 1, text: 'Apple' },
    { id: 2, text: 'Banana' },
  ])

  return (
    <Draggable
      items={items}
      onItemsChange={setItems}
      itemKey="id"
      group="tasks"
      animation={200}
      tag="ul"
      itemTag="li"
      renderItem={({ item, selected }) => <div className="card">{item.text}</div>}
      onEnd={(e) => console.log('dropped', e.oldIndex, '→', e.newIndex)}
    />
  )
}
```

### Props

Everything from the [options reference](/reference/options) (as flat props), plus:

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `T[]` | The list (controlled, required). |
| `onItemsChange` | `(items: T[]) => void` | Receives the next array on every change (required). |
| `renderItem` | `(ctx) => ReactNode` | Renders one item; `ctx` is `{ item, index, selected, keyboardActive }`. |
| `itemKey` | `keyof T \| (item, i) => string \| number` | Stable key per item — strongly recommended. |
| `tag` / `itemTag` | `string` | Container / item wrapper tags (`'div'` default). |
| `className` / `itemClassName` | `string` | Extra classes on container / item wrappers. |
| `header` / `footer` | `ReactNode` | Static, non-draggable content around the items. |

Every engine callback (`onStart`, `onEnd`, `onAdd`, `onRemove`, `onUpdate`, `onChange`, `onMove`, `onChoose`, `onUnchoose`, `onSelectionChange`, `onKeyboardMove`) is a prop.

### Imperative handle

```tsx
import { useRef } from 'react'
import type { DraggableHandle } from '@anil-labs/dnd-react'

const dnd = useRef<DraggableHandle<Task>>(null)
// …
<Draggable ref={dnd} … />
// …
dnd.current?.insertAt(0, { id: 99, text: 'Top' })
dnd.current?.select([0, 1])
```

Methods: `move`, `insertAt`, `removeAt`, `select`, `clearSelection`, `getSelection`.

## `useDraggable` (headless)

Render the markup yourself; the hook wires the engine:

```tsx
import { useDraggable } from '@anil-labs/dnd-react'

function List() {
  const [items, setItems] = useState(initial)
  const dnd = useDraggable(items, setItems, { animation: 200, multiDrag: true })

  return (
    <ul ref={dnd.ref}>
      {items.map((item, i) => (
        <li key={item.id} {...dnd.itemProps(i)}>
          {dnd.selection.includes(i) ? '☑ ' : ''}
          {item.text}
        </li>
      ))}
    </ul>
  )
}
```

`itemProps(i)` supplies `data-dnd-index`, the state classes and the a11y attributes. The result also exposes `selection`, `keyboardIndex` and the programmatic methods.

::: tip StrictMode
Mount/unmount is idempotent — the binding is StrictMode-safe.
:::
