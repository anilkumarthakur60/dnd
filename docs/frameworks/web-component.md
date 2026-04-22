# Web Component

```sh
npm install @anil-labs/dnd-element
```

`<dnd-list>` turns its element children into a sortable list — in plain HTML or inside any framework. Styles are injected automatically.

```html
<script type="module">
  import '@anil-labs/dnd-element'
</script>

<dnd-list group="tasks" animation="200">
  <div>Apple</div>
  <div>Banana</div>
  <div>Cherry</div>
</dnd-list>

<dnd-list group="tasks" animation="200">
  <div>Dragonfruit</div>
</dnd-list>
```

## CDN

```html
<script src="https://unpkg.com/@anil-labs/dnd-element"></script>
<dnd-list animation="200">
  <div>Apple</div>
  <div>Banana</div>
</dnd-list>
```

## Attributes

Common options map to kebab-case attributes:

`group`, `animation`, `easing`, `handle`, `filter`, `item-selector`, `disabled`, `sort`, `swap`, `swap-threshold`, `invert-swap`, `axis`, `direction`, `delay`, `delay-on-touch-only`, `touch-start-threshold`, `ghost-class`, `chosen-class`, `drag-class`, `selected-class`, `empty-insert-threshold`, `drag-max-items`, `rtl`, `multi-drag`, `keyboard`, `list-label`.

Boolean attributes: present = `true`, `="false"` = `false`. Attributes react live — change one and the engine updates.

```html
<dnd-list keyboard multi-drag list-label="Files" handle=".grip">…</dnd-list>
```

## The `options` property

Anything beyond attributes — functions, group objects, callbacks — goes through the property:

```js
const list = document.querySelector('dnd-list')
list.options = {
  group: { name: 'blocks', pull: 'clone', put: false },
  ghostFactory: ({ count }) => Object.assign(document.createElement('div'), { textContent: `${count}×` }),
}
```

## Events

Every engine event is re-dispatched as a bubbling `CustomEvent` with the engine payload as `detail` (items are the child elements):

| Event | Fires |
| --- | --- |
| `dnd-start` / `dnd-end` | Drag lifecycle. |
| `dnd-add` / `dnd-remove` / `dnd-update` | This list gained / lost / reordered an item. |
| `dnd-change` | Union of the three above. |
| `dnd-choose` / `dnd-unchoose` | Pointer press / release on an item. |
| `dnd-select` | Multi-drag selection changed. |
| `dnd-keyboard` | A keyboard reorder was committed. |

```js
list.addEventListener('dnd-end', (e) => {
  const { oldIndex, newIndex, cancelled } = e.detail
  if (!cancelled) save(oldIndex, newIndex)
})
```

## Methods & internals

```js
list.refresh()          // re-scan children after manual DOM changes
list.sortable           // the underlying Sortable
list.sortable.list      // the DndList — select(), move(), getSelection()…
```

## Custom tag

```js
import { register } from '@anil-labs/dnd-element'
register('my-sortable') // define under a different tag name
```
