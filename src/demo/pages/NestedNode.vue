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
    :empty-insert-threshold="24"
    class="nested-list"
  >
    <template #item="{ element }">
      <div class="nested-node">
        <div class="nested-label">
          <span class="grip">⋮⋮</span>
          <span class="text">{{ element.label }}</span>
          <span v-if="element.children.length" class="count">{{ element.children.length }}</span>
        </div>
        <NestedNode :items="element.children" />
      </div>
    </template>
  </Draggable>
</template>

<style scoped>
.nested-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 14px;
  min-height: 4px;
  border-left: 1px dashed transparent;
}
.nested-list:not(:empty) {
  border-left-color: var(--border);
}
.nested-list:empty {
  height: 4px;
}
.nested-node {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 4px 6px 6px;
}
.nested-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px;
  font-size: 13px;
  cursor: grab;
}
.nested-label .grip {
  color: var(--muted);
  font-size: 12px;
  user-select: none;
}
.nested-label .text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nested-label .count {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 860px) {
  .nested-list { padding-left: 10px; }
  .nested-label { font-size: 12px; padding: 3px 2px; }
  .nested-node { padding: 3px 4px 4px; }
}
</style>
