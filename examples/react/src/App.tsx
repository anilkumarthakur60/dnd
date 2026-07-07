import { useRef, useState, type ReactNode } from 'react'
import {
  Draggable,
  useDraggable,
  type DraggableHandle,
  type GhostFactoryInfo,
} from '@anil-labs/dnd-react'

interface Item {
  id: number
  text: string
  locked?: boolean
}

let uid = 1000
const nextId = () => ++uid
const items = (...texts: string[]): Item[] => texts.map((text) => ({ id: nextId(), text }))

const SECTIONS = [
  ['basic', 'Sorting'],
  ['groups', 'Groups'],
  ['clone', 'Clone'],
  ['handle', 'Handle & filter'],
  ['multi', 'Multi-drag'],
  ['swap', 'Swap grid'],
  ['keyboard', 'Keyboard'],
  ['ghost', 'Custom ghost'],
  ['spill', 'Spill to delete'],
  ['nested', 'Nested lists'],
  ['api', 'API & events'],
] as const

function Section({
  n,
  id,
  title,
  desc,
  use,
  children,
}: {
  n: string
  id: string
  title: string
  desc: ReactNode
  use: ReactNode
  children: ReactNode
}) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h2>
          <span className="n">{n}</span> {title}
        </h2>
        <p className="desc">{desc}</p>
        <p className="use">{use}</p>
      </div>
      <div className="card-wrap">{children}</div>
    </section>
  )
}

// 1 · Basic
function BasicDemo() {
  const [list, setList] = useState(
    items(
      'Design the landing page',
      'Wire up authentication',
      'Write the API docs',
      'Fix the mobile nav',
      'Add a dark theme',
    ),
  )
  return (
    <Draggable
      items={list}
      onItemsChange={setList}
      itemKey="id"
      animation={200}
      tag="ul"
      itemTag="li"
      className="list"
      renderItem={({ item }) => <div className="card">{item.text}</div>}
    />
  )
}

// 2 · Groups
function GroupsDemo() {
  const [backlog, setBacklog] = useState(
    items('Research competitors', 'Draft the spec', 'Book the venue'),
  )
  const [doing, setDoing] = useState(items('Build the prototype'))
  const [done, setDone] = useState(items('Kick-off meeting'))
  const col = (label: string, list: Item[], set: (v: Item[]) => void) => (
    <div className="col">
      <h3>{label}</h3>
      <Draggable
        items={list}
        onItemsChange={set}
        itemKey="id"
        group="kanban"
        animation={200}
        emptyInsertThreshold={12}
        tag="ul"
        itemTag="li"
        className="list"
        renderItem={({ item }) => <div className="card">{item.text}</div>}
      />
    </div>
  )
  return (
    <div className="board">
      {col('Backlog', backlog, setBacklog)}
      {col('In progress', doing, setDoing)}
      {col('Done', done, setDone)}
    </div>
  )
}

// 3 · Clone
function CloneDemo() {
  const [palette] = useState(items('Heading', 'Paragraph', 'Image', 'Button'))
  const [canvas, setCanvas] = useState<Item[]>([])
  return (
    <div className="board">
      <div className="col">
        <h3>Palette (copies out)</h3>
        <Draggable
          items={palette}
          onItemsChange={() => {}}
          itemKey="id"
          sort={false}
          group={{ name: 'blocks', pull: 'clone', put: false }}
          clone={(item) => ({ ...item, id: nextId() })}
          animation={200}
          tag="ul"
          itemTag="li"
          className="list"
          renderItem={({ item }) => <div className="card pill">{item.text}</div>}
        />
      </div>
      <div className="col">
        <h3>Canvas (drop here)</h3>
        <Draggable
          items={canvas}
          onItemsChange={setCanvas}
          itemKey="id"
          group="blocks"
          animation={200}
          emptyInsertThreshold={16}
          tag="ul"
          itemTag="li"
          className="list canvas"
          renderItem={({ item }) => <div className="card">{item.text}</div>}
        />
      </div>
    </div>
  )
}

