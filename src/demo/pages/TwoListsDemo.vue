<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const left = ref([
  { id: 1, name: 'Triage inbound bugs' },
  { id: 2, name: 'Spec project Alpha' },
  { id: 3, name: 'Quarterly OKR review' },
  { id: 4, name: 'Refactor auth middleware' },
  { id: 5, name: 'Migrate Postgres v16' },
  { id: 6, name: 'Onboard new hire' },
  { id: 7, name: 'Update changelog' },
  { id: 8, name: 'Renew vendor contracts' },
  { id: 9, name: 'Run security audit' },
  { id: 10, name: 'Plan team offsite' },
])

const right = ref([
  { id: 11, name: 'Shipped: dark mode' },
  { id: 12, name: 'Shipped: billing v2' },
  { id: 13, name: 'Shipped: keyboard a11y' },
  { id: 14, name: 'Shipped: mobile nav' },
  { id: 15, name: 'Shipped: SSO support' },
  { id: 16, name: 'Shipped: search rewrite' },
  { id: 17, name: 'Shipped: docs site' },
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
