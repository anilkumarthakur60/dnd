# Animation

## FLIP reordering

Every reorder — pointer, keyboard or programmatic during a drag — is animated with the FLIP technique: the engine snapshots item positions, your framework re-renders, and each moved element animates from its old position via the Web Animations API.

```ts
{
  animation: 200,                        // duration in ms (0 disables)
  easing: 'cubic-bezier(0.2, 0, 0, 1)',  // any CSS easing
}
```

There is nothing to configure per framework — the engine waits for your binding's render cycle (`nextTick`, `flushSync`, `tick()`…) before playing the animation.

## The ghost

While dragging, a floating **ghost** follows the pointer:

- By default it's a clone of the item element (with a count badge in multi-drag).
- It carries the `dnd-ghost` class plus your `dragClass` if set.
- Build your own with [`ghostFactory`](/guide/styling#custom-ghosts).

The item left behind gets `dnd-placeholder` (dimmed) plus your `ghostClass`.

## Revert animations

- **Cancel** (<kbd>Esc</kbd> / `pointercancel`): the ghost animates back to the source position, then the order restores with a FLIP.
- **`revertOnSpill`**: same, when dropping outside every list.
- **`revertClone`**: a clone dropped back on its own source animates home and is discarded.

## Entrance / exit transitions

Adding and removing items is your framework's job — combine the engine with its transition primitives. Vue's `<Draggable>` has it built in:

```vue
<Draggable v-model="items" transition-name="list" item-key="id">…</Draggable>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

When `transitionName` is set the container renders as a `<TransitionGroup>` (header/footer slots are disabled in this mode).

## Reduced motion

The stylesheet disables ghost transitions under `prefers-reduced-motion: reduce`; pair it with `animation: 0` if you want to remove FLIP for those users too:

```ts
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
createSortable(el, { animation: reduced ? 0 : 200 })
```
