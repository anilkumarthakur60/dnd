<script lang="ts">
  import { draggable } from '@anil-labs/dnd-svelte'
  import type { GhostFactoryInfo } from '@anil-labs/dnd-svelte'
  import TreeNode from './TreeNode.svelte'
  import type { TreeItem } from './TreeNode.svelte'

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

  let basic = $state(
    make(
      'Design the landing page',
      'Wire up authentication',
      'Write the API docs',
      'Fix the mobile nav',
      'Add a dark theme',
    ),
  )

  let backlog = $state(make('Research competitors', 'Draft the spec', 'Book the venue'))
  let doing = $state(make('Build the prototype'))
  let done = $state(make('Kick-off meeting'))

  let palette = $state(make('Heading', 'Paragraph', 'Image', 'Button'))
  let canvas = $state<Item[]>([])
  const cloneFn = (item: Item): Item => ({ ...item, id: nextId() })

  let handleList = $state<Item[]>([
    { id: nextId(), text: 'Drag me by the grip' },
    { id: nextId(), text: 'Text stays selectable' },
    { id: nextId(), text: 'Locked — cannot move', locked: true },
    { id: nextId(), text: 'Grips beat accidental drags' },
  ])

  let files = $state(make('report-q3.pdf', 'photo-01.jpg', 'notes.md', 'budget.xlsx', 'deck.key'))
  let selected = $state<number[]>([])

  let tiles = $state([8, 32, 152, 190, 220, 260, 300, 340].map((hue, i) => ({ id: i + 1, hue })))

  let steps = $state(
    make('1 · Preheat oven', '2 · Mix the batter', '3 · Pour into tin', '4 · Bake 30 min'),
  )
  let kbStatus = $state('Tab to an item to begin.')
  let kbActive = $state<number | null>(null)

  let gear = $state(make('🎧 Headphones', '⌨️ Keyboard', '🖱️ Mouse', '🖥️ Monitor'))
  const ghost = ({ sourceEl, count }: GhostFactoryInfo<Item>): HTMLElement => {
    const pill = document.createElement('div')
    pill.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
    pill.style.cssText =
      'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
    return pill
  }

  let spill = $state(
    make('Newsletter subscription', 'Unused API key', 'Old draft', 'Expired coupon'),
  )

  let treeUid = 0
  const nextTreeId = () => ++treeUid
  let tree = $state<TreeItem[]>([
    {
      id: nextTreeId(),
      label: 'src/',
      children: [
        {
          id: nextTreeId(),
          label: 'components/',
          children: [
            { id: nextTreeId(), label: 'Button.svelte', children: [] },
            { id: nextTreeId(), label: 'Modal.svelte', children: [] },
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

  let api = $state(make('Alpha', 'Bravo', 'Charlie'))
  let log = $state<{ k: string; d: string }[]>([])
  let apiN = 0
  const push = (k: string, d: string) => (log = [{ k, d }, ...log].slice(0, 30))
  const addItem = () => {
    const it = { id: nextId(), text: `Item ${String.fromCharCode(68 + apiN++)}` }
    api = [...api, it]
    push('insert', `"${it.text}"`)
  }
  const moveItem = () => {
    const [first, ...rest] = api
    api = [...rest, first]
    push('move', 'first → last')
  }
  const removeItem = () => {
    const last = api[api.length - 1]
    api = api.slice(0, -1)
    if (last) push('remove', `"${last.text}"`)
  }
  const shuffle = () => {
    const copy = [...api]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    api = copy
    push('shuffle', `${api.length} items`)
  }
</script>

<main>
  <div class="hero">
    <span class="badge">Svelte · use:draggable</span>
    <h1>@anil-labs/dnd</h1>
    <p class="tag">
      Every feature, one page. Each card is a self-contained example — find the one that matches
      your use case.
    </p>
    <nav class="toc">
      {#each SECTIONS as [id, label] (id)}
        <a href="#{id}">{label}</a>
      {/each}
    </nav>
  </div>

  <!-- 1 · Basic -->
  <section class="section" id="basic">
    <div class="section-head">
      <h2><span class="n">01</span> Sortable list</h2>
      <p class="desc">The fundamentals: drag to reorder, with a FLIP animation on every move.</p>
      <p class="use"><b>Use it for</b> to-do lists, playlists, priority ordering.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{ items: basic, onItemsChange: (v) => (basic = v), animation: 200 }}
      >
        {#each basic as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item"><div class="card">{item.text}</div></li>
        {/each}
      </ul>
    </div>
  </section>

  <!-- 2 · Groups -->
  <section class="section" id="groups">
    <div class="section-head">
      <h2><span class="n">02</span> Shared lists (groups)</h2>
      <p class="desc">Give lists the same <code>group</code> and items drag freely between them.</p>
      <p class="use"><b>Use it for</b> Kanban boards, buckets, inbox → done flows.</p>
    </div>
    <div class="card-wrap">
      <div class="board">
        <div class="col">
          <h3>Backlog</h3>
          <ul
            class="list"
            use:draggable={{
              items: backlog,
              onItemsChange: (v) => (backlog = v),
              group: 'kanban',
              animation: 200,
              emptyInsertThreshold: 12,
            }}
          >
            {#each backlog as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
                <div class="card">{item.text}</div>
              </li>{/each}
          </ul>
        </div>
        <div class="col">
          <h3>In progress</h3>
          <ul
            class="list"
            use:draggable={{
              items: doing,
              onItemsChange: (v) => (doing = v),
              group: 'kanban',
              animation: 200,
              emptyInsertThreshold: 12,
            }}
          >
            {#each doing as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
                <div class="card">{item.text}</div>
              </li>{/each}
          </ul>
        </div>
        <div class="col">
          <h3>Done</h3>
          <ul
            class="list"
            use:draggable={{
              items: done,
              onItemsChange: (v) => (done = v),
              group: 'kanban',
              animation: 200,
              emptyInsertThreshold: 12,
            }}
          >
            {#each done as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
                <div class="card">{item.text}</div>
              </li>{/each}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 3 · Clone -->
  <section class="section" id="clone">
    <div class="section-head">
      <h2><span class="n">03</span> Clone (palette → canvas)</h2>
      <p class="desc">
        With <code>pull: 'clone'</code> the palette copies items out and keeps the originals.
      </p>
      <p class="use"><b>Use it for</b> page / form builders, component palettes.</p>
    </div>
    <div class="card-wrap">
      <div class="board">
        <div class="col">
          <h3>Palette (copies out)</h3>
          <ul
            class="list"
            use:draggable={{
              items: palette,
              onItemsChange: (v) => (palette = v),
              sort: false,
              group: { name: 'blocks', pull: 'clone', put: false },
              clone: cloneFn,
              animation: 200,
            }}
          >
            {#each palette as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
                <div class="card pill">{item.text}</div>
              </li>{/each}
          </ul>
        </div>
        <div class="col">
          <h3>Canvas (drop here)</h3>
          <ul
            class="list canvas"
            use:draggable={{
              items: canvas,
              onItemsChange: (v) => (canvas = v),
              group: 'blocks',
              animation: 200,
              emptyInsertThreshold: 16,
            }}
          >
            {#each canvas as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
                <div class="card">{item.text}</div>
              </li>{/each}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 · Handle & filter -->
  <section class="section" id="handle">
    <div class="section-head">
      <h2><span class="n">04</span> Handle &amp; filter</h2>
      <p class="desc">
        <code>handle</code> starts drags from the grip; <code>filter</code> blocks locked rows.
      </p>
      <p class="use"><b>Use it for</b> rows with controls, pinned items, selectable text.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{
          items: handleList,
          onItemsChange: (v) => (handleList = v),
          handle: '.grip',
          filter: '.locked',
          animation: 200,
        }}
      >
        {#each handleList as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item">
            {#if item.locked}
              <div class="card locked">🔒 {item.text}<span class="muted">filter</span></div>
            {:else}
              <div class="card"><span class="grip">⋮⋮</span> {item.text}</div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <!-- 5 · Multi-drag -->
  <section class="section" id="multi">
    <div class="section-head">
      <h2><span class="n">05</span> Multi-drag</h2>
      <p class="desc">
        Ctrl/Cmd-click to select several items, then drag them together as one batch.
      </p>
      <p class="use"><b>Use it for</b> file managers, bulk-move UIs.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{
          items: files,
          onItemsChange: (v) => (files = v),
          multiDrag: true,
          animation: 200,
          onSelectionChange: (e) => (selected = e.indices),
        }}
      >
        {#each files as item, i (item.id)}
          <li data-dnd-index={i} class="dnd-item">
            <div class="card">{selected.includes(i) ? '☑' : '☐'} {item.text}</div>
          </li>
        {/each}
      </ul>
      <p class="use">
        {selected.length
          ? `${selected.length} selected — drag any one to move them together.`
          : 'Ctrl/Cmd-click a few files, then drag any selected one.'}
      </p>
    </div>
  </section>

  <!-- 6 · Swap grid -->
  <section class="section" id="swap">
    <div class="section-head">
      <h2><span class="n">06</span> Swap mode (grid)</h2>
      <p class="desc">
        <code>swap: true</code> exchanges two items instead of inserting — great for 2-D grids.
      </p>
      <p class="use"><b>Use it for</b> dashboards, galleries, tile boards.</p>
    </div>
    <div class="card-wrap">
      <div
        class="grid-board"
        use:draggable={{
          items: tiles,
          onItemsChange: (v) => (tiles = v),
          swap: true,
          animation: 200,
        }}
      >
        {#each tiles as tile, i (tile.id)}
          <div data-dnd-index={i} class="tile dnd-item" style="background: hsl({tile.hue} 70% 62%)">
            {tile.id}
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- 7 · Keyboard -->
  <section class="section" id="keyboard">
    <div class="section-head">
      <h2><span class="n">07</span> Keyboard &amp; accessibility</h2>
      <p class="desc">
        Focus an item, <kbd>Space</kbd> to grab, <kbd>↑</kbd>/<kbd>↓</kbd> to move, <kbd>Esc</kbd> to
        cancel.
      </p>
      <p class="use"><b>Use it for</b> keyboard-only and screen-reader users.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{
          items: steps,
          onItemsChange: (v) => (steps = v),
          keyboard: true,
          ariaLabel: 'Recipe steps',
          animation: 200,
          onKeyboardMove: (e) =>
            (kbStatus = `Moved step from position ${e.oldIndex + 1} to ${e.newIndex + 1}.`),
          onKeyboardStateChange: (i) => (kbActive = i),
        }}
      >
        {#each steps as item, i (item.id)}
          <li
            data-dnd-index={i}
            class="dnd-item"
            class:dnd-keyboard-active={kbActive === i}
            tabindex="0"
            role="option"
            aria-selected={kbActive === i}
          >
            <div class="card">{item.text}</div>
          </li>
        {/each}
      </ul>
      <p class="use">{kbStatus}</p>
    </div>
  </section>

  <!-- 8 · Custom ghost -->
  <section class="section" id="ghost">
    <div class="section-head">
      <h2><span class="n">08</span> Custom drag preview</h2>
      <p class="desc">
        <code>ghostFactory</code> replaces the cloned element with any HTML you build.
      </p>
      <p class="use"><b>Use it for</b> compact pills, "N items" badges, branded ghosts.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{
          items: gear,
          onItemsChange: (v) => (gear = v),
          ghostFactory: ghost,
          animation: 200,
        }}
      >
        {#each gear as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
            <div class="card">{item.text}</div>
          </li>{/each}
      </ul>
    </div>
  </section>

  <!-- 9 · Spill -->
  <section class="section" id="spill">
    <div class="section-head">
      <h2><span class="n">09</span> Spill to delete</h2>
      <p class="desc"><code>removeOnSpill</code> deletes an item dropped outside the list.</p>
      <p class="use"><b>Use it for</b> drag-off-to-remove, trash zones, dismissible chips.</p>
    </div>
    <div class="card-wrap">
      <ul
        class="list"
        use:draggable={{
          items: spill,
          onItemsChange: (v) => (spill = v),
          removeOnSpill: true,
          animation: 200,
        }}
      >
        {#each spill as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
            <div class="card">{item.text}</div>
          </li>{/each}
      </ul>
      <div class="trash">🗑️ Drag an item off the list to delete it</div>
    </div>
  </section>

  <!-- 10 · Nested lists -->
  <section class="section" id="nested">
    <div class="section-head">
      <h2><span class="n">10</span> Nested lists (trees)</h2>
      <p class="desc">
        Trees are just lists inside list items. Give every level the same <code>group</code> and items
        drag freely between branches and depths.
      </p>
      <p class="use"><b>Use it for</b> file trees, comment threads, org charts.</p>
    </div>
    <div class="card-wrap">
      <TreeNode items={tree} onItemsChange={(v) => (tree = v)} />
    </div>
  </section>

  <!-- 11 · API & events -->
  <section class="section" id="api">
    <div class="section-head">
      <h2><span class="n">11</span> Reactive API &amp; live events</h2>
      <p class="desc">
        Reorder the array directly (the Svelte way); drag events stream in through the action's
        callbacks.
      </p>
      <p class="use"><b>Use it for</b> "add row" buttons, undo/redo, server sync.</p>
    </div>
    <div class="card-wrap">
      <div class="toolbar">
        <button onclick={addItem}>+ Add item</button>
        <button onclick={moveItem}>Move first → last</button>
        <button onclick={removeItem}>Remove last</button>
        <button onclick={shuffle}>Shuffle</button>
      </div>
      <ul
        class="list"
        use:draggable={{
          items: api,
          onItemsChange: (v) => (api = v),
          animation: 200,
          onUpdate: (e) => push('update', `${e.oldIndex} → ${e.newIndex}`),
          onEnd: (e) =>
            push('end', e.cancelled ? 'cancelled' : `dropped ${e.oldIndex} → ${e.newIndex}`),
        }}
      >
        {#each api as item, i (item.id)}<li data-dnd-index={i} class="dnd-item">
            <div class="card">{item.text}</div>
          </li>{/each}
      </ul>
      <div class="log">
        {#if log.length === 0}
          <div class="empty">Drag items or press a button — events appear here…</div>
        {:else}
          {#each log as e, i (i)}<div class="row"><span class="k">{e.k}</span> {e.d}</div>{/each}
        {/if}
      </div>
    </div>
  </section>

  <footer>
    Every card runs the same zero-dependency <code>@anil-labs/dnd-core</code> engine.
    <a href="https://github.com/anilkumarthakur60/dnd">View source on GitHub</a>
  </footer>
</main>
