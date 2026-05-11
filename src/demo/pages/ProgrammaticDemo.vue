<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { Draggable } from '../../lib'
import type { DraggableExpose } from '../../lib'

interface Row {
  id: number
  text: string
}

const items = ref<Row[]>([
  { id: 1, text: 'Alpha' },
  { id: 2, text: 'Bravo' },
  { id: 3, text: 'Charlie' },
])

const dnd = useTemplateRef<DraggableExpose<Row>>('dnd')

let next = 100
function add() {
  next++
  dnd.value?.insertAt(items.value.length, { id: next, text: `New ${next}` })
}
function removeFirst() {
  dnd.value?.removeAt(0)
}
function shuffleViaApi() {
  for (let i = items.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    dnd.value?.move(i, j)
  }
}
function selectAll() {
  dnd.value?.select(items.value.map((_, i) => i))
}
function getSelectionLog() {
  alert(`Selection indices: [${dnd.value?.getSelection().join(', ')}]`)
}
</script>

<template>
  <p class="demo-desc">
    The component exposes <code>move</code>, <code>insertAt</code>, <code>removeAt</code>,
    <code>select</code>, <code>clearSelection</code>, and <code>getSelection</code> via a template ref.
  </p>
  <div style="margin-bottom: 14px; display: flex; gap: 8px; flex-wrap: wrap">
    <button class="btn" @click="add">Insert at end</button>
    <button class="btn" @click="removeFirst">Remove first</button>
    <button class="btn" @click="shuffleViaApi">Shuffle (programmatic)</button>
    <button class="btn" @click="selectAll">Select all</button>
    <button class="btn" @click="dnd?.clearSelection()">Clear selection</button>
    <button class="btn" @click="getSelectionLog">Read selection</button>
  </div>
  <div class="demo-card">
    <Draggable
      ref="dnd"
      v-model="items"
      item-key="id"
      :animation="200"
      multi-drag
      class="demo-list"
    >
      <template #item="{ element, selected }">
        <div class="demo-item" :style="selected ? 'background: rgba(110,168,255,0.18)' : ''">
          #{{ element.id }} — {{ element.text }}
        </div>
      </template>
    </Draggable>
  </div>
  <pre class="demo-state">{{ items }}</pre>
</template>
