<script lang="ts">
  import { draggable } from '@anil-labs/dnd-svelte'

  interface Task {
    id: number
    text: string
  }

  let todo = $state<Task[]>([
    { id: 1, text: 'Design the landing page' },
    { id: 2, text: 'Wire up authentication' },
    { id: 3, text: 'Write API docs' },
    { id: 4, text: 'Fix mobile nav' },
  ])

  let done = $state<Task[]>([
    { id: 5, text: 'Set up CI' },
    { id: 6, text: 'Ship v0.1' },
  ])

  let rows = $state<Task[]>([
    { id: 7, text: 'Drag me by the grip only' },
    { id: 8, text: 'Text stays selectable' },
    { id: 9, text: 'Handles beat accidental drags' },
  ])
</script>

<main>
  <div class="hero">
    <span class="badge">Svelte</span>
    <h1>@anil-labs/dnd</h1>
    <p class="tag">The use:draggable action — your markup, the engine's gestures.</p>
  </div>

  <div class="board">
    <section class="col">
      <h2>To do</h2>
      <ul
        class="list"
        use:draggable={{
          items: todo,
          onItemsChange: (v) => (todo = v),
          group: 'tasks',
          animation: 200,
        }}
      >
        {#each todo as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item">
            <div class="card">{item.text}</div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="col">
      <h2>Done</h2>
      <ul
        class="list"
        use:draggable={{
          items: done,
          onItemsChange: (v) => (done = v),
          group: 'tasks',
          animation: 200,
        }}
      >
        {#each done as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item">
            <div class="card">{item.text}</div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="col">
      <h2>Handle</h2>
      <ul
        class="list"
        use:draggable={{
          items: rows,
          onItemsChange: (v) => (rows = v),
          handle: '.grip',
          animation: 200,
        }}
      >
        {#each rows as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item">
            <div class="card"><span class="grip">⋮⋮</span> {item.text}</div>
          </li>
        {/each}
      </ul>
    </section>
  </div>

  <p class="hint">
    Drag between <em>To do</em> and <em>Done</em>. The third list only drags from the
    <code>⋮⋮</code> grip. <code>Esc</code> cancels any drag.
  </p>
</main>
