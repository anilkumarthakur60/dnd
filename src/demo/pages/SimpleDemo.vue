<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
  { id: 4, name: 'Date' },
  { id: 5, name: 'Elderberry' },
  { id: 6, name: 'Fig' },
  { id: 7, name: 'Grapefruit' },
  { id: 8, name: 'Honeydew' },
  { id: 9, name: 'Kiwi' },
  { id: 10, name: 'Lemon' },
  { id: 11, name: 'Mango' },
  { id: 12, name: 'Nectarine' },
  { id: 13, name: 'Orange' },
  { id: 14, name: 'Papaya' },
  { id: 15, name: 'Quince' },
  { id: 16, name: 'Raspberry' },
  { id: 17, name: 'Strawberry' },
  { id: 18, name: 'Tangerine' },
])

const reset = makeReset(items)
</script>

<template>
  <p class="demo-desc">Drag any item to reorder. List is animated via FLIP.</p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>List</h3>
      <Draggable v-model="items" item-key="id" :animation="200" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.name }}</div>
        </template>
      </Draggable>
    </div>
  </div>
  <pre class="demo-state">{{ items }}</pre>
</template>
