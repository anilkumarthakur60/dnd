import { createSignal, For, Show, type JSX } from 'solid-js'
import { createDraggable, type GhostFactoryInfo } from '@anil-labs/dnd-solid'

interface Item {
  id: number
  text: string
  locked?: boolean
}

let uid = 1000
const nextId = () => ++uid
const make = (...texts: string[]): Item[] => texts.map((text) => ({ id: nextId(), text }))

const SECTIONS: [string, string][] = [
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
]

function Section(props: {
  n: string
  id: string
  title: string
  desc: JSX.Element
  use: JSX.Element
  children: JSX.Element
}) {
  return (
    <section class="section" id={props.id}>
      <div class="section-head">
        <h2>
          <span class="n">{props.n}</span> {props.title}
        </h2>
        <p class="desc">{props.desc}</p>
        <p class="use">{props.use}</p>
      </div>
      <div class="card-wrap">{props.children}</div>
    </section>
  )
}

function BasicDemo() {
  const [list, setList] = createSignal(
    make(
      'Design the landing page',
      'Wire up authentication',
      'Write the API docs',
      'Fix the mobile nav',
      'Add a dark theme',
    ),
  )
  const dnd = createDraggable(list, setList, { animation: 200 })
  return (
    <ul class="list" ref={dnd.ref}>
      <For each={list()}>
        {(item, i) => (
          <li {...dnd.itemProps(i())}>
            <div class="card">{item.text}</div>
          </li>
        )}
      </For>
    </ul>
  )
}

