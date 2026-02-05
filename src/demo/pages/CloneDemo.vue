<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const palette = ref([
  { id: 'btn', label: 'Button' },
  { id: 'input', label: 'Text Input' },
  { id: 'select', label: 'Select' },
  { id: 'check', label: 'Checkbox' },
  { id: 'radio', label: 'Radio Group' },
  { id: 'toggle', label: 'Toggle Switch' },
  { id: 'date', label: 'Date Picker' },
  { id: 'slider', label: 'Slider' },
  { id: 'upload', label: 'File Upload' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'badge', label: 'Badge' },
  { id: 'modal', label: 'Modal' },
])

const canvas = ref<Array<{ id: string; label: string }>>([])

const reset = makeReset(palette, canvas)
</script>

<template>
  <p class="demo-desc">
    The left list uses <code>{ pull: 'clone' }</code>. Items remain in the palette and a copy is dropped on the canvas.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Palette (pull: clone)</h3>
      <Draggable
        v-model="palette"
        :group="{ name: 'widgets', pull: 'clone', put: false }"
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
        group="widgets"
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
  <pre class="demo-state">{{ { palette, canvas } }}</pre>
</template>