// 4 · Handle & filter
function HandleDemo() {
  const [list, setList] = useState<Item[]>([
    { id: nextId(), text: 'Drag me by the grip' },
    { id: nextId(), text: 'Text stays selectable' },
    { id: nextId(), text: 'Locked — cannot move', locked: true },
    { id: nextId(), text: 'Grips beat accidental drags' },
  ])
  return (
    <Draggable
      items={list}
      onItemsChange={setList}
      itemKey="id"
      handle=".grip"
      filter=".locked"
      animation={200}
      tag="ul"
      itemTag="li"
      className="list"
      renderItem={({ item }) =>
        item.locked ? (
          <div className="card locked">
            🔒 {item.text}
            <span className="muted">filter</span>
          </div>
        ) : (
          <div className="card">
            <span className="grip">⋮⋮</span> {item.text}
          </div>
        )
      }
    />
  )
}

// 5 · Multi-drag
function MultiDemo() {
  const [list, setList] = useState(
    items('report-q3.pdf', 'photo-01.jpg', 'notes.md', 'budget.xlsx', 'deck.key'),
  )
  const [count, setCount] = useState(0)
  return (
    <>
      <Draggable
        items={list}
        onItemsChange={setList}
        itemKey="id"
        multiDrag
        animation={200}
        tag="ul"
        itemTag="li"
        className="list"
        onSelectionChange={(e) => setCount(e.indices.length)}
        renderItem={({ item, selected }) => (
          <div className="card">
            {selected ? '☑' : '☐'} {item.text}
          </div>
        )}
      />
      <p className="use">
        {count
          ? `${count} selected — drag any one to move them together.`
          : 'Ctrl/Cmd-click a few files, then drag any selected one.'}
      </p>
    </>
  )
}

// 6 · Swap grid (headless hook — full control over per-tile colour)
function SwapDemo() {
  const [tiles, setTiles] = useState(() =>
    [8, 32, 152, 190, 220, 260, 300, 340].map((h, i) => ({ id: i + 1, hue: h })),
  )
  const dnd = useDraggable(tiles, setTiles, { swap: true, animation: 200 })
  return (
    <div className="grid-board" ref={dnd.ref}>
      {tiles.map((t, i) => (
        <div key={t.id} {...dnd.itemProps(i)}>
          <div className="tile" style={{ background: `hsl(${t.hue} 70% 62%)` }}>
            {t.id}
          </div>
        </div>
      ))}
    </div>
  )
}

// 7 · Keyboard
function KeyboardDemo() {
  const [list, setList] = useState(
    items('1 · Preheat oven', '2 · Mix the batter', '3 · Pour into tin', '4 · Bake 30 min'),
  )
  const [status, setStatus] = useState('Tab to an item to begin.')
  return (
    <>
      <Draggable
        items={list}
        onItemsChange={setList}
        itemKey="id"
        keyboard
        ariaLabel="Recipe steps"
        animation={200}
        tag="ul"
        itemTag="li"
        className="list"
        onKeyboardMove={(e) =>
          setStatus(`Moved step from position ${e.oldIndex + 1} to ${e.newIndex + 1}.`)
        }
        renderItem={({ item }) => <div className="card">{item.text}</div>}
      />
      <p className="use">{status}</p>
    </>
  )
}

// 8 · Custom ghost
function GhostDemo() {
  const [list, setList] = useState(items('🎧 Headphones', '⌨️ Keyboard', '🖱️ Mouse', '🖥️ Monitor'))
  const ghost = ({ sourceEl, count }: GhostFactoryInfo<Item>) => {
    const pill = document.createElement('div')
    pill.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
    pill.style.cssText =
      'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
    return pill
  }
  return (
    <Draggable
      items={list}
      onItemsChange={setList}
      itemKey="id"
      ghostFactory={ghost}
      animation={200}
      tag="ul"
      itemTag="li"
      className="list"
      renderItem={({ item }) => <div className="card">{item.text}</div>}
    />
  )
}

// 9 · Spill to delete
function SpillDemo() {
  const [list, setList] = useState(
    items('Newsletter subscription', 'Unused API key', 'Old draft', 'Expired coupon'),
  )
  return (
    <>
      <Draggable
        items={list}
        onItemsChange={setList}
        itemKey="id"
        removeOnSpill
        animation={200}
        tag="ul"
        itemTag="li"
        className="list"
        renderItem={({ item }) => <div className="card">{item.text}</div>}
      />
      <div className="trash">🗑️ Drag an item off the list to delete it</div>
    </>
  )
}

