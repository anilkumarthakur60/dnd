import { createSortable } from '@anil-labs/dnd-core'
import type { GhostFactoryInfo } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'
import './style.css'

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

const card = (text: string): HTMLLIElement => {
  const li = document.createElement('li')
  li.className = 'card'
  li.textContent = text
  return li
}

// 1 · Basic sorting
createSortable($('basic-list'), { animation: 200 })

// 2 · Groups — three lists sharing one group
for (const id of ['kanban-backlog', 'kanban-doing', 'kanban-done']) {
  createSortable($(id), { group: 'kanban', animation: 200, emptyInsertThreshold: 12 })
}

// 3 · Clone — palette copies out, canvas receives
createSortable($('clone-palette'), {
  group: { name: 'blocks', pull: 'clone', put: false },
  sort: false,
  animation: 200,
})
createSortable($('clone-canvas'), { group: 'blocks', animation: 200, emptyInsertThreshold: 16 })

// 4 · Handle & filter — grip-only drags, locked rows excluded
createSortable($('handle-list'), {
  handle: '.grip',
  draggable: ':not(.locked)',
  animation: 200,
})

// 5 · Multi-drag
const multiStatus = $('multi-status')
createSortable($('multi-list'), {
  multiDrag: true,
  animation: 200,
  onSelectionChange: ({ indices }) => {
    multiStatus.textContent = indices.length
      ? `${indices.length} selected — drag any one to move them together.`
      : 'Ctrl/Cmd-click a few files, then drag any selected one.'
  },
})

// 6 · Swap grid
const grid = $('swap-grid')
const hues = [8, 32, 152, 190, 220, 260, 300, 340]
hues.forEach((h, i) => {
  const tile = document.createElement('div')
  tile.className = 'tile'
  tile.textContent = String(i + 1)
  tile.style.background = `hsl(${h} 70% 62%)`
  grid.appendChild(tile)
})
createSortable(grid, { swap: true, animation: 200 })

// 7 · Keyboard
const kbStatus = $('keyboard-status')
createSortable($('keyboard-list'), {
  keyboard: true,
  animation: 200,
  ariaLabel: 'Recipe steps',
  onKeyboardMove: ({ oldIndex, newIndex }) => {
    kbStatus.textContent = `Moved step from position ${oldIndex + 1} to ${newIndex + 1}.`
  },
})

// 8 · Custom ghost
createSortable($('ghost-list'), {
  animation: 200,
  ghostFactory: ({ sourceEl, count }: GhostFactoryInfo<HTMLElement>) => {
    const el = document.createElement('div')
    el.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
    el.style.cssText =
      'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
    return el
  },
})

// 9 · Spill to delete
createSortable($('spill-list'), { removeOnSpill: true, animation: 200 })

// 10 · Nested lists (trees)
interface TreeItem {
  id: number
  label: string
  children: TreeItem[]
}

let treeUid = 0
const nextTreeId = (): number => ++treeUid

const treeData: TreeItem[] = [
  {
    id: nextTreeId(),
    label: 'src/',
    children: [
      {
        id: nextTreeId(),
        label: 'components/',
        children: [
          { id: nextTreeId(), label: 'Button.ts', children: [] },
          { id: nextTreeId(), label: 'Modal.ts', children: [] },
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
]

const treeStatus = $('tree-status')

// Every level — however deep — is its own `createSortable` instance sharing
// the same `group`, so items drag freely between branches and depths. The
// engine itself refuses to drop a branch inside its own descendants and
// picks the deepest list under the pointer, so no manual guard is needed.
function buildTreeList(items: TreeItem[]): HTMLUListElement {
  const ul = document.createElement('ul')
  ul.className = 'tree-list'
  for (const item of items) ul.appendChild(buildTreeNode(item))
  createSortable(ul, {
    group: 'tree',
    animation: 200,
    emptyInsertThreshold: 14,
    onEnd: ({ item, cancelled }) => {
      if (cancelled) return
      const label = item.querySelector('.tree-label')?.textContent ?? 'item'
      treeStatus.textContent = `Moved "${label}" — its whole branch moved with it.`
    },
  })
  return ul
}

function buildTreeNode(item: TreeItem): HTMLLIElement {
  const li = document.createElement('li')
  li.className = 'tree-node'

  const row = document.createElement('div')
  row.className = 'tree-row'
  const grip = document.createElement('span')
  grip.className = 'grip'
  grip.textContent = '⠿'
  const label = document.createElement('span')
  label.className = 'tree-label'
  label.textContent = item.label
  row.append(grip, label)

  li.append(row)
  if (item.label.endsWith('/')) li.append(buildTreeList(item.children))
  return li
}

$('tree-root').appendChild(buildTreeList(treeData))

// 11 · Programmatic API & live events
const apiList = $('api-list')
const log = $('api-log')
let counter = 0
const logLine = (kind: string, detail: string): void => {
  const empty = log.querySelector('.empty')
  if (empty) empty.remove()
  const row = document.createElement('div')
  row.className = 'row'
  row.innerHTML = `<span class="k">${kind}</span> ${detail}`
  log.prepend(row)
  while (log.childElementCount > 30) log.lastElementChild?.remove()
}
log.innerHTML = '<div class="empty">Drag items or press a button — events appear here…</div>'

const apiSortable = createSortable(apiList, {
  animation: 200,
  onUpdate: ({ oldIndex, newIndex }) => logLine('update', `${oldIndex} → ${newIndex}`),
  onEnd: ({ oldIndex, newIndex, cancelled }) =>
    logLine('end', cancelled ? 'cancelled' : `dropped ${oldIndex} → ${newIndex}`),
})

$('api-add').addEventListener('click', () => {
  const node = card(`Item ${String.fromCharCode(68 + counter++)}`)
  apiSortable.list.insertAt(apiList.childElementCount, node)
  logLine('insertAt', `"${node.textContent}"`)
})
$('api-move').addEventListener('click', () => {
  apiSortable.list.move(0, apiList.childElementCount - 1)
  logLine('move', 'first → last')
})
$('api-remove').addEventListener('click', () => {
  const removed = apiSortable.list.removeAt(apiList.childElementCount - 1)
  if (removed) logLine('removeAt', `"${removed.textContent}"`)
})
$('api-shuffle').addEventListener('click', () => {
  const n = apiList.childElementCount
  for (let i = 0; i < n; i++) apiSortable.list.move(0, Math.floor(Math.random() * n))
  logLine('shuffle', `${n} items`)
})
