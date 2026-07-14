# Options

Shared by every binding — flat props in React/Vue, the action/primitive options object in Svelte/Solid, attributes + `options` on `<dnd-list>`, and the `createSortable`/`DndList` options in vanilla.

## Behaviour

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | `string \| DragGroupObject` | — | Cross-list group; see [Groups & Cloning](/guide/groups). Ungrouped lists are isolated. |
| `sort` | `boolean` | `true` | Allow reordering within this list. |
| `disabled` | `boolean` | `false` | Disable all interactions. |
| `draggable` | `string` | — | CSS selector items must match to be draggable. |
| `handle` | `string` | — | Drag only starts on elements matching this selector inside an item. |
| `filter` | `string` | — | Drag is blocked when the pointerdown target matches. |
| `preventOnFilter` | `boolean` | `true` | `preventDefault()` on filtered pointerdowns. |
| `delay` | `number` | `0` | ms before a drag arms (long-press). |
| `delayOnTouchOnly` | `boolean` | `true` | Apply `delay` only for touch pointers. |
| `touchStartThreshold` | `number` | `5` | Pointer drift allowed during `delay` (px). |
| `dragThreshold` | `number` | `5` | Travel needed to start an un-delayed drag (px). |
| `dragMaxItems` | `number` | `0` | Multi-drag batch cap (`0` = unlimited). |
| `multiDrag` | `boolean` | `false` | Ctrl/Cmd/Shift-click selection + batch dragging. |
| `keyboard` | `boolean` | `false` | Keyboard reordering + ARIA. |
| `ariaLabel` | `string` | — | List name used in keyboard announcements. |

## Hit-testing & layout

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `axis` | `'x' \| 'y' \| null` | `null` | Lock the ghost to one axis. |
| `direction` | `'horizontal' \| 'vertical' \| 'auto'` | `'auto'` | Force hit-test direction. |
| `swap` | `boolean` | `false` | Exchange with the hovered item instead of inserting. |
| `swapThreshold` | `number` (0..1) | `1` | Overlap needed to trigger a reorder/swap. |
| `invertSwap` | `boolean` | `false` | Reverse the swap zone. |
| `emptyInsertThreshold` | `number` | `5` | Slack (px) around an *empty* list before it accepts drops. |
| `rtl` | `boolean` | auto | Force right-to-left logic (else detected from CSS `direction`). |

## Animation & ghost

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | `number` | `200` | FLIP duration (ms); `0` disables. |
| `easing` | `string` | `cubic-bezier(0.2, 0, 0, 1)` | Easing for FLIP and revert animations. |
| `ghostFactory` | `(info) => HTMLElement` | — | Build a [custom drag preview](/guide/styling#custom-ghosts). |
| `ghostClass` | `string` | — | Extra class on the source item while dragging. |
| `chosenClass` | `string` | — | Class on the item from pointerdown to release. |
| `dragClass` | `string` | — | Extra class on the floating ghost. |
| `selectedClass` | `string` | `'dnd-selected'` | Class on multi-drag selected items. |

## Transfers & spill

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `clone` | `(item) => item` | `structuredClone` | Copy transform for `pull: 'clone'` (vanilla: `cloneNode(true)`). |
| `revertOnSpill` | `boolean` | `false` | Restore order when dropped outside every list. |
| `removeOnSpill` | `boolean` | `false` | Remove items dropped outside every list. |
| `revertClone` | `boolean` | `false` | Animate a clone home when dropped on its own source. |

## Autoscroll

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scrollSensitivity` | `number` | `48` | Edge distance (px) where scrolling engages. |
| `scrollSpeed` | `number` | `18` | Max scroll velocity (px/frame). |
| `scrollDisabled` | `boolean` | `false` | Turn autoscroll off. |

## Binding-specific

| Where | Option | Description |
| --- | --- | --- |
| React/Vue components | `itemKey`, `tag`, `itemTag` | Keying and rendered tags. |
| React | `className`, `itemClassName`, `header`, `footer`, `renderItem` | Rendering. |
| Vue | `#item`/`#header`/`#footer` slots, `transitionName` | Rendering & transitions. |
| Vanilla / element | `itemSelector` | Which direct children count as items (default: all). |

Event callbacks (`onStart`, `onEnd`, …) are part of the same options object — see [Events](/reference/events).
