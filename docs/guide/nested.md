# Nested Lists

Trees are just lists inside list items. Give every level the same `group` and items drag freely between branches and depths.

```vue
<!-- TreeNode.vue -->
<script setup lang="ts">
import { Draggable } from '@anil-labs/dnd-vue'

defineProps<{ items: TreeItem[] }>()
const emit = defineEmits<{ 'update:items': [TreeItem[]] }>()
</script>

<template>
  <Draggable
    :model-value="items"
    group="tree"
    item-key="id"
    :empty-insert-threshold="12"
    @update:model-value="(v) => emit('update:items', v)"
  >
    <template #item="{ element }">
      <div class="node">
        <div class="label">{{ element.label }}</div>
        <TreeNode
          :items="element.children"
          @update:items="(v) => (element.children = v)"
        />
      </div>
    </template>
  </Draggable>
</template>
```

The same recursion works in every binding — each nested container is its own list registered under the shared group.

## What the engine guarantees

- **Cycle guard** — a node can never be dropped into itself or its own subtree.
- **Deepest list wins** — when lists are visually nested, the innermost one under the pointer receives the drop.
- **Empty branches** — `emptyInsertThreshold` (plus a little `min-height`/padding on empty containers) makes leaf targets easy to hit.

## Tips

- Use `handle` on the row label so children's containers don't fight the parent for drags.
- Keep per-level state updates immutable if your framework expects it (clone the `children` array in `update:items`).
- Indent with CSS on the nested container, not on items — hit-testing uses item rectangles.
