# Groups & Cloning

Lists sharing a group **name** accept drops from each other. The `group` option is either a string or a config object:

```ts
type DragGroup =
  | string
  | {
      name: string
      pull?: boolean | 'clone' | string[] | ((to, from) => boolean | 'clone' | undefined)
      put?: boolean | string[] | ((to, from) => boolean | undefined)
    }
```

- **`pull`** — may items *leave* this list? `'clone'` copies them out and keeps the original. An array allows pulling only into the named groups; a function decides per drag.
- **`put`** — does this list *accept* incoming items? An array allows only the named source groups; a function decides per drag.

Lists with no `group` are fully isolated. Boolean `pull`/`put` only transfer between lists with the **same name**; use arrays or functions to bridge differently-named groups.

## Cross-list move

```vue
<Draggable v-model="todo" group="tasks" item-key="id">…</Draggable>
<Draggable v-model="done" group="tasks" item-key="id">…</Draggable>
```

While dragging, the item leaves `todo` (an `onRemove`/`remove` event) and enters `done` (`onAdd`/`add`) live; dropping finalizes with `onEnd`.

## One-way lanes

```ts
// Items may leave, but nothing can be dropped in:
{ group: { name: 'tasks', put: false } }

// Accepts drops, but its items can't leave:
{ group: { name: 'tasks', pull: false } }
```

## Clone (palette → canvas)

```vue
<Draggable
  v-model="palette"
  :group="{ name: 'blocks', pull: 'clone', put: false }"
  :sort="false"
  :clone="(item) => ({ ...item, id: crypto.randomUUID() })"
  item-key="id"
>
  …
</Draggable>

<Draggable v-model="canvas" group="blocks" item-key="id">…</Draggable>
```

- `pull: 'clone'` keeps the original in the palette and inserts a copy into the target.
- `clone` transforms the copy — give it a fresh id. Without it, the engine falls back to `structuredClone`.
- `sort: false` stops the palette itself from being reordered.
- `revertClone: true` animates the ghost home when a clone is dropped back on its own source.

## Function rules

```ts
{
  group: {
    name: 'tasks',
    // Only allow pulling into the archive when the item is done:
    pull: (to) => (to.name === 'archive' ? true : undefined),
    // Reject drops coming from the trash:
    put: (_to, from) => from.name !== 'trash',
  }
}
```

Returning `undefined` falls back to the default (allow, same-name).

## Spill — dropping outside every list

By default a drop outside any valid list leaves items where they last were. Two options change that:

- **`revertOnSpill: true`** — the ghost animates back and the original order is restored (`onEnd` fires with `cancelled: true`).
- **`removeOnSpill: true`** — the dragged items are removed entirely; use it for "drag out to delete".

## Empty lists

An empty list has no items to hit-test against, so the engine also accepts drops within `emptyInsertThreshold` pixels of the list's bounds (default `5`). Give empty containers a `min-height` so there is something to aim at.
