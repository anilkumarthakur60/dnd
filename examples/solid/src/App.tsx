import { createSignal, For } from 'solid-js'
import { createDraggable } from '@anil-labs/dnd-solid'

interface Task {
  id: number
  text: string
}

export default function App() {
  const [todo, setTodo] = createSignal<Task[]>([
    { id: 1, text: 'Design the landing page' },
    { id: 2, text: 'Wire up authentication' },
    { id: 3, text: 'Write API docs' },
    { id: 4, text: 'Fix mobile nav' },
  ])
  const [done, setDone] = createSignal<Task[]>([
    { id: 5, text: 'Set up CI' },
    { id: 6, text: 'Ship v0.1' },
  ])
  const [files, setFiles] = createSignal<Task[]>([
    { id: 7, text: 'report.pdf' },
    { id: 8, text: 'photo-01.jpg' },
    { id: 9, text: 'notes.md' },
    { id: 10, text: 'deck.key' },
  ])

  const todoDnd = createDraggable(todo, setTodo, { group: 'tasks', animation: 200 })
  const doneDnd = createDraggable(done, setDone, { group: 'tasks', animation: 200 })
  const filesDnd = createDraggable(files, setFiles, { multiDrag: true, animation: 200 })

  return (
    <main>
      <div class="hero">
        <span class="badge">Solid</span>
        <h1>@anil-labs/dnd</h1>
        <p class="tag">The createDraggable primitive — signals in, gestures out.</p>
      </div>

      <div class="board">
        <section class="col">
          <h2>To do</h2>
          <ul class="list" ref={todoDnd.ref}>
            <For each={todo()}>
              {(item, i) => (
                <li {...todoDnd.itemProps(i())}>
                  <div class="card">{item.text}</div>
                </li>
              )}
            </For>
          </ul>
        </section>

        <section class="col">
          <h2>Done</h2>
          <ul class="list" ref={doneDnd.ref}>
            <For each={done()}>
              {(item, i) => (
                <li {...doneDnd.itemProps(i())}>
                  <div class="card">{item.text}</div>
                </li>
              )}
            </For>
          </ul>
        </section>

        <section class="col">
          <h2>Multi-drag (Ctrl/Cmd-click)</h2>
          <ul class="list" ref={filesDnd.ref}>
            <For each={files()}>
              {(item, i) => (
                <li {...filesDnd.itemProps(i())}>
                  <div class="card">
                    {filesDnd.selection().includes(i()) ? '☑' : '☐'} {item.text}
                  </div>
                </li>
              )}
            </For>
          </ul>
        </section>
      </div>

      <p class="hint">
        Drag between <em>To do</em> and <em>Done</em>. In the third list, Ctrl/Cmd-click a few
        items, then drag them as a batch. <code>Esc</code> cancels any drag.
      </p>
    </main>
  )
}
