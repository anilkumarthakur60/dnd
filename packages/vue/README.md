# @anil-labs/dnd-vue

Vue 3 bindings for [`@anil-labs/dnd-core`](https://www.npmjs.com/package/@anil-labs/dnd-core) — zero-dependency drag & drop with groups, clone, multi-drag, swap and keyboard a11y.

```vue
<script setup>
import { ref } from 'vue'
import { Draggable } from '@anil-labs/dnd-vue'
import '@anil-labs/dnd-core/styles.css'

const items = ref([{ id: 1, text: 'Apple' }, { id: 2, text: 'Banana' }])
</script>

<template>
  <Draggable v-model="items" item-key="id" :animation="200" group="tasks">
    <template #item="{ element }">
      <div class="card">{{ element.text }}</div>
    </template>
  </Draggable>
</template>
```

Also ships the headless `useDraggable(items, options)` composable and the `DndPlugin` global registration.

- **[Documentation](https://anilkumarthakur60.github.io/vue-dnd/frameworks/vue)** · **[Live demo](https://anil-labs-dnd.vercel.app/vue/)**

MIT © Er. Anil Kumar Thakur
