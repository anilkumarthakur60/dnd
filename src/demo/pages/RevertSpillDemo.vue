<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref([
  { id: 1, label: 'Magnetic' },
  { id: 2, label: 'Springs back' },
  { id: 3, label: 'Try dragging outside' },
  { id: 4, label: 'I always come home' },
  { id: 5, label: 'Drop me on the wall' },
  { id: 6, label: 'No escape from gravity' },
  { id: 7, label: 'Snap back!' },
  { id: 8, label: 'Boomerang' },
  { id: 9, label: 'Velcro item' },
  { id: 10, label: 'Last but not least' },
])

const reset = makeReset(items)
</script>

<template>
  <p class="demo-desc">
    Drop an item outside any valid list and the ghost animates back to its original position.
    Enable via <code>revert-on-spill</code>.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
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
