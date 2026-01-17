<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'

const a = ref(Array.from({ length: 4 }, (_, i) => ({ id: i + 1, label: `A${i + 1}` })))
const b = ref(Array.from({ length: 4 }, (_, i) => ({ id: i + 10, label: `B${i + 1}` })))
const c = ref(Array.from({ length: 4 }, (_, i) => ({ id: i + 20, label: `C${i + 1}` })))
</script>

<template>
  <p class="demo-desc">
    Three lists, one shared group, all with FLIP transitions enabled. Items animate as they cross between lists.
  </p>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>List A</h3>
      <Draggable v-model="a" group="abc" item-key="id" :animation="300" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>List B</h3>
      <Draggable v-model="b" group="abc" item-key="id" :animation="300" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>List C</h3>
      <Draggable v-model="c" group="abc" item-key="id" :animation="300" class="demo-list">
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
