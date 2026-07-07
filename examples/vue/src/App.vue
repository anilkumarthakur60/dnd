<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { Draggable } from '@anil-labs/dnd'
import type { DraggableExpose, GhostFactoryInfo } from '@anil-labs/dnd'
import TreeNode from './TreeNode.vue'
import type { TreeItem } from './TreeNode.vue'

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

const basic = ref(
  make(
    'Design the landing page',
    'Wire up authentication',
    'Write the API docs',
    'Fix the mobile nav',
    'Add a dark theme',
  ),
)

const backlog = ref(make('Research competitors', 'Draft the spec', 'Book the venue'))
const doing = ref(make('Build the prototype'))
const done = ref(make('Kick-off meeting'))

const palette = ref(make('Heading', 'Paragraph', 'Image', 'Button'))
const canvas = ref<Item[]>([])
const cloneFn = (item: Item): Item => ({ ...item, id: nextId() })

const handleList = ref<Item[]>([
  { id: nextId(), text: 'Drag me by the grip' },
  { id: nextId(), text: 'Text stays selectable' },
  { id: nextId(), text: 'Locked — cannot move', locked: true },
  { id: nextId(), text: 'Grips beat accidental drags' },
])

const files = ref(make('report-q3.pdf', 'photo-01.jpg', 'notes.md', 'budget.xlsx', 'deck.key'))
const selectedCount = ref(0)

const tiles = ref([8, 32, 152, 190, 220, 260, 300, 340].map((hue, i) => ({ id: i + 1, hue })))

const steps = ref(
  make('1 · Preheat oven', '2 · Mix the batter', '3 · Pour into tin', '4 · Bake 30 min'),
)
const kbStatus = ref('Tab to an item to begin.')

const gear = ref(make('🎧 Headphones', '⌨️ Keyboard', '🖱️ Mouse', '🖥️ Monitor'))
const ghost = ({ sourceEl, count }: GhostFactoryInfo<Item>): HTMLElement => {
  const pill = document.createElement('div')
  pill.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
  pill.style.cssText =
    'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
  return pill
}

const spill = ref(make('Newsletter subscription', 'Unused API key', 'Old draft', 'Expired coupon'))

