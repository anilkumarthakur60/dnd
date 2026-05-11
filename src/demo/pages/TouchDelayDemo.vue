<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

const items = ref(
  Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` })),
)

const reset = makeReset(items)
</script>

<template>
  <p class="demo-desc">
    On a touch device, long-press for ~200ms to start a drag. A quick swipe still scrolls the page.
    On desktop (mouse), drag works instantly.
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-grid">
    <div class="demo-card">
      <h3>Long-press to drag (touch only)</h3>
      <Draggable
        v-model="items"
        item-key="id"
        :animation="200"
        :delay="200"
        delay-on-touch-only
        :touch-start-threshold="6"
        class="demo-list"
      >
        <template #item="{ element }">
          <div class="demo-item">{{ element.label }}</div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
