<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const rows = ref([
  { id: 1, country: 'France', capital: 'Paris', pop: 67 },
  { id: 2, country: 'Japan', capital: 'Tokyo', pop: 125 },
  { id: 3, country: 'Brazil', capital: 'Brasília', pop: 214 },
  { id: 4, country: 'Kenya', capital: 'Nairobi', pop: 53 },
  { id: 5, country: 'Canada', capital: 'Ottawa', pop: 38 },
])
</script>

<template>
  <p class="demo-desc">Drag any row by grabbing it. The component renders a <code>&lt;tbody&gt;</code> with <code>tag="tbody" item-tag="tr"</code>.</p>
  <div class="demo-card" style="overflow-x: auto">
    <table class="demo-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Capital</th>
          <th>Population (M)</th>
        </tr>
      </thead>
      <Draggable v-model="rows" tag="tbody" item-tag="tr" item-key="id" :animation="200">
        <template #item="{ element }">
          <td>{{ element.country }}</td>
          <td>{{ element.capital }}</td>
          <td>{{ element.pop }}</td>
        </template>
      </Draggable>
    </table>
  </div>
</template>

<style>
.demo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.demo-table th, .demo-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
.demo-table thead th {
  color: var(--muted);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.06em;
}
.demo-table tbody tr {
  background: var(--surface-2);
  cursor: grab;
}
.demo-table tbody tr:hover {
  background: var(--border);
}
</style>