// 10 · Nested lists (trees)
interface TreeItem {
  id: number
  label: string
  children: TreeItem[]
}

let treeUid = 0
const nextTreeId = () => ++treeUid

function TreeNode({
  items,
  onItemsChange,
}: {
  items: TreeItem[]
  onItemsChange: (items: TreeItem[]) => void
}) {
  return (
    <Draggable
      items={items}
      onItemsChange={onItemsChange}
      itemKey="id"
      group="tree"
      animation={200}
      emptyInsertThreshold={14}
      tag="ul"
      itemTag="li"
      className="tree-list"
      renderItem={({ item, index }) => (
        <div className="tree-node">
          <div className="tree-row">
            <span className="grip">⠿</span>
            <span className="tree-label">{item.label}</span>
          </div>
          {item.label.endsWith('/') && (
            <TreeNode
              items={item.children}
              onItemsChange={(children) => {
                const next = items.slice()
                next[index] = { ...item, children }
                onItemsChange(next)
              }}
            />
          )}
        </div>
      )}
    />
  )
}

function TreeDemo() {
  const [tree, setTree] = useState<TreeItem[]>([
    {
      id: nextTreeId(),
      label: 'src/',
      children: [
        {
          id: nextTreeId(),
          label: 'components/',
          children: [
            { id: nextTreeId(), label: 'Button.tsx', children: [] },
            { id: nextTreeId(), label: 'Modal.tsx', children: [] },
          ],
        },
        { id: nextTreeId(), label: 'index.ts', children: [] },
      ],
    },
    {
      id: nextTreeId(),
      label: 'tests/',
      children: [{ id: nextTreeId(), label: 'app.spec.ts', children: [] }],
    },
    { id: nextTreeId(), label: 'package.json', children: [] },
  ])
  return <TreeNode items={tree} onItemsChange={setTree} />
}

