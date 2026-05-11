<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref([
  { id: 1, label: 'الأول' },
  { id: 2, label: 'الثاني' },
  { id: 3, label: 'الثالث' },
  { id: 4, label: 'الرابع' },
  { id: 5, label: 'الخامس' },
  { id: 6, label: 'السادس' },
  { id: 7, label: 'السابع' },
  { id: 8, label: 'الثامن' },
  { id: 9, label: 'التاسع' },
  { id: 10, label: 'العاشر' },
])
</script>

<template>
  <p class="demo-desc">
    Horizontal list rendered right-to-left. Setting <code>rtl</code> (or putting <code>dir="rtl"</code> on the container)
    flips the drag-to-reorder direction so insertion follows the visual order.
  </p>
  <div class="demo-card" dir="rtl">
    <Draggable
      v-model="items"
      item-key="id"
      :animation="200"
      direction="horizontal"
      class="rtl-list"
    >
      <template #item="{ element }">
        <div class="rtl-item">{{ element.label }}</div>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.rtl-list {
  display: flex;
  gap: 8px;
  direction: rtl;
  overflow-x: auto;
  padding-bottom: 4px;
}
.rtl-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: grab;
  flex-shrink: 0;
  min-width: 64px;
  text-align: center;
}
</style>
