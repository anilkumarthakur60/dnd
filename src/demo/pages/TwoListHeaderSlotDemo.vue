<script setup lang="ts">
import { ref, computed } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const a = ref([
  { id: 1, t: 'Refactor auth middleware' },
  { id: 2, t: 'Profile page redesign' },
  { id: 3, t: 'Migrate Postgres to v16' },
  { id: 4, t: 'Spec out billing v3' },
  { id: 5, t: 'Audit dependency tree' },
  { id: 6, t: 'Investigate latency spike' },
  { id: 7, t: 'Improve search ranking' },
  { id: 8, t: 'Rewrite onboarding flow' },
])
const b = ref([
  { id: 9, t: 'Ship beta to power users' },
  { id: 10, t: 'Resolve flaky CI test' },
  { id: 11, t: 'Profile memory hotspot' },
  { id: 12, t: 'Pair on auth rollout' },
  { id: 13, t: 'Draft Q2 roadmap' },
])

const aCount = computed(() => a.value.length)
const bCount = computed(() => b.value.length)

const reset = makeReset(a, b)
</script>

<template>
  <p class="demo-desc">
    Two lists, each with its own <code>#header</code>. They share a group so items can move between them — and counts update live.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <Draggable v-model="a" group="cross" item-key="id" :animation="200" class="demo-list">
        <template #header>
          <div class="list-header">
            <strong>Backlog</strong>
            <span class="badge muted">{{ aCount }}</span>
          </div>
        </template>
        <template #item="{ element }">
          <div class="demo-item">{{ element.t }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <Draggable v-model="b" group="cross" item-key="id" :animation="200" class="demo-list">
        <template #header>
          <div class="list-header">
            <strong>In Progress</strong>
            <span class="badge">{{ bCount }}</span>
          </div>
        </template>
        <template #item="{ element }">
          <div class="demo-item">{{ element.t }}</div>
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
.badge.muted {
  background: var(--surface-2);
  color: var(--muted);
}
</style>
