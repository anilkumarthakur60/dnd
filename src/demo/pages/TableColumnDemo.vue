<script setup lang="ts">
import { ref, computed } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

interface Column {
  key: 'name' | 'role' | 'team' | 'joined' | 'location' | 'status'
  label: string
}

const columns = ref<Column[]>([
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'joined', label: 'Joined' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
])

const data = ref([
  { name: 'Aki Tanaka', role: 'Engineer', team: 'Platform', joined: '2021-04', location: 'Tokyo', status: 'Active' },
  { name: 'Beatriz Lima', role: 'Designer', team: 'Brand', joined: '2022-09', location: 'São Paulo', status: 'Active' },
  { name: 'Chen Wei', role: 'PM', team: 'Growth', joined: '2020-01', location: 'Singapore', status: 'On leave' },
  { name: 'Daria Volkov', role: 'Engineer', team: 'Infra', joined: '2023-06', location: 'Berlin', status: 'Active' },
  { name: 'Esha Patel', role: 'Engineer', team: 'Platform', joined: '2022-02', location: 'Bangalore', status: 'Active' },
  { name: 'Felix Müller', role: 'Designer', team: 'Web', joined: '2024-03', location: 'Zürich', status: 'Active' },
  { name: 'Grace Okoye', role: 'PM', team: 'ML', joined: '2019-11', location: 'Lagos', status: 'Active' },
  { name: 'Hiro Sato', role: 'Engineer', team: 'Mobile', joined: '2021-08', location: 'Osaka', status: 'On leave' },
  { name: 'Ines Costa', role: 'Eng Mgr', team: 'Platform', joined: '2018-05', location: 'Lisbon', status: 'Active' },
  { name: 'Jamal Wright', role: 'Engineer', team: 'Infra', joined: '2023-10', location: 'New York', status: 'Active' },
])

const orderedKeys = computed(() => columns.value.map((c) => c.key))

const reset = makeReset(columns)
</script>

<template>
  <p class="demo-desc">
    Drag column headers to reorder. The body cells follow the column order driven by the same array.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-card" style="overflow-x: auto">
    <table class="demo-table">
      <thead>
        <Draggable
          v-model="columns"
          tag="tr"
          item-tag="th"
          item-key="key"
          :animation="200"
        >
          <template #item="{ element }">
            {{ element.label }}
          </template>
        </Draggable>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data" :key="i">
          <td v-for="key in orderedKeys" :key="key">{{ row[key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
