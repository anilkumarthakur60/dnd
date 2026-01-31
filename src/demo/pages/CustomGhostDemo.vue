<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import type { GhostFactoryInfo } from '../../lib'

interface User {
  id: number
  name: string
  role: string
}

const users = ref<User[]>([
  { id: 1, name: 'Aki Tanaka', role: 'Senior Engineer' },
  { id: 2, name: 'Beatriz Lima', role: 'Product Designer' },
  { id: 3, name: 'Chen Wei', role: 'PM' },
  { id: 4, name: 'Daria Volkov', role: 'Staff Engineer' },
  { id: 5, name: 'Esha Patel', role: 'Engineer' },
  { id: 6, name: 'Felix Müller', role: 'Brand Designer' },
  { id: 7, name: 'Grace Okoye', role: 'PM, ML' },
  { id: 8, name: 'Hiro Sato', role: 'Mobile Engineer' },
  { id: 9, name: 'Ines Costa', role: 'Engineering Manager' },
  { id: 10, name: 'Jamal Wright', role: 'SRE' },
  { id: 11, name: 'Kira Novak', role: 'Researcher' },
  { id: 12, name: 'Luis Ferreira', role: 'Data Engineer' },
])

function makeGhost(info: GhostFactoryInfo<User>): HTMLElement {
  const u = info.items[0]
  const el = document.createElement('div')
  el.style.padding = '12px 18px'
  el.style.background = 'linear-gradient(135deg, #6ea8ff, #8effc7)'
  el.style.color = '#0b0f17'
  el.style.borderRadius = '999px'
  el.style.fontWeight = '700'
  el.style.fontFamily = '-apple-system, system-ui, sans-serif'
  el.style.fontSize = '14px'
  el.style.whiteSpace = 'nowrap'
  el.textContent = `${u.name} • ${u.role}`
  return el
}
</script>

<template>
  <p class="demo-desc">
    The ghost (the floating element that follows the cursor) is fully customizable via <code>:ghost-factory</code>.
    Here we render a colorful pill instead of cloning the row.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Team roster</h3>
      <Draggable
        v-model="users"
        item-key="id"
        :animation="200"
        :ghost-factory="makeGhost"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">
            <strong>{{ element.name }}</strong>
            <span style="color: var(--muted)">{{ element.role }}</span>
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
