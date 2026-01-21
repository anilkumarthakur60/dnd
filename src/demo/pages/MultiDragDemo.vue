<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const items = ref(
  Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `File-${String(i + 1).padStart(2, '0')}.txt` })),
)

const selected = ref<number[]>([])
function onSelectionChange(payload: { indices: number[] }) {
  selected.value = payload.indices
}
</script>

<template>
  <p class="demo-desc">
    Hold <span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> and click items to select multiple, then drag any selected item to move them all together.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Files ({{ selected.length }} selected)</h3>
      <Draggable
        v-model="items"
        item-key="id"
        :animation="200"
        multi-drag
        selected-class="file-selected"
        class="demo-list"
        @selection-change="onSelectionChange"
      >
        <template #item="{ element, selected: isSel }">
          <div class="demo-item" :class="{ sel: isSel }">
            <span class="file-ico">📄</span>
            {{ element.label }}
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
.file-ico { margin-right: 8px; }
.sel { background: rgba(110, 168, 255, 0.18); }
</style>
