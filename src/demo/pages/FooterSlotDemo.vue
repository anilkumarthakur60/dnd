<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref([
  { id: 1, text: 'Buy groceries' },
  { id: 2, text: 'Walk the dog' },
  { id: 3, text: 'Write the weekly report' },
  { id: 4, text: 'Renew car insurance' },
  { id: 5, text: 'Pay credit card bill' },
  { id: 6, text: 'Pick up dry cleaning' },
  { id: 7, text: 'Schedule dentist appointment' },
  { id: 8, text: 'Order new running shoes' },
])

const newText = ref('')
function add() {
  if (!newText.value.trim()) return
  items.value = [...items.value, { id: Date.now(), text: newText.value.trim() }]
  newText.value = ''
}

const reset = makeReset(items)
</script>

<template>
  <p class="demo-desc">
    A <code>#footer</code> slot lives below the items inside the container — but isn't draggable. Use it for "Add item" inputs, totals, etc.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Todos</h3>
      <Draggable v-model="items" item-key="id" :animation="200" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.text }}</div>
        </template>
        <template #footer>
          <form class="footer-form" @submit.prevent="add">
            <input v-model="newText" placeholder="Add a todo…" />
            <button class="btn" type="submit">Add</button>
          </form>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
.footer-form {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.footer-form input {
  flex: 1;
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
}
</style>
