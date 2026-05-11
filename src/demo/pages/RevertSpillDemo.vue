<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, label: 'Magnetic' },
  { id: 2, label: 'Springs back' },
  { id: 3, label: 'Try dragging outside' },
  { id: 4, label: 'I always come home' },
])
</script>

<template>
  <p class="demo-desc">
    Drop an item outside any valid list and the ghost animates back to its original position.
    Enable via <code>revert-on-spill</code>.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Snap-back list</h3>
      <Draggable
        v-model="items"
        item-key="id"
        :animation="250"
        revert-on-spill
        :group="{ name: 'isolated', pull: true, put: false }"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
