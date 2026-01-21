<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const tiles = ref([
  { id: 1, color: '#6ea8ff', label: 'A' },
  { id: 2, color: '#8effc7', label: 'B' },
  { id: 3, color: '#ffb86e', label: 'C' },
  { id: 4, color: '#ff6e9e', label: 'D' },
  { id: 5, color: '#c084fc', label: 'E' },
  { id: 6, color: '#facc15', label: 'F' },
])
</script>

<template>
  <p class="demo-desc">
    Swap mode — drop on any tile to <strong>swap positions</strong> instead of inserting. Great for grids and dashboards.
  </p>
  <div class="demo-card">
    <Draggable
      v-model="tiles"
      item-key="id"
      :animation="250"
      swap
      class="tile-grid"
    >
      <template #item="{ element }">
        <div class="tile" :style="{ background: element.color }">{{ element.label }}</div>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.tile-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.tile {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 700;
  color: #0b0f17;
  border-radius: 12px;
  cursor: grab;
}
</style>
