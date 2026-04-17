<script setup lang="ts">
import { ref } from 'vue'
import { Draggable } from '@anil-labs/dnd-vue'

interface Task {
  id: number
  text: string
}

let uid = 100

const todo = ref<Task[]>([
  { id: 1, text: 'Design the landing page' },
  { id: 2, text: 'Wire up authentication' },
  { id: 3, text: 'Write API docs' },
  { id: 4, text: 'Fix mobile nav' },
])

const done = ref<Task[]>([
  { id: 5, text: 'Set up CI' },
  { id: 6, text: 'Ship v0.1' },
])

const rows = ref<Task[]>([
  { id: 7, text: 'Drag me by the grip only' },
  { id: 8, text: 'Text stays selectable' },
  { id: 9, text: 'Handles beat accidental drags' },
])

function addTask() {
  todo.value = [...todo.value, { id: ++uid, text: `New task #${uid}` }]
}
</script>

<template>
  <main>
    <div class="hero">
      <span class="badge">Vue 3</span>
      <h1>@anil-labs/dnd</h1>
      <p class="tag">The &lt;Draggable&gt; component — v-model, cross-list groups, handles.</p>
    </div>

    <div class="board">
      <section class="col">
        <h2>To do</h2>
        <Draggable
          v-model="todo"
          item-key="id"
          group="tasks"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }">
            <div class="card">{{ element.text }}</div>
          </template>
        </Draggable>
      </section>

      <section class="col">
        <h2>Done</h2>
        <Draggable
          v-model="done"
          item-key="id"
          group="tasks"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }">
            <div class="card">{{ element.text }}</div>
          </template>
        </Draggable>
      </section>

      <section class="col">
        <h2>Handle</h2>
        <Draggable
          v-model="rows"
          item-key="id"
          handle=".grip"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }">
            <div class="card"><span class="grip">⋮⋮</span> {{ element.text }}</div>
          </template>
        </Draggable>
      </section>
    </div>

    <p class="hint">
      Drag between <em>To do</em> and <em>Done</em>. The third list only drags from the
      <code>⋮⋮</code> grip. <code>Esc</code> cancels any drag.
    </p>
    <p class="hint"><button @click="addTask">+ Add task</button></p>
  </main>
</template>
