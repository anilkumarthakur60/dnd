<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

interface Card {
  id: number
  title: string
  status: 'todo' | 'doing' | 'done'
  assignee: string
  tags: string[]
}

const cards = ref<Card[]>([
  { id: 1, title: 'Spec out billing flow', status: 'todo', assignee: 'Aki', tags: ['design', 'billing'] },
  { id: 2, title: 'Migrate auth middleware', status: 'doing', assignee: 'Chen', tags: ['backend'] },
  { id: 3, title: 'Pricing page rev', status: 'todo', assignee: 'Bea', tags: ['marketing'] },
  { id: 4, title: 'Ship v2 dashboard', status: 'done', assignee: 'Daria', tags: ['frontend', 'launch'] },
  { id: 5, title: 'Onboarding checklist v3', status: 'doing', assignee: 'Esha', tags: ['cs'] },
  { id: 6, title: 'Update CHANGELOG', status: 'todo', assignee: 'Felix', tags: ['docs'] },
  { id: 7, title: 'Search relevance tuning', status: 'doing', assignee: 'Grace', tags: ['ml', 'backend'] },
  { id: 8, title: 'Mobile push permissions', status: 'todo', assignee: 'Hiro', tags: ['mobile', 'a11y'] },
  { id: 9, title: 'Q2 OKR draft', status: 'done', assignee: 'Ines', tags: ['planning'] },
  { id: 10, title: 'Postmortem: outage 4/12', status: 'done', assignee: 'Jamal', tags: ['infra', 'docs'] },
  { id: 11, title: 'A11y audit pass 2', status: 'doing', assignee: 'Bea', tags: ['frontend', 'a11y'] },
  { id: 12, title: 'Vendor renewal — Datadog', status: 'todo', assignee: 'Chen', tags: ['ops'] },
])

const statusColor: Record<Card['status'], string> = {
  todo: '#8a93a3',
  doing: '#6ea8ff',
  done: '#8effc7',
}

const reset = makeReset(cards)
</script>

<template>
  <p class="demo-desc">
    The item slot can render any complex component — here, card-style elements with multiple sub-views (chips, avatars).
    Works the same as any other list.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-card">
    <Draggable v-model="cards" item-key="id" :animation="200" class="card-list">
      <template #item="{ element }">
        <article class="fancy-card">
          <header>
            <span class="status-dot" :style="{ background: statusColor[element.status] }" />
            <strong>{{ element.title }}</strong>
            <span class="avatar">{{ element.assignee.charAt(0) }}</span>
          </header>
          <div class="tags">
            <span v-for="t in element.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </article>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fancy-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
}
.fancy-card header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fancy-card header strong {
  flex: 1;
  font-size: 14px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: #0b0f17;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.tags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.tag {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--muted);
}
</style>
