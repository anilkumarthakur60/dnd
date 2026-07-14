import '@anil-labs/dnd-element'
import type { DndListElement } from '@anil-labs/dnd-element'
import type { GhostFactoryInfo } from '@anil-labs/dnd-element'
import './style.css'

const el = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T
const list = (id: string): DndListElement => el<DndListElement>(id)

const card = (text: string): HTMLLIElement => {
  const li = document.createElement('li')
  li.className = 'card'
  li.textContent = text
  return li
}

// 3 · Clone — palette copies out (group object + sort:false need the property API)
list('clone-palette').options = {
  group: { name: 'blocks', pull: 'clone', put: false },
  sort: false,
  animation: 200,
}

// 4 · Handle & filter — the `draggable` option can't be an attribute (reserved), so use options
list('handle-list').options = { draggable: ':not(.locked)' }

// 5 · Multi-drag status
el('multi-list').addEventListener('dnd-select', (event) => {
  const { indices } = (event as CustomEvent<{ indices: number[] }>).detail
  el('multi-status').textContent = indices.length
    ? `${indices.length} selected — drag any one to move them together.`
    : 'Ctrl/Cmd-click a few files, then drag any selected one.'
})

// 6 · Swap grid — inject tiles (the MutationObserver re-indexes them)
const grid = el('swap-grid')
;[8, 32, 152, 190, 220, 260, 300, 340].forEach((h, i) => {
  const tile = document.createElement('div')
  tile.className = 'tile'
  tile.textContent = String(i + 1)
  tile.style.background = `hsl(${h} 70% 62%)`
  grid.appendChild(tile)
})

// 7 · Keyboard status
el('keyboard-list').addEventListener('dnd-keyboard', (event) => {
  const { oldIndex, newIndex } = (event as CustomEvent<{ oldIndex: number; newIndex: number }>)
    .detail
  el('keyboard-status').textContent = `Moved step from position ${oldIndex + 1} to ${newIndex + 1}.`
})

// 8 · Custom ghost
list('ghost-list').options = {
  ghostFactory: ({ sourceEl, count }: GhostFactoryInfo<HTMLElement>) => {
    const pill = document.createElement('div')
    pill.textContent = count > 1 ? `${count} items` : (sourceEl.textContent ?? 'Moving…')
    pill.style.cssText =
      'padding:10px 16px;border-radius:999px;background:#7dabff;color:#0b0f17;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)'
    return pill
  },
}

// 9 · Spill to delete
list('spill-list').options = { removeOnSpill: true }

// 10 · Programmatic API & live events
const apiEl = list('api-list')
const log = el('api-log')
let counter = 0
const logLine = (kind: string, detail: string): void => {
  log.querySelector('.empty')?.remove()
  const row = document.createElement('div')
  row.className = 'row'
  row.innerHTML = `<span class="k">${kind}</span> ${detail}`
  log.prepend(row)
  while (log.childElementCount > 30) log.lastElementChild?.remove()
}
log.innerHTML = '<div class="empty">Drag items or press a button — events appear here…</div>'

apiEl.addEventListener('dnd-update', (event) => {
  const { oldIndex, newIndex } = (event as CustomEvent<{ oldIndex: number; newIndex: number }>)
    .detail
  logLine('dnd-update', `${oldIndex} → ${newIndex}`)
})
apiEl.addEventListener('dnd-end', (event) => {
  const { oldIndex, newIndex, cancelled } = (
    event as CustomEvent<{ oldIndex: number; newIndex: number; cancelled: boolean }>
  ).detail
  logLine('dnd-end', cancelled ? 'cancelled' : `dropped ${oldIndex} → ${newIndex}`)
})

el('api-add').addEventListener('click', () => {
  const node = card(`Item ${String.fromCharCode(68 + counter++)}`)
  apiEl.sortable?.list.insertAt(apiEl.childElementCount, node)
  logLine('insertAt', `"${node.textContent}"`)
})
el('api-move').addEventListener('click', () => {
  apiEl.sortable?.list.move(0, apiEl.childElementCount - 1)
  logLine('move', 'first → last')
})
el('api-remove').addEventListener('click', () => {
  const removed = apiEl.sortable?.list.removeAt(apiEl.childElementCount - 1)
  if (removed) logLine('removeAt', `"${removed.textContent}"`)
})
el('api-shuffle').addEventListener('click', () => {
  const n = apiEl.childElementCount
  for (let i = 0; i < n; i++) apiEl.sortable?.list.move(0, Math.floor(Math.random() * n))
  logLine('shuffle', `${n} items`)
})
