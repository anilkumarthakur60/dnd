<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const a = ref([
  { id: 1, t: 'Q1 plan.pdf' },
  { id: 2, t: 'Brand guide.fig' },
  { id: 3, t: 'Roadmap.xlsx' },
  { id: 4, t: 'Postmortem.md' },
  { id: 5, t: 'Architecture.png' },
  { id: 6, t: 'Onboarding.pdf' },
  { id: 7, t: 'API reference.html' },
  { id: 8, t: 'Vendor list.csv' },
  { id: 9, t: 'Security policy.md' },
  { id: 10, t: 'Hiring rubric.pdf' },
])
const b = ref<Array<{ id: number; t: string }>>([])

const reset = makeReset(a, b)
</script>

<template>
  <p class="demo-desc">
    The empty list on the right uses <code>:empty-insert-threshold="40"</code> — drops register
    even when the cursor is 40px outside its bounds, making it forgiving for short lists.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Source</h3>
      <Draggable v-model="a" group="docs" item-key="id" :animation="200" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.t }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>Target (empty)</h3>
      <Draggable
        v-model="b"
        group="docs"
        item-key="id"
        :animation="200"
        :empty-insert-threshold="40"
        class="demo-list empty-zone"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.t }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
.empty-zone {
  min-height: 80px;
  border: 2px dashed var(--border);
  border-radius: 8px;
}
</style>
