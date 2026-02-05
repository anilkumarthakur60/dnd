<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref(
  Array.from({ length: 16 }, (_, i) => ({ id: i + 1, label: `Card ${i + 1}` })),
)

function shuffle() {
  items.value = [...items.value].sort(() => Math.random() - 0.5)
}

const reset = makeReset(items)
</script>

<template>
  <p class="demo-desc">
    FLIP animation runs on every reorder. The button shuffles the array — items glide to their new positions.
  </p>
  <div class="demo-toolbar">
    <button class="btn" @click="shuffle">Shuffle</button>
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Cards (animation: 400ms)</h3>
      <Draggable v-model="items" item-key="id" :animation="400" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
