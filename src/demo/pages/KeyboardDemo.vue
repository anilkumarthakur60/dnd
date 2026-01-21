<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, label: 'Background sync' },
  { id: 2, label: 'Push notifications' },
  { id: 3, label: 'Offline support' },
  { id: 4, label: 'Mobile gestures' },
  { id: 5, label: 'Dark theme' },
])
</script>

<template>
  <p class="demo-desc">
    Fully keyboard-accessible. <span class="kbd">Tab</span> to focus an item, <span class="kbd">Space</span> to pick up,
    <span class="kbd">↑</span> / <span class="kbd">↓</span> to move, <span class="kbd">Space</span> again to drop, <span class="kbd">Esc</span> to cancel.
    Screen readers hear position changes via an <code>aria-live</code> region.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Roadmap (keyboard-enabled)</h3>
      <Draggable
        v-model="items"
        item-key="id"
        :animation="200"
        keyboard
        aria-label="roadmap items"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
