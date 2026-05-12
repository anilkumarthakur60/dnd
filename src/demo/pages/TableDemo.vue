<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const rows = ref([
  { id: 1, country: 'France', capital: 'Paris', pop: 67 },
  { id: 2, country: 'Japan', capital: 'Tokyo', pop: 125 },
  { id: 3, country: 'Brazil', capital: 'Brasília', pop: 214 },
  { id: 4, country: 'Kenya', capital: 'Nairobi', pop: 53 },
  { id: 5, country: 'Canada', capital: 'Ottawa', pop: 38 },
  { id: 6, country: 'Germany', capital: 'Berlin', pop: 83 },
  { id: 7, country: 'India', capital: 'New Delhi', pop: 1410 },
  { id: 8, country: 'Australia', capital: 'Canberra', pop: 26 },
  { id: 9, country: 'Mexico', capital: 'Mexico City', pop: 128 },
  { id: 10, country: 'Norway', capital: 'Oslo', pop: 5.4 },
  { id: 11, country: 'Argentina', capital: 'Buenos Aires', pop: 46 },
  { id: 12, country: 'Egypt', capital: 'Cairo', pop: 109 },
  { id: 13, country: 'Thailand', capital: 'Bangkok', pop: 70 },
  { id: 14, country: 'Iceland', capital: 'Reykjavík', pop: 0.4 },
  { id: 15, country: 'Vietnam', capital: 'Hanoi', pop: 98 },
])

const reset = makeReset(rows)
</script>

<template>
  <p class="demo-desc">Drag any row by grabbing it. The component renders a <code>&lt;tbody&gt;</code> with <code>tag="tbody" item-tag="tr"</code>.</p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
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
  min-width: 420px;
}
.demo-table th, .demo-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  white-space: nowrap;
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

@media (max-width: 860px) {
  .demo-table { font-size: 12.5px; }
  .demo-table th, .demo-table td { padding: 7px 10px; }
}
</style>
