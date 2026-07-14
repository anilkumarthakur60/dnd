# Svelte

```sh
npm install @anil-labs/dnd-svelte
```

Works with Svelte 4 and Svelte 5 (runes) alike.

## The `use:draggable` action

You render the list with `{#each}`; the action wires the engine to the container:

```svelte
<script lang="ts">
  import { draggable } from '@anil-labs/dnd-svelte'
  import '@anil-labs/dnd-core/styles.css'

  let items = $state([
    { id: 1, text: 'Apple' },
    { id: 2, text: 'Banana' },
    { id: 3, text: 'Cherry' },
  ])
</script>

<ul
  use:draggable={{
    items,
    onItemsChange: (v) => (items = v),
    group: 'tasks',
    animation: 200,
    onEnd: (e) => console.log('dropped', e.oldIndex, '→', e.newIndex),
  }}
>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">{item.text}</li>
  {/each}
</ul>
```

Three rules for the markup:

1. Items are **keyed** direct children (`(item.id)`) so Svelte moves nodes instead of recreating them.
2. Each item carries `data-dnd-index={i}` matching its array position.
3. Each item has the `dnd-item` class (cursor + `touch-action`).

## Options

`items` and `onItemsChange` plus everything in the [options reference](/reference/options) — including all event callbacks (`onStart`, `onEnd`, `onAdd`, `onRemove`, `onUpdate`, `onChange`, `onSelectionChange`, `onKeyboardMove`, …).

The action's `update` runs whenever the options object changes, so reactive values Just Work:

```svelte
<ul use:draggable={{ items, onItemsChange: (v) => (items = v), disabled: locked }}>
```

## Svelte 4

Identical, with store/`let` state instead of runes:

```svelte
<script>
  import { draggable } from '@anil-labs/dnd-svelte'
  let items = [{ id: 1, text: 'Apple' }]
</script>

<ul use:draggable={{ items, onItemsChange: (v) => (items = v), animation: 200 }}>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">{item.text}</li>
  {/each}
</ul>
```

## Selection & keyboard state

Track them via callbacks and render whatever you like:

```svelte
<script lang="ts">
  let selected = $state<number[]>([])
</script>

<ul
  use:draggable={{
    items,
    onItemsChange: (v) => (items = v),
    multiDrag: true,
    onSelectionChange: (e) => (selected = e.indices),
  }}
>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item" class:picked={selected.includes(i)}>
      {item.text}
    </li>
  {/each}
</ul>
```

For keyboard mode add `tabindex="0"` to items (or rely on the engine's announcements only); the `dnd-keyboard-active` outline is applied via `onKeyboardStateChange` if you mirror it into a class the same way.