let treeUid = 0
const nextTreeId = () => ++treeUid
const tree = ref<TreeItem[]>([
  {
    id: nextTreeId(),
    label: 'src/',
    children: [
      {
        id: nextTreeId(),
        label: 'components/',
        children: [
          { id: nextTreeId(), label: 'Button.vue', children: [] },
          { id: nextTreeId(), label: 'Modal.vue', children: [] },
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

const api = ref(make('Alpha', 'Bravo', 'Charlie'))
const log = ref<{ k: string; d: string }[]>([])
const dnd = useTemplateRef<DraggableExpose<Item>>('dnd')
let apiN = 0
const push = (k: string, d: string) => {
  log.value = [{ k, d }, ...log.value].slice(0, 30)
}
const addItem = () => {
  const it = { id: nextId(), text: `Item ${String.fromCharCode(68 + apiN++)}` }
  dnd.value?.insertAt(api.value.length, it)
  push('insertAt', `"${it.text}"`)
}
const moveItem = () => {
  dnd.value?.move(0, api.value.length - 1)
  push('move', 'first → last')
}
const removeItem = () => {
  const r = dnd.value?.removeAt(api.value.length - 1)
  if (r) push('removeAt', `"${r.text}"`)
}
const shuffle = () => {
  const n = api.value.length
  for (let i = 0; i < n; i++) dnd.value?.move(0, Math.floor(Math.random() * n))
  push('shuffle', `${n} items`)
}
</script>

<template>
  <main>
    <div class="hero">
      <span class="badge">Vue 3 · &lt;Draggable&gt;</span>
      <h1>@anil-labs/dnd</h1>
      <p class="tag">
        Every feature, one page. Each card is a self-contained example — find the one that matches
        your use case.
      </p>
      <nav class="toc">
        <a v-for="[id, label] in SECTIONS" :key="id" :href="`#${id}`">{{ label }}</a>
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
        <Draggable
          v-model="basic"
          item-key="id"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }"
            ><div class="card">{{ element.text }}</div></template
          >
        </Draggable>
      </div>
    </section>

    <!-- 2 · Groups -->
    <section class="section" id="groups">
      <div class="section-head">
        <h2><span class="n">02</span> Shared lists (groups)</h2>
        <p class="desc">
          Give lists the same <code>group</code> and items drag freely between them.
        </p>
        <p class="use"><b>Use it for</b> Kanban boards, buckets, inbox → done flows.</p>
      </div>
      <div class="card-wrap">
        <div class="board">
          <div class="col">
            <h3>Backlog</h3>
            <Draggable
              v-model="backlog"
              item-key="id"
              group="kanban"
              :animation="200"
              :empty-insert-threshold="12"
              tag="ul"
              item-tag="li"
              class="list"
            >
              <template #item="{ element }"
                ><div class="card">{{ element.text }}</div></template
              >
            </Draggable>
          </div>
          <div class="col">
            <h3>In progress</h3>
            <Draggable
              v-model="doing"
              item-key="id"
              group="kanban"
              :animation="200"
              :empty-insert-threshold="12"
              tag="ul"
              item-tag="li"
              class="list"
            >
              <template #item="{ element }"
                ><div class="card">{{ element.text }}</div></template
              >
            </Draggable>
          </div>
          <div class="col">
            <h3>Done</h3>
            <Draggable
              v-model="done"
              item-key="id"
              group="kanban"
              :animation="200"
              :empty-insert-threshold="12"
              tag="ul"
              item-tag="li"
              class="list"
            >
              <template #item="{ element }"
                ><div class="card">{{ element.text }}</div></template
              >
            </Draggable>
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
            <Draggable
              v-model="palette"
              item-key="id"
              :sort="false"
              :group="{ name: 'blocks', pull: 'clone', put: false }"
              :clone="cloneFn"
              :animation="200"
              tag="ul"
              item-tag="li"
              class="list"
            >
              <template #item="{ element }"
                ><div class="card pill">{{ element.text }}</div></template
              >
            </Draggable>
          </div>
          <div class="col">
            <h3>Canvas (drop here)</h3>
            <Draggable
              v-model="canvas"
              item-key="id"
              group="blocks"
              :animation="200"
              :empty-insert-threshold="16"
              tag="ul"
              item-tag="li"
              class="list canvas"
            >
              <template #item="{ element }"
                ><div class="card">{{ element.text }}</div></template
              >
            </Draggable>
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
        <Draggable
          v-model="handleList"
          item-key="id"
          handle=".grip"
          filter=".locked"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }">
            <div v-if="element.locked" class="card locked">
              🔒 {{ element.text }}<span class="muted">filter</span>
            </div>
            <div v-else class="card"><span class="grip">⋮⋮</span> {{ element.text }}</div>
          </template>
        </Draggable>
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
        <Draggable
          v-model="files"
          item-key="id"
          multi-drag
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
          @selection-change="selectedCount = $event.indices.length"
        >
          <template #item="{ element, selected }"
            ><div class="card">{{ selected ? '☑' : '☐' }} {{ element.text }}</div></template
          >
        </Draggable>
        <p class="use">
          {{
            selectedCount
              ? `${selectedCount} selected — drag any one to move them together.`
              : 'Ctrl/Cmd-click a few files, then drag any selected one.'
          }}
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
        <Draggable
          v-model="tiles"
          item-key="id"
          swap
          :animation="200"
          tag="div"
          item-tag="div"
          class="grid-board"
        >
          <template #item="{ element }"
            ><div class="tile" :style="{ background: `hsl(${element.hue} 70% 62%)` }">
              {{ element.id }}
            </div></template
          >
        </Draggable>
      </div>
    </section>

    <!-- 7 · Keyboard -->
    <section class="section" id="keyboard">
      <div class="section-head">
        <h2><span class="n">07</span> Keyboard &amp; accessibility</h2>
        <p class="desc">
          Focus an item, <kbd>Space</kbd> to grab, <kbd>↑</kbd>/<kbd>↓</kbd> to move,
          <kbd>Esc</kbd> to cancel.
        </p>
        <p class="use"><b>Use it for</b> keyboard-only and screen-reader users.</p>
      </div>
      <div class="card-wrap">
        <Draggable
          v-model="steps"
          item-key="id"
          keyboard
          aria-label="Recipe steps"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
          @keyboard-move="
            kbStatus = `Moved step from position ${$event.oldIndex + 1} to ${$event.newIndex + 1}.`
          "
        >
          <template #item="{ element }"
            ><div class="card">{{ element.text }}</div></template
          >
        </Draggable>
        <p class="use">{{ kbStatus }}</p>
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
        <Draggable
          v-model="gear"
          item-key="id"
          :ghost-factory="ghost"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }"
            ><div class="card">{{ element.text }}</div></template
          >
        </Draggable>
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
        <Draggable
          v-model="spill"
          item-key="id"
          remove-on-spill
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
        >
          <template #item="{ element }"
            ><div class="card">{{ element.text }}</div></template
          >
        </Draggable>
        <div class="trash">🗑️ Drag an item off the list to delete it</div>
      </div>
    </section>

    <!-- 10 · Nested lists -->
    <section class="section" id="nested">
      <div class="section-head">
        <h2><span class="n">10</span> Nested lists (trees)</h2>
        <p class="desc">
          Trees are just lists inside list items. Give every level the same
          <code>group</code> and items drag freely between branches and depths.
        </p>
        <p class="use"><b>Use it for</b> file trees, comment threads, org charts.</p>
      </div>
      <div class="card-wrap">
        <TreeNode :items="tree" @update:items="(v) => (tree = v)" />
      </div>
    </section>

    <!-- 11 · API & events -->
    <section class="section" id="api">
      <div class="section-head">
        <h2><span class="n">11</span> Programmatic API &amp; live events</h2>
        <p class="desc">
          Drive the list from code — <code>move</code>, <code>insertAt</code>,
          <code>removeAt</code> — and watch events fire.
        </p>
        <p class="use"><b>Use it for</b> "add row" buttons, undo/redo, server sync.</p>
      </div>
      <div class="card-wrap">
        <div class="toolbar">
          <button @click="addItem">+ Add item</button>
          <button @click="moveItem">Move first → last</button>
          <button @click="removeItem">Remove last</button>
          <button @click="shuffle">Shuffle</button>
        </div>
        <Draggable
          ref="dnd"
          v-model="api"
          item-key="id"
          :animation="200"
          tag="ul"
          item-tag="li"
          class="list"
          @update="push('update', `${$event.oldIndex} → ${$event.newIndex}`)"
          @end="
            push(
              'end',
              $event.cancelled ? 'cancelled' : `dropped ${$event.oldIndex} → ${$event.newIndex}`,
            )
          "
        >
          <template #item="{ element }"
            ><div class="card">{{ element.text }}</div></template
          >
        </Draggable>
        <div class="log">
          <div v-if="log.length === 0" class="empty">
            Drag items or press a button — events appear here…
          </div>
          <div v-for="(e, i) in log" :key="i" class="row">
            <span class="k">{{ e.k }}</span> {{ e.d }}
          </div>
        </div>
      </div>
    </section>

    <footer>
      Every card runs the same zero-dependency <code>@anil-labs/dnd-core</code> engine.
      <a href="https://github.com/anilkumarthakur60/vue-dnd">View source on GitHub</a>
    </footer>
  </main>
</template>