function GroupsDemo() {
  const cols = [
    {
      label: 'Backlog',
      ...signalList(make('Research competitors', 'Draft the spec', 'Book the venue')),
    },
    { label: 'In progress', ...signalList(make('Build the prototype')) },
    { label: 'Done', ...signalList(make('Kick-off meeting')) },
  ]
  return (
    <div class="board">
      <For each={cols}>
        {(col) => {
          const dnd = createDraggable(col.get, col.set, {
            group: 'kanban',
            animation: 200,
            emptyInsertThreshold: 12,
          })
          return (
            <div class="col">
              <h3>{col.label}</h3>
              <ul class="list" ref={dnd.ref}>
                <For each={col.get()}>
                  {(item, i) => (
                    <li {...dnd.itemProps(i())}>
                      <div class="card">{item.text}</div>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )
        }}
      </For>
    </div>
  )
}

function signalList(initial: Item[]) {
  const [get, set] = createSignal(initial)
  return { get, set }
}

function CloneDemo() {
  const [palette, setPalette] = createSignal(make('Heading', 'Paragraph', 'Image', 'Button'))
  const [canvas, setCanvas] = createSignal<Item[]>([])
  const paletteDnd = createDraggable(palette, setPalette, {
    sort: false,
    group: { name: 'blocks', pull: 'clone', put: false },
    clone: (item) => ({ ...item, id: nextId() }),
    animation: 200,
  })
  const canvasDnd = createDraggable(canvas, setCanvas, {
    group: 'blocks',
    animation: 200,
    emptyInsertThreshold: 16,
  })
  return (
    <div class="board">
      <div class="col">
        <h3>Palette (copies out)</h3>
        <ul class="list" ref={paletteDnd.ref}>
          <For each={palette()}>
            {(item, i) => (
              <li {...paletteDnd.itemProps(i())}>
                <div class="card pill">{item.text}</div>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div class="col">
        <h3>Canvas (drop here)</h3>
        <ul class="list canvas" ref={canvasDnd.ref}>
          <For each={canvas()}>
            {(item, i) => (
              <li {...canvasDnd.itemProps(i())}>
                <div class="card">{item.text}</div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

function HandleDemo() {
  const [list, setList] = createSignal<Item[]>([
    { id: nextId(), text: 'Drag me by the grip' },
    { id: nextId(), text: 'Text stays selectable' },
    { id: nextId(), text: 'Locked — cannot move', locked: true },
    { id: nextId(), text: 'Grips beat accidental drags' },
  ])
  const dnd = createDraggable(list, setList, { handle: '.grip', filter: '.locked', animation: 200 })
  return (
    <ul class="list" ref={dnd.ref}>
      <For each={list()}>
        {(item, i) => (
          <li {...dnd.itemProps(i())}>
            {item.locked ? (
              <div class="card locked">
                🔒 {item.text}
                <span class="muted">filter</span>
              </div>
            ) : (
              <div class="card">
                <span class="grip">⋮⋮</span> {item.text}
              </div>
            )}
          </li>
        )}
      </For>
    </ul>
  )
}

function MultiDemo() {
  const [list, setList] = createSignal(
    make('report-q3.pdf', 'photo-01.jpg', 'notes.md', 'budget.xlsx', 'deck.key'),
  )
  const dnd = createDraggable(list, setList, { multiDrag: true, animation: 200 })
  return (
    <>
      <ul class="list" ref={dnd.ref}>
        <For each={list()}>
          {(item, i) => (
            <li {...dnd.itemProps(i())}>
              <div class="card">
                {dnd.selection().includes(i()) ? '☑' : '☐'} {item.text}
              </div>
            </li>
          )}
        </For>
      </ul>
      <p class="use">
        {dnd.selection().length
          ? `${dnd.selection().length} selected — drag any one to move them together.`
          : 'Ctrl/Cmd-click a few files, then drag any selected one.'}
      </p>
    </>
  )
}

function SwapDemo() {
  const [tiles, setTiles] = createSignal(
    [8, 32, 152, 190, 220, 260, 300, 340].map((hue, i) => ({ id: i + 1, hue })),
  )
  const dnd = createDraggable(tiles, setTiles, { swap: true, animation: 200 })
  return (
    <div class="grid-board" ref={dnd.ref}>
      <For each={tiles()}>
        {(tile, i) => (
          <div {...dnd.itemProps(i())}>
            <div class="tile" style={{ background: `hsl(${tile.hue} 70% 62%)` }}>
              {tile.id}
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

function KeyboardDemo() {
  const [list, setList] = createSignal(
    make('1 · Preheat oven', '2 · Mix the batter', '3 · Pour into tin', '4 · Bake 30 min'),
  )
  const [status, setStatus] = createSignal('Tab to an item to begin.')
  const dnd = createDraggable(list, setList, {
    keyboard: true,
    ariaLabel: 'Recipe steps',
    animation: 200,
    onKeyboardMove: (e) =>
      setStatus(`Moved step from position ${e.oldIndex + 1} to ${e.newIndex + 1}.`),
  })
  return (
    <>
      <ul class="list" ref={dnd.ref}>
        <For each={list()}>
          {(item, i) => (
            <li {...dnd.itemProps(i())}>
              <div class="card">{item.text}</div>
            </li>
          )}
        </For>
      </ul>
      <p class="use">{status()}</p>
    </>
  )
}

function GhostDemo() {
  const [list, setList] = createSignal(
    make('🎧 Headphones', '⌨️ Keyboard', '🖱️ Mouse', '🖥️ Monitor'),
  )
  const ghost = ({ sourceEl, count }: GhostFactoryInfo<Item>) => {
    const pill = document.createElement('div')
    pill.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
    pill.style.cssText =
      'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
    return pill
  }
  const dnd = createDraggable(list, setList, { ghostFactory: ghost, animation: 200 })
  return (
    <ul class="list" ref={dnd.ref}>
      <For each={list()}>
        {(item, i) => (
          <li {...dnd.itemProps(i())}>
            <div class="card">{item.text}</div>
          </li>
        )}
      </For>
    </ul>
  )
}

function SpillDemo() {
  const [list, setList] = createSignal(
    make('Newsletter subscription', 'Unused API key', 'Old draft', 'Expired coupon'),
  )
  const dnd = createDraggable(list, setList, { removeOnSpill: true, animation: 200 })
  return (
    <>
      <ul class="list" ref={dnd.ref}>
        <For each={list()}>
          {(item, i) => (
            <li {...dnd.itemProps(i())}>
              <div class="card">{item.text}</div>
            </li>
          )}
        </For>
      </ul>
      <div class="trash">🗑️ Drag an item off the list to delete it</div>
    </>
  )
}

interface TreeItem {
  id: number
  label: string
  children: TreeItem[]
}

let treeUid = 0
const nextTreeId = () => ++treeUid

function TreeNode(props: { items: TreeItem[]; onItemsChange: (items: TreeItem[]) => void }) {
  const dnd = createDraggable(() => props.items, props.onItemsChange, {
    group: 'tree',
    animation: 200,
    emptyInsertThreshold: 14,
  })
  return (
    <ul
      class="tree-list"
      classList={{ 'tree-list--empty': props.items.length === 0 }}
      ref={dnd.ref}
    >
      <For each={props.items}>
        {(item, i) => (
          <li {...dnd.itemProps(i())}>
            <div class="tree-node">
              <div class="tree-row">
                <span class="grip">⠿</span>
                <span class="tree-label">{item.label}</span>
              </div>
              <Show when={item.label.endsWith('/')}>
                <TreeNode
                  items={item.children}
                  onItemsChange={(children) => {
                    const next = props.items.slice()
                    next[i()] = { ...item, children }
                    props.onItemsChange(next)
                  }}
                />
              </Show>
            </div>
          </li>
        )}
      </For>
    </ul>
  )
}

function TreeDemo() {
  const [tree, setTree] = createSignal<TreeItem[]>([
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
  return <TreeNode items={tree()} onItemsChange={setTree} />
}

function ApiDemo() {
  const [list, setList] = createSignal(make('Alpha', 'Bravo', 'Charlie'))
  const [log, setLog] = createSignal<{ k: string; d: string }[]>([])
  const push = (k: string, d: string) => setLog((l) => [{ k, d }, ...l].slice(0, 30))
  let n = 0
  const dnd = createDraggable(list, setList, {
    animation: 200,
    onUpdate: (e) => push('update', `${e.oldIndex} → ${e.newIndex}`),
    onEnd: (e) => push('end', e.cancelled ? 'cancelled' : `dropped ${e.oldIndex} → ${e.newIndex}`),
  })
  return (
    <>
      <div class="toolbar">
        <button
          onClick={() => {
            const it = { id: nextId(), text: `Item ${String.fromCharCode(68 + n++)}` }
            dnd.insertAt(list().length, it)
            push('insertAt', `"${it.text}"`)
          }}
        >
          + Add item
        </button>
        <button
          onClick={() => {
            dnd.move(0, list().length - 1)
            push('move', 'first → last')
          }}
        >
          Move first → last
        </button>
        <button
          onClick={() => {
            const r = dnd.removeAt(list().length - 1)
            if (r) push('removeAt', `"${r.text}"`)
          }}
        >
          Remove last
        </button>
        <button
          onClick={() => {
            const len = list().length
            for (let i = 0; i < len; i++) dnd.move(0, Math.floor(Math.random() * len))
            push('shuffle', `${len} items`)
          }}
        >
          Shuffle
        </button>
      </div>
      <ul class="list" ref={dnd.ref}>
        <For each={list()}>
          {(item, i) => (
            <li {...dnd.itemProps(i())}>
              <div class="card">{item.text}</div>
            </li>
          )}
        </For>
      </ul>
      <div class="log">
        {log().length === 0 ? (
          <div class="empty">Drag items or press a button — events appear here…</div>
        ) : (
          <For each={log()}>
            {(e) => (
              <div class="row">
                <span class="k">{e.k}</span> {e.d}
              </div>
            )}
          </For>
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <main>
      <div class="hero">
        <span class="badge">Solid · createDraggable</span>
        <h1>@anil-labs/dnd</h1>
        <p class="tag">
          Every feature, one page. Each card is a self-contained example — find the one that matches
          your use case.
        </p>
        <nav class="toc">
          <For each={SECTIONS}>{([id, label]) => <a href={`#${id}`}>{label}</a>}</For>
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
        <a href="https://github.com/anilkumarthakur60/dnd">View source on GitHub</a>
      </footer>
    </main>
  )
}
