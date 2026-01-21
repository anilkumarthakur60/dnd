<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const yItems = ref([
  { id: 1, label: 'Y-locked: 1' },
  { id: 2, label: 'Y-locked: 2' },
  { id: 3, label: 'Y-locked: 3' },
  { id: 4, label: 'Y-locked: 4' },
])

const xItems = ref([
  { id: 'a', label: 'X-locked: A' },
  { id: 'b', label: 'X-locked: B' },
  { id: 'c', label: 'X-locked: C' },
  { id: 'd', label: 'X-locked: D' },
])
</script>

<template>
  <p class="demo-desc">
    The ghost is constrained to a single axis. Useful for kanban columns (vertical) or timelines (horizontal).
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>axis="y"</h3>
      <Draggable v-model="yItems" item-key="id" :animation="200" axis="y" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>axis="x"</h3>
      <Draggable v-model="xItems" item-key="id" :animation="200" axis="x" class="x-list">
        <template #item="{ element }">
          <div class="x-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
.x-list {
  display: flex;
  gap: 8px;
}
.x-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: grab;
  flex-shrink: 0;
}
</style>
