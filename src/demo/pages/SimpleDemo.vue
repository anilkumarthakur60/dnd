<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
  { id: 4, name: 'Date' },
  { id: 5, name: 'Elderberry' },
])
</script>

<template>
  <p class="demo-desc">Drag any item to reorder. List is animated via FLIP.</p>
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
