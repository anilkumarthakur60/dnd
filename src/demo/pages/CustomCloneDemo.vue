<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

interface Block {
  id: string
  label: string
  copies: number
}

const palette = ref<Block[]>([
  { id: 'card', label: 'Card', copies: 0 },
  { id: 'image', label: 'Image', copies: 0 },
  { id: 'text', label: 'Text', copies: 0 },
  { id: 'video', label: 'Video', copies: 0 },
  { id: 'gallery', label: 'Gallery', copies: 0 },
  { id: 'cta', label: 'Call to Action', copies: 0 },
  { id: 'quote', label: 'Quote', copies: 0 },
  { id: 'embed', label: 'Embed', copies: 0 },
  { id: 'divider', label: 'Divider', copies: 0 },
  { id: 'columns', label: 'Columns', copies: 0 },
])

const canvas = ref<Block[]>([])

let cloneCounter = 0
function cloneBlock(b: Block): Block {
  cloneCounter++
  return { ...b, id: `${b.id}-${cloneCounter}`, label: `${b.label} #${cloneCounter}` }
}

const reset = makeReset(palette, canvas)
function resetAll() {
  cloneCounter = 0
  reset()
}
</script>

<template>
  <p class="demo-desc">
    The <code>:clone</code> prop transforms the item when copying — here, each clone gets a unique id and a numbered label.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="resetAll">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Templates (pull: clone, :clone)</h3>
      <Draggable
        v-model="palette"
        :group="{ name: 'blocks', pull: 'clone', put: false }"
        :clone="cloneBlock"
        :sort="false"
        item-key="id"
        :animation="200"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
    <div class="demo-card">
      <h3>Canvas</h3>
      <Draggable
        v-model="canvas"
        group="blocks"
        :animation="200"
        item-key="id"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
