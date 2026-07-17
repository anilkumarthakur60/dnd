<script setup lang="ts">
import { Draggable } from '@anil-labs/dnd'

export interface TreeItem {
  id: number
  label: string
  children: TreeItem[]
}

defineProps<{ items: TreeItem[] }>()
const emit = defineEmits<{ 'update:items': [TreeItem[]] }>()
</script>

<template>
  <Draggable
    :model-value="items"
    item-key="id"
    group="tree"
    :animation="200"
    :empty-insert-threshold="14"
    tag="ul"
    item-tag="li"
    :class="['tree-list', { 'tree-list--empty': items.length === 0 }]"
    @update:model-value="(v) => emit('update:items', v as TreeItem[])"
  >
    <template #item="{ element }">
      <div class="tree-node">
        <div class="tree-row">
          <span class="grip">⠿</span>
          <span class="tree-label">{{ element.label }}</span>
        </div>
        <TreeNode
          v-if="element.label.endsWith('/')"
          :items="element.children"
          @update:items="(v) => (element.children = v)"
        />
      </div>
    </template>
  </Draggable>
</template>
