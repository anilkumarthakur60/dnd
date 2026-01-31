<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, name: 'General settings' },
  { id: 2, name: 'Notifications' },
  { id: 3, name: 'Privacy & security' },
  { id: 4, name: 'Billing' },
  { id: 5, name: 'Team & seats' },
  { id: 6, name: 'API keys' },
  { id: 7, name: 'Integrations' },
  { id: 8, name: 'Audit log' },
  { id: 9, name: 'Webhooks' },
  { id: 10, name: 'Custom domains' },
  { id: 11, name: 'Appearance' },
  { id: 12, name: 'Data export' },
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
