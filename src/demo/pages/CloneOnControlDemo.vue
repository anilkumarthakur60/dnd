<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Draggable } from '../../lib'

const ctrlDown = ref(false)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Control' || e.key === 'Meta') ctrlDown.value = true
}
function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'Control' || e.key === 'Meta') ctrlDown.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

const source = ref([
  { id: 1, label: 'Meeting notes 2026-Q1' },
  { id: 2, label: 'Onboarding checklist' },
  { id: 3, label: 'Release runbook v4' },
  { id: 4, label: 'Postmortem template' },
  { id: 5, label: 'Roadmap snapshot' },
  { id: 6, label: 'Hiring scorecard' },
  { id: 7, label: 'PRD: search rev' },
  { id: 8, label: 'Brand guidelines' },
  { id: 9, label: 'OKR dashboard' },
  { id: 10, label: 'Vendor list' },
])
const target = ref<Array<{ id: number; label: string }>>([])

function pull() {
  return ctrlDown.value ? 'clone' : true
}
</script>

<template>
  <p class="demo-desc">
    Hold <span class="kbd">Ctrl</span> (or <span class="kbd">⌘</span>) while dragging to copy instead of move.
    Status: <strong>{{ ctrlDown ? 'CLONE' : 'MOVE' }}</strong>
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Source</h3>
      <Draggable
        v-model="source"
        :group="{ name: 'ctrlmove', pull, put: true }"
        item-key="id"
        :animation="200"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>Target</h3>
      <Draggable
        v-model="target"
        group="ctrlmove"
        item-key="id"
        :animation="200"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
  <pre class="demo-state">{{ { source, target } }}</pre>
</template>
