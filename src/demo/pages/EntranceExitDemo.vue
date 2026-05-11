<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref([
  { id: 1, label: 'First item' },
  { id: 2, label: 'Second item' },
  { id: 3, label: 'Third item' },
  { id: 4, label: 'Fourth item' },
  { id: 5, label: 'Fifth item' },
  { id: 6, label: 'Sixth item' },
  { id: 7, label: 'Seventh item' },
])

let seq = 100
function addItem() {
  items.value = [...items.value, { id: seq++, label: `Item ${seq}` }]
}
function removeAt(i: number) {
  items.value = items.value.filter((_, idx) => idx !== i)
}

const baseReset = makeReset(items)
function reset() {
  seq = 100
  baseReset()
}
</script>

<template>
  <p class="demo-desc">
    Set <code>transition-name="list"</code> to opt into Vue's TransitionGroup. Items animate in when added and out when removed.
    Reorder still uses FLIP.
  </p>
  <div class="demo-toolbar">
    <button class="btn" @click="addItem">Add item</button>
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-card">
    <Draggable
      v-model="items"
      item-key="id"
      :animation="200"
      transition-name="list"
      class="demo-list"
    >
      <template #item="{ element, index }">
        <div class="demo-item">
          <span>{{ element.label }}</span>
          <button class="btn" @click="removeAt(index)">×</button>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.list-leave-active {
  position: absolute;
  width: calc(100% - 28px);
}
</style>
