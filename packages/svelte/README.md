# @anil-labs/dnd-svelte

Svelte bindings for [`@anil-labs/dnd-core`](https://www.npmjs.com/package/@anil-labs/dnd-core) — zero-dependency drag & drop with groups, clone, multi-drag, swap and keyboard a11y. Works with Svelte 4 and 5.

```svelte
<script>
  import { draggable } from '@anil-labs/dnd-svelte'
  import '@anil-labs/dnd-core/styles.css'

  let items = $state([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])
</script>

<ul use:draggable={{ items, onItemsChange: (v) => (items = v), animation: 200 }}>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">{item.text}</li>
  {/each}
</ul>
```

- **[Documentation](https://anilkumarthakur60.github.io/dnd/frameworks/svelte)** · **[Live demo](https://anil-labs-dnd.vercel.app/svelte/)**

MIT © Er. Anil Kumar Thakur
