import { useState } from 'react'
import { Draggable } from '@anil-labs/dnd-react'

interface Task {
  id: number
  text: string
}

let uid = 100

const initialTodo: Task[] = [
  { id: 1, text: 'Design the landing page' },
  { id: 2, text: 'Wire up authentication' },
  { id: 3, text: 'Write API docs' },
  { id: 4, text: 'Fix mobile nav' },
]

const initialDone: Task[] = [
  { id: 5, text: 'Set up CI' },
  { id: 6, text: 'Ship v0.1' },
]

const initialFiles: Task[] = [
  { id: 7, text: 'report.pdf' },
  { id: 8, text: 'photo-01.jpg' },
  { id: 9, text: 'notes.md' },
  { id: 10, text: 'deck.key' },
]

export default function App() {
  const [todo, setTodo] = useState(initialTodo)
  const [done, setDone] = useState(initialDone)
  const [files, setFiles] = useState(initialFiles)

  return (
    <main>
      <div className="hero">
        <span className="badge">React</span>
        <h1>@anil-labs/dnd</h1>
        <p className="tag">
          The &lt;Draggable&gt; component — controlled items, cross-list groups, multi-drag.
        </p>
      </div>

      <div className="board">
        <section className="col">
          <h2>To do</h2>
          <Draggable
            items={todo}
            onItemsChange={setTodo}
            itemKey="id"
            group="tasks"
            animation={200}
            tag="ul"
            itemTag="li"
            className="list"
            renderItem={({ item }) => <div className="card">{item.text}</div>}
          />
        </section>

        <section className="col">
          <h2>Done</h2>
          <Draggable
            items={done}
            onItemsChange={setDone}
            itemKey="id"
            group="tasks"
            animation={200}
            tag="ul"
            itemTag="li"
            className="list"
            renderItem={({ item }) => <div className="card">{item.text}</div>}
          />
        </section>

        <section className="col">
          <h2>Multi-drag (Ctrl/Cmd-click)</h2>
          <Draggable
            items={files}
            onItemsChange={setFiles}
            itemKey="id"
            multiDrag
            animation={200}
            tag="ul"
            itemTag="li"
            className="list"
            renderItem={({ item, selected }) => (
              <div className="card">
                {selected ? '☑' : '☐'} {item.text}
              </div>
            )}
          />
        </section>
      </div>

      <p className="hint">
        Drag between <em>To do</em> and <em>Done</em>. In the third list, Ctrl/Cmd-click a few
        items, then drag them as a batch. <code>Esc</code> cancels any drag.
      </p>
      <p className="hint">
        <button onClick={() => setTodo((t) => [...t, { id: ++uid, text: `New task #${uid}` }])}>
          + Add task
        </button>
      </p>
    </main>
  )
}
