<script setup lang="ts">
import { Draggable } from '../../lib'

interface Node {
  id: number
  label: string
  children: Node[]
}

const props = defineProps<{ items: Node[] }>()

function updateItems(next: Node[]) {
  props.items.splice(0, props.items.length, ...next)
}
</script>

<template>
  <Draggable
    :model-value="items"
    @update:model-value="updateItems"
    group="tree"
    item-key="id"
    :animation="200"
    class="nested-list"
  >
    <template #item="{ element }">
      <div class="nested-node">
        <div class="nested-label">{{ element.label }}</div>
        <NestedNode :items="element.children" />
      </div>
    </template>
  </Draggable>
</template>

<style scoped>
.nested-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 18px;
  min-height: 6px;
}
.nested-list:empty {
  border-left: 1px dashed var(--border);
}
.nested-node {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
}
.nested-label {
  font-size: 13px;
  padding: 2px 0;
  cursor: grab;
}
</style>
