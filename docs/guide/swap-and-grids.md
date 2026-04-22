# Swap, Grids & Tables

## Swap mode

By default dragging **inserts** — other items shift out of the way. `swap: true` **exchanges** instead: drop A on C and they trade places while everything else stays put. Ideal for dashboards and image grids.

```vue
<Draggable v-model="tiles" swap item-key="id">…</Draggable>
```

- `swapThreshold` (0..1) controls how much overlap counts as "on" an item.
- `invertSwap` reverses the active zone.
- Swap applies to same-list drags with a single item; cross-list drags and multi-drag batches fall back to inserting.

## Grids

Nothing special is needed for a wrapping grid — hit-testing uses each item's real rectangle. Lay the container out with CSS grid or flex-wrap:

```css
.tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
```

For strictly one-dimensional lists you can force the hit-test axis with `direction: 'horizontal' | 'vertical'` (default `'auto'` detects it from item layout).

## Axis lock

`axis: 'x'` or `'y'` pins the ghost to one axis — handy for column reordering and sliders:

```vue
<Draggable v-model="columns" axis="x" direction="horizontal" item-key="key">…</Draggable>
```

## Tables

Sort **rows** by making the `tbody` the container and `tr` the item; sort **columns** via the header row:

::: code-group

```vue [Rows]
<table>
  <thead>…</thead>
  <Draggable v-model="rows" tag="tbody" item-tag="tr" item-key="id">
    <template #item="{ element }">
      <td>{{ element.name }}</td>
      <td>{{ element.email }}</td>
    </template>
  </Draggable>
</table>
```

```vue [Columns]
<thead>
  <Draggable v-model="columns" tag="tr" item-tag="th" axis="x" item-key="key">
    <template #item="{ element }">{{ element.label }}</template>
  </Draggable>
</thead>
```

:::

`TH`/`TD` items auto-detect as horizontal.

## Right-to-left

RTL is detected from the container's computed `direction`; horizontal hit-testing flips automatically. Override with `rtl: true`/`false` when the container's CSS doesn't reflect the content direction.

## Autoscroll

Dragging near the edge of the window — or any scrollable ancestor under the pointer — scrolls it. Tune or disable:

```ts
{
  scrollSensitivity: 48, // px from the edge where scrolling engages
  scrollSpeed: 18,       // max px per frame
  scrollDisabled: false,
}
```
