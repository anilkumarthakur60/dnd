<script setup lang="ts">
import { ref, computed } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, label: 'Read pull request feedback' },
  { id: 2, label: 'Resolve merge conflict' },
  { id: 3, label: 'Update changelog' },
  { id: 4, label: 'Cut release candidate' },
])

const count = computed(() => items.value.length)
</script>

<template>
  <p class="demo-desc">
    A <code>#header</code> slot lives above the items inside the same container. It isn't draggable.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <Draggable v-model="items" item-key="id" :animation="200" class="demo-list">
        <template #header>
          <div class="list-header">
            <strong>Release Checklist</strong>
            <span class="badge">{{ count }}</span>
          </div>
        </template>
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.badge {
  background: var(--accent);
  color: #0b0f17;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
</style>
