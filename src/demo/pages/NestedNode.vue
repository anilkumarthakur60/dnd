<script setup lang="ts">
import { Draggable } from '../../lib'

interface Node {
  id: number
  label: string
  children: Node[]
}

const props = defineProps<{ node: Node }>()

function update(next: Node[]) {
  props.node.children.splice(0, props.node.children.length, ...next)
}
</script>

<template>
  <Draggable
    :model-value="node.children"
    @update:model-value="update"
    group="tree"
    item-key="id"
    :animation="200"
    :empty-insert-threshold="12"
    class="nested-node"
  >
    <template #header>
      <div class="node-label" :data-node-id="node.id">
        <span class="grip">⋮⋮</span>
        <span class="text">{{ node.label }}</span>
        <span v-if="node.children.length" class="count">{{ node.children.length }}</span>
      </div>
    </template>
    <template #item="{ element }">
      <NestedNode :node="element" />
    </template>
  </Draggable>
</template>

<style scoped>
.nested-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 6px 6px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  position: relative;
}
.nested-node::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 28px;
  bottom: 8px;
  border-left: 1px dashed var(--border);
}
.node-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px;
  margin-left: -8px;
  font-size: 13px;
  cursor: grab;
  border-radius: 4px;
}
.node-label .grip {
  color: var(--muted);
  font-size: 12px;
  user-select: none;
}
.node-label .text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.node-label .count {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 860px) {
  .nested-node { padding: 3px 4px 4px 10px; }
  .nested-node::before { left: 4px; top: 24px; }
  .node-label { font-size: 12px; padding: 3px 2px; margin-left: -6px; }
}
</style>
