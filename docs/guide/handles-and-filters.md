# Handles, Filters & Touch

## Drag handles

Restrict drag starts to a grip inside each item with a CSS selector:

```vue
<Draggable v-model="items" handle=".grip" item-key="id">
  <template #item="{ element }">
    <div class="row">
      <span class="grip">⋮⋮</span>
      <span>{{ element.name }}</span>
    </div>
  </template>
</Draggable>
```

Handles are the recommended pattern for lists containing text (it stays selectable) and for long lists on mobile (users can still scroll by touching outside the grip).

## Filters

Block drags that start on interactive children:

```ts
{ filter: 'button, input, a' }
```

`preventOnFilter` (default `true`) also calls `preventDefault()` on the filtered pointerdown; set it to `false` if your inputs need native focus behaviour.

## Which items are draggable

By default every indexed child is draggable. Restrict with a selector items must match:

```ts
{ draggable: ':not(.locked)' }
```

Items failing the selector still render — they just can't be picked up (drops can still land around them).

## Touch delay (long-press to drag)

Instant drags fight scrolling on touch screens. A delay turns the gesture into long-press-to-drag:

```ts
{
  delay: 200,               // ms before the drag arms
  delayOnTouchOnly: true,   // default — mouse/pen drags stay instant
  touchStartThreshold: 6,   // px of drift allowed during the delay
}
```

A quick tap-and-swipe scrolls the page normally; holding for 200 ms picks the item up.

## Drag threshold

With no delay, a drag begins once the pointer travels `dragThreshold` px (default `5`). Raise it if clicks are being eaten on jittery input devices.

## Disabling

`disabled: true` switches off every interaction on the list — pointer, keyboard and selection — while leaving your rendering untouched.
