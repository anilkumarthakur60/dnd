<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const yItems = ref(
  Array.from({ length: 10 }, (_, i) => ({ id: i + 1, label: `Y-locked row ${i + 1}` })),
)

const xItems = ref([
  { id: 'a', label: 'Mon' },
  { id: 'b', label: 'Tue' },
  { id: 'c', label: 'Wed' },
  { id: 'd', label: 'Thu' },
  { id: 'e', label: 'Fri' },
  { id: 'f', label: 'Sat' },
  { id: 'g', label: 'Sun' },
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
  overflow-x: auto;
  padding-bottom: 4px;
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
