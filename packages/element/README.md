# @anil-labs/dnd-element

`<dnd-list>` Web Component for [`@anil-labs/dnd-core`](https://www.npmjs.com/package/@anil-labs/dnd-core) — zero-dependency drag & drop in any framework or plain HTML.

```html
<script type="module">
  import '@anil-labs/dnd-element'
</script>

<dnd-list group="tasks" animation="200">
  <div>Apple</div>
  <div>Banana</div>
  <div>Cherry</div>
</dnd-list>

<script>
  document.querySelector('dnd-list').addEventListener('dnd-end', (e) => {
    console.log(e.detail.oldIndex, '→', e.detail.newIndex)
  })
</script>
```

Or straight from a CDN: `<script src="https://unpkg.com/@anil-labs/dnd-element"></script>`.

- **[Documentation](https://anilkumarthakur60.github.io/dnd/frameworks/web-component)** · **[Live demo](https://anil-labs-dnd.vercel.app/element/)**

MIT © Er. Anil Kumar Thakur
