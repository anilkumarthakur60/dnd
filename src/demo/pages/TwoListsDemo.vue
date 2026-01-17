<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const left = ref([
  { id: 1, name: 'Inbox' },
  { id: 2, name: 'Project Alpha' },
  { id: 3, name: 'Quarterly Plan' },
])

const right = ref([
  { id: 4, name: 'Done last week' },
  { id: 5, name: 'Ship release' },
])
</script>

<template>
  <p class="demo-desc">
    Drag items between the two lists. Both have <code>group: "tasks"</code> so they share a drop target.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>To do</h3>
      <Draggable v-model="left" group="tasks" item-key="id" :animation="200" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.name }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>Done</h3>
      <Draggable v-model="right" group="tasks" item-key="id" :animation="200" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.name }}</div>
        </template>
      </Draggable>
    </div>
  </div>
  <pre class="demo-state">{{ { left, right } }}</pre>
</template>
