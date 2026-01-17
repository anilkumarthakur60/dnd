<script setup lang="ts">
import { ref, computed } from 'vue'
import { Draggable } from '../../lib'

interface Column {
  key: 'name' | 'role' | 'team' | 'joined'
  label: string
}

const columns = ref<Column[]>([
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'joined', label: 'Joined' },
])

const data = ref([
  { name: 'Aki Tanaka', role: 'Engineer', team: 'Platform', joined: '2021-04' },
  { name: 'Beatriz Lima', role: 'Designer', team: 'Brand', joined: '2022-09' },
  { name: 'Chen Wei', role: 'PM', team: 'Growth', joined: '2020-01' },
  { name: 'Daria Volkov', role: 'Engineer', team: 'Infra', joined: '2023-06' },
])

const orderedKeys = computed(() => columns.value.map((c) => c.key))
</script>

<template>
  <p class="demo-desc">
    Drag column headers to reorder. The body cells follow the column order driven by the same array.
  </p>
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
