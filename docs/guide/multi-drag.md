# Multi-Drag

Enable `multiDrag` to let users select several items and drag them as one batch:

```tsx
<Draggable
  items={files}
  onItemsChange={setFiles}
  itemKey="id"
  multiDrag
  renderItem={({ item, selected }) => (
    <div className="row">{selected ? '☑' : '☐'} {item.name}</div>
  )}
/>
```

## Interactions

- **Ctrl/Cmd/Shift-click** toggles an item in and out of the selection.
- **Dragging any selected item** moves the whole selection as a contiguous block — scattered selections fold together around the first selected item when the drag starts.
- The default ghost shows a **count badge** with the batch size.
- The selection **clears automatically** after the drop.
- A plain pointerdown on an unselected item clears the selection first.

## Rendering the selection

Selected items get the `selectedClass` (default `dnd-selected`, a themable outline). Bindings also expose selection state so you can render your own affordances:

- React/Solid: `selected` in `renderItem` / `dnd.selection()`
- Vue: the `selected` slot prop
- Everywhere: the `onSelectionChange` callback / `selection-change` event

## Programmatic selection

```ts
list.select([0, 2, 3]) // set selection by index
list.getSelection()    // -> number[]
list.clearSelection()
```

Available on the `DndList` instance — via `ref` (React), template ref (Vue), `dnd.select(…)` (Solid), or `sortable.list` (vanilla / Web Component).

## Limits

Cap how many items travel together with `dragMaxItems` (default `0` = unlimited); extra selected items past the cap stay behind.

Cross-list rules apply to the whole batch: the group's `pull`/`put` is evaluated once and the entire block transfers (or clones) together.
