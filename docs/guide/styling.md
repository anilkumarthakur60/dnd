# Styling & Custom Ghosts

## The stylesheet

`@anil-labs/dnd-core/styles.css` is intentionally tiny — structural rules only:

| Class | Applied to | Purpose |
| --- | --- | --- |
| `dnd-container` | The list container (rendered by bindings) | `position: relative` anchor. |
| `dnd-item` | Every item | `cursor: grab`, `touch-action: none`, `user-select: none`. |
| `dnd-placeholder` | The source item(s) during a drag | Dimmed "you are here" slot. |
| `dnd-ghost` | The floating drag preview | `pointer-events: none`, `will-change`. |
| `dnd-count-badge` | Badge on the default multi-drag ghost | Batch size bubble. |
| `dnd-selected` | Items in the multi-drag selection | Accent outline (override via `selectedClass`). |
| `dnd-keyboard-active` | The item held in keyboard mode | Dashed accent outline. |
| `dnd-live` | The shared aria-live region | Visually hidden. |

Theme the accent everywhere with one custom property:

```css
:root {
  --dnd-accent: #e91e63;
}
```

## Your own state classes

Four options add classes at interaction points:

```ts
{
  chosenClass: 'is-chosen',   // on the item from pointerdown until release
  ghostClass: 'is-dragging',  // on the source item while the drag is live
  dragClass: 'is-ghost',      // on the floating ghost element
  selectedClass: 'is-picked', // on multi-drag selected items (replaces dnd-selected)
}
```

```css
.is-dragging {
  opacity: 0.3;
}
.is-ghost {
  transform: rotate(2deg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}
```

## Custom ghosts

Replace the cloned-element preview entirely:

```ts
import type { GhostFactoryInfo } from '@anil-labs/dnd-core'

function makeGhost({ count }: GhostFactoryInfo) {
  const el = document.createElement('div')
  el.textContent = count > 1 ? `${count} items` : 'Moving…'
  el.style.padding = '10px 16px'
  el.style.borderRadius = '999px'
  el.style.background = '#6ea8ff'
  el.style.color = '#0b0f17'
  return el
}
```

```vue
<Draggable v-model="items" :ghost-factory="makeGhost" item-key="id">…</Draggable>
```

The factory receives `{ items, sourceEl, count }` and returns any element; the engine positions it under the pointer and cleans it up.

## Headless usage

Using `useDraggable` (React/Vue), the Svelte action or the Solid primitive, **you** render the items. Two rules:

1. Each item is a *direct child* of the container with `data-dnd-index={i}` matching its array position (keyed!).
2. Give items the `dnd-item` class (or your own `touch-action: none; user-select: none;`) so touch dragging works.

The React hook and Solid primitive provide `itemProps(i)` that handle both plus the a11y attributes.
