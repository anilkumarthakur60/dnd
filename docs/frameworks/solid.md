# Solid

```sh
npm install @anil-labs/dnd-solid
```

## `createDraggable`

A primitive: signals in, gestures out. You render with `<For>`; `itemProps(i)` decorates each item:

```tsx
import { createSignal, For } from 'solid-js'
import { createDraggable } from '@anil-labs/dnd-solid'
import '@anil-labs/dnd-core/styles.css'

interface Task {
  id: number
  text: string
}

export function Board() {
  const [items, setItems] = createSignal<Task[]>([
    { id: 1, text: 'Apple' },
    { id: 2, text: 'Banana' },
  ])

  const dnd = createDraggable(items, setItems, {
    group: 'tasks',
    animation: 200,
    onEnd: (e) => console.log('dropped', e.oldIndex, '→', e.newIndex),
  })

  return (
    <ul ref={dnd.ref}>
      <For each={items()}>
        {(item, i) => <li {...dnd.itemProps(i())}>{item.text}</li>}
      </For>
    </ul>
  )
}
```

`itemProps(i)` supplies `data-dnd-index`, the `dnd-item`/state classes and, in keyboard mode, the ARIA attributes. Use `<For>` (keyed) rather than `<Index>` so nodes move instead of being recreated.

## Signature

```ts
createDraggable<T>(
  items: Accessor<T[]>,
  setItems: (items: T[]) => void,
  options?: DndListOptions<T> | Accessor<DndListOptions<T>>,
): CreateDraggableResult<T>
```

Pass options as an accessor to make them reactive:

```ts
const dnd = createDraggable(items, setItems, () => ({
  animation: 200,
  disabled: locked(),
}))
```

## The result

| Member | Description |
| --- | --- |
| `ref` | Attach to the container element. |
| `itemProps(index)` | Spread onto each item element. |
| `selection` | `Accessor<number[]>` — multi-drag selection. |
| `keyboardIndex` | `Accessor<number \| null>` — item held via keyboard. |
| `move` / `insertAt` / `removeAt` | Programmatic list edits (flow through `setItems`). |
| `select` / `clearSelection` / `getSelection` | Multi-drag selection control. |

## Multi-drag rendering

```tsx
const dnd = createDraggable(files, setFiles, { multiDrag: true })

<For each={files()}>
  {(file, i) => (
    <li {...dnd.itemProps(i())}>
      {dnd.selection().includes(i()) ? '☑' : '☐'} {file.name}
    </li>
  )}
</For>
```

All options and event callbacks are listed in the [options](/reference/options) and [events](/reference/events) references.
