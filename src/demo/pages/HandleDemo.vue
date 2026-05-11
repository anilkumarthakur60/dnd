<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, name: 'Settings' },
  { id: 2, name: 'Notifications' },
  { id: 3, name: 'Privacy' },
  { id: 4, name: 'Billing' },
])
</script>

<template>
  <p class="demo-desc">
    Drag only works from the <span class="handle-grip">⋮⋮</span> grip. Use <code>handle</code> prop with a CSS selector.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>List</h3>
      <Draggable
        v-model="items"
        item-key="id"
        :animation="200"
        handle=".handle-grip"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">
            <span>{{ element.name }}</span>
            <span class="handle-grip">⋮⋮</span>
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
