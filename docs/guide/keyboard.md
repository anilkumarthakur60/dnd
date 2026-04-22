# Keyboard & Accessibility

Enable `keyboard: true` and every item becomes focusable and reorderable without a pointer:

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Focus the next item. |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Pick up the focused item (or drop the held item). |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> | Move the held item one slot. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Move the held item to the start / end. |
| <kbd>Esc</kbd> | Cancel and restore the original position. |

```vue
<Draggable v-model="items" keyboard aria-label="Task list" item-key="id">…</Draggable>
```

## What the engine renders

With keyboard mode on, items carry `tabindex="0"`, `role="option"`, `aria-posinset`, `aria-setsize`, and `aria-grabbed` while held. The held item also gets the `dnd-keyboard-active` class (a dashed outline by default).

## Announcements

Grabs, moves, drops and cancels are announced through a shared visually-hidden `aria-live` region — one per document, created on demand. Pass `ariaLabel` (attribute `list-label` on `<dnd-list>`) so announcements name the list:

> "Picked up item 2 of 8 in Task list. Use arrow keys to move, Enter or Space to drop, Escape to cancel."

## Events

Committed keyboard reorders arrive live through the same `update`/`change` events as pointer drags, plus a summary `keyboard-move` event (`onKeyboardMove`) with the original and final index when the item is dropped.

## Pointer cancellation

During pointer drags, <kbd>Esc</kbd> cancels too: order is restored, the ghost animates home, and `onEnd` fires with `cancelled: true`.

## Reduced motion

All FLIP and ghost transitions respect `@media (prefers-reduced-motion: reduce)`; set `animation: 0` to disable them entirely.