// 11 · Programmatic API & events
function ApiDemo() {
  const [list, setList] = useState(items('Alpha', 'Bravo', 'Charlie'))
  const [log, setLog] = useState<{ k: string; d: string }[]>([])
  const ref = useRef<DraggableHandle<Item>>(null)
  const push = (k: string, d: string) => setLog((l) => [{ k, d }, ...l].slice(0, 30))
  let n = 0
  return (
    <>
      <div className="toolbar">
        <button
          onClick={() => {
            const it = { id: nextId(), text: `Item ${String.fromCharCode(68 + n++)}` }
            ref.current?.insertAt(list.length, it)
            push('insertAt', `"${it.text}"`)
          }}
        >
          + Add item
        </button>
        <button
          onClick={() => {
            ref.current?.move(0, list.length - 1)
            push('move', 'first → last')
          }}
        >
          Move first → last
        </button>
        <button
          onClick={() => {
            const r = ref.current?.removeAt(list.length - 1)
            if (r) push('removeAt', `"${r.text}"`)
          }}
        >
          Remove last
        </button>
        <button
          onClick={() => {
            for (let i = 0; i < list.length; i++)
              ref.current?.move(0, Math.floor(Math.random() * list.length))
            push('shuffle', `${list.length} items`)
          }}
        >
          Shuffle
        </button>
      </div>
      <Draggable
        ref={ref}
        items={list}
        onItemsChange={setList}
        itemKey="id"
        animation={200}
        tag="ul"
        itemTag="li"
        className="list"
        onUpdate={(e) => push('update', `${e.oldIndex} → ${e.newIndex}`)}
        onEnd={(e) =>
          push('end', e.cancelled ? 'cancelled' : `dropped ${e.oldIndex} → ${e.newIndex}`)
        }
        renderItem={({ item }) => <div className="card">{item.text}</div>}
      />
      <div className="log">
        {log.length === 0 ? (
          <div className="empty">Drag items or press a button — events appear here…</div>
        ) : (
          log.map((e, i) => (
            <div className="row" key={i}>
              <span className="k">{e.k}</span> {e.d}
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <main>
      <div className="hero">
        <span className="badge">React · &lt;Draggable&gt; + useDraggable</span>
        <h1>@anil-labs/dnd</h1>
        <p className="tag">
          Every feature, one page. Each card is a self-contained example — find the one that matches
          your use case.
        </p>
        <nav className="toc">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section
        n="01"
        id="basic"
        title="Sortable list"
        desc="The fundamentals: drag to reorder, with a FLIP animation on every move."
        use={
          <>
            <b>Use it for</b> to-do lists, playlists, priority ordering.
          </>
        }
      >
        <BasicDemo />
      </Section>
      <Section
        n="02"
        id="groups"
        title="Shared lists (groups)"
        desc={
          <>
            Give lists the same <code>group</code> and items drag freely between them.
          </>
        }
        use={
          <>
            <b>Use it for</b> Kanban boards, buckets, inbox → done flows.
          </>
        }
      >
        <GroupsDemo />
      </Section>
      <Section
        n="03"
        id="clone"
        title="Clone (palette → canvas)"
        desc={
          <>
            With <code>pull: 'clone'</code> the palette copies items out and keeps the originals.
          </>
        }
        use={
          <>
            <b>Use it for</b> page / form builders, component palettes.
          </>
        }
      >
        <CloneDemo />
      </Section>
      <Section
        n="04"
        id="handle"
        title="Handle & filter"
        desc={
          <>
            <code>handle</code> starts drags from the grip; <code>filter</code> blocks locked rows.
          </>
        }
        use={
          <>
            <b>Use it for</b> rows with controls, pinned items, selectable text.
          </>
        }
      >
        <HandleDemo />
      </Section>
      <Section
        n="05"
        id="multi"
        title="Multi-drag"
        desc="Ctrl/Cmd-click to select several items, then drag them together as one batch."
        use={
          <>
            <b>Use it for</b> file managers, bulk-move UIs.
          </>
        }
      >
        <MultiDemo />
      </Section>
      <Section
        n="06"
        id="swap"
        title="Swap mode (grid)"
        desc={
          <>
            <code>swap: true</code> exchanges two items instead of inserting — great for 2-D grids.
          </>
        }
        use={
          <>
            <b>Use it for</b> dashboards, galleries, tile boards.
          </>
        }
      >
        <SwapDemo />
      </Section>
      <Section
        n="07"
        id="keyboard"
        title="Keyboard & accessibility"
        desc={
          <>
            Focus an item, <kbd>Space</kbd> to grab, <kbd>↑</kbd>/<kbd>↓</kbd> to move,{' '}
            <kbd>Esc</kbd> to cancel.
          </>
        }
        use={
          <>
            <b>Use it for</b> keyboard-only and screen-reader users.
          </>
        }
      >
        <KeyboardDemo />
      </Section>
      <Section
        n="08"
        id="ghost"
        title="Custom drag preview"
        desc={
          <>
            <code>ghostFactory</code> replaces the cloned element with any HTML you build.
          </>
        }
        use={
          <>
            <b>Use it for</b> compact pills, "N items" badges, branded ghosts.
          </>
        }
      >
        <GhostDemo />
      </Section>
      <Section
        n="09"
        id="spill"
        title="Spill to delete"
        desc={
          <>
            <code>removeOnSpill</code> deletes an item dropped outside the list.
          </>
        }
        use={
          <>
            <b>Use it for</b> drag-off-to-remove, trash zones, dismissible chips.
          </>
        }
      >
        <SpillDemo />
      </Section>
      <Section
        n="10"
        id="nested"
        title="Nested lists (trees)"
        desc={
          <>
            Trees are just lists inside list items. Give every level the same <code>group</code> and
            items drag freely between branches and depths.
          </>
        }
        use={
          <>
            <b>Use it for</b> file trees, comment threads, org charts.
          </>
        }
      >
        <TreeDemo />
      </Section>
      <Section
        n="11"
        id="api"
        title="Programmatic API & live events"
        desc={
          <>
            Drive the list from code — <code>move</code>, <code>insertAt</code>,{' '}
            <code>removeAt</code> — and watch events fire.
          </>
        }
        use={
          <>
            <b>Use it for</b> "add row" buttons, undo/redo, server sync.
          </>
        }
      >
        <ApiDemo />
      </Section>

      <footer>
        Every card runs the same zero-dependency <code>@anil-labs/dnd-core</code> engine.{' '}
        <a href="https://github.com/anilkumarthakur60/vue-dnd">View source on GitHub</a>
      </footer>
    </main>
  )
}
