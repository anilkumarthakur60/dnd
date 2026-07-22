import { createSortable } from '@anil-labs/dnd-core'
import type { KeyboardMoveEvent, SelectionChangeEvent } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'
import './styles.css'

// This page has no framework: every demo is a direct createSortable() call on
// plain DOM, which is exactly the point it's making. The only imports are the
// engine and its stylesheet.

const el = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id)
  if (!node) throw new Error(`Landing page markup is missing #${id}`)
  return node as T
}

const escapeText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ------------------------------------------------------------------ chrome

el('version-badge').textContent = `v${__PKG_VERSION__}`

// --- Install command -------------------------------------------------------

const copyBtn = el<HTMLButtonElement>('install-copy')
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(el('install-cmd').textContent ?? '')
    copyBtn.textContent = 'Copied'
  } catch {
    // Clipboard access is permission-gated and missing over plain http on some
    // browsers. A silent no-op reads as a dead button, so say what happened.
    copyBtn.textContent = 'Copy failed'
  }
  setTimeout(() => {
    copyBtn.textContent = 'Copy'
  }, 1400)
})

// --- Theme -----------------------------------------------------------------

type Theme = 'light' | 'dark' | 'auto'

const themeSwitch = el('theme-switch')

function applyTheme(theme: Theme): void {
  // The page is themed entirely through --pg-* variables keyed off this one
  // attribute; the engine itself is theme-agnostic, so nothing else to notify.
  document.documentElement.dataset.theme = theme
  themeSwitch.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme))
  })
  themeSwitch.dataset.active = theme
}

themeSwitch.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-theme]')
  if (button) applyTheme(button.dataset.theme as Theme)
})

// ------------------------------------------------------------------- demos

// 1 · Hero — the basic sortable you land on.
createSortable(el('hero-list'), { animation: 200 })

// 2 · Groups — three lists sharing one group id drag between each other.
for (const id of ['g-backlog', 'g-doing', 'g-done']) {
  createSortable(el(id), { group: 'board', animation: 200, emptyInsertThreshold: 12 })
}

// 3 · Multi-drag — Ctrl/Cmd-click to select, drag the batch together.
const multiStatus = el('multi-status')
createSortable(el('multi-list'), {
  multiDrag: true,
  animation: 200,
  onSelectionChange: ({ indices }: SelectionChangeEvent) => {
    multiStatus.textContent = indices.length
      ? `${indices.length} selected — drag any one to move them together.`
      : 'Ctrl/⌘-click a few files, then drag one.'
  },
})

// 4 · Swap grid — build the tiles, then swap mode exchanges pairs.
const grid = el('swap-grid')
const hues = [8, 32, 152, 190, 220, 260, 300, 340]
hues.forEach((hue, i) => {
  const tile = document.createElement('div')
  tile.className = 'tile'
  tile.textContent = String(i + 1)
  tile.style.background = `hsl(${hue} 70% 62%)`
  grid.appendChild(tile)
})
createSortable(grid, { swap: true, animation: 200 })

// 5 · Handle & filter — grip-only drags, locked rows excluded.
createSortable(el('handle-list'), {
  handle: '.grip',
  draggable: ':not(.locked)',
  animation: 200,
})

// 6 · Keyboard — grab/move/drop from the keyboard, announced live.
const kbdStatus = el('kbd-status')
createSortable(el('kbd-list'), {
  keyboard: true,
  animation: 200,
  ariaLabel: 'Recipe steps',
  onKeyboardMove: ({ oldIndex, newIndex }: KeyboardMoveEvent) => {
    kbdStatus.textContent = `Moved step from position ${oldIndex + 1} to ${newIndex + 1}.`
  },
})

// 7 · Spill to delete — drop outside the list to remove.
createSortable(el('spill-list'), { removeOnSpill: true, animation: 200 })

// --- Accent theming demo — selection + keyboard marker follow --dnd-accent.
createSortable(el('accent-list'), {
  multiDrag: true,
  keyboard: true,
  animation: 200,
  ariaLabel: 'Accent palette',
})

// 8 · Programmatic API & live events — the guard drives this panel headless.
const apiList = el('api-list')
const apiLog = el('api-log')
let counter = 0

const logLine = (kind: string, detail: string): void => {
  apiLog.querySelector('.empty')?.remove()
  const row = document.createElement('div')
  row.className = 'row'
  row.innerHTML = `<span class="k">${escapeText(kind)}</span> ${escapeText(detail)}`
  apiLog.prepend(row)
  while (apiLog.childElementCount > 24) apiLog.lastElementChild?.remove()
}
apiLog.innerHTML = '<div class="empty">Drag a row or press a button — events appear here…</div>'

const apiSortable = createSortable(apiList, {
  animation: 200,
  onUpdate: ({ oldIndex, newIndex }) => logLine('update', `${oldIndex} → ${newIndex}`),
  onEnd: ({ oldIndex, newIndex, cancelled }) =>
    logLine('end', cancelled ? 'cancelled' : `dropped ${oldIndex} → ${newIndex}`),
})

const card = (text: string): HTMLLIElement => {
  const li = document.createElement('li')
  li.className = 'card'
  li.textContent = text
  return li
}

el('api-add').addEventListener('click', () => {
  const node = card(`Item ${String.fromCharCode(68 + counter++)}`)
  apiSortable.list.insertAt(apiList.childElementCount, node)
  logLine('insertAt', `"${node.textContent ?? ''}"`)
})
el('api-move').addEventListener('click', () => {
  if (apiList.childElementCount < 2) return
  apiSortable.list.move(0, apiList.childElementCount - 1)
  logLine('move', 'first → last')
})
el('api-remove').addEventListener('click', () => {
  const removed = apiSortable.list.removeAt(apiList.childElementCount - 1)
  if (removed) logLine('removeAt', `"${removed.textContent ?? ''}"`)
})
el('api-shuffle').addEventListener('click', () => {
  const n = apiList.childElementCount
  for (let i = 0; i < n; i++) apiSortable.list.move(0, Math.floor(Math.random() * n))
  logLine('shuffle', `${n} items`)
})

// ----------------------------------------------------------------- theming

const ACCENTS = {
  blue: '#6ea8ff',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  violet: '#8b5cf6',
} as const

type AccentName = keyof typeof ACCENTS

const accentScope = el('theming-scope')
const accentSwitch = el('accent-switch')
const accentCode = el('accent-code')

function applyAccent(name: AccentName): void {
  const value = ACCENTS[name]
  // The entire theming API: set --dnd-accent on any ancestor. It inherits, so
  // scoping it to this wrapper re-accents just this demo's drag visuals.
  accentScope.style.setProperty('--dnd-accent', value)
  accentCode.textContent = `#palette {\n  --dnd-accent: ${value};\n}`
  accentSwitch.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.accent === name))
  })
}

accentSwitch.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-accent]')
  if (button) applyAccent(button.dataset.accent as AccentName)
})

applyAccent('blue')

// -------------------------------------------------------------- frameworks

interface FrameworkDemo {
  slug: string
  label: string
  desc: string
}

const FRAMEWORKS: FrameworkDemo[] = [
  {
    slug: 'vanilla',
    label: 'Vanilla JS',
    desc: 'createSortable() on plain DOM — every feature, zero dependencies.',
  },
  {
    slug: 'react',
    label: 'React',
    desc: 'The <Draggable> component with controlled items, groups and multi-drag.',
  },
  {
    slug: 'vue',
    label: 'Vue 3',
    desc: 'The <Draggable> component with v-model, groups and drag handles.',
  },
  {
    slug: 'svelte',
    label: 'Svelte',
    desc: 'The use:draggable action over your own {#each} markup.',
  },
  {
    slug: 'solid',
    label: 'Solid',
    desc: 'The createDraggable primitive with signals and multi-drag.',
  },
  {
    slug: 'element',
    label: 'Web Component',
    desc: 'The <dnd-list> custom element — any framework or plain HTML.',
  },
]

el('fw-grid').innerHTML = FRAMEWORKS.map(
  ({ slug, label, desc }) => `
    <a class="fw-card" href="./${slug}/">
      <span class="fw-badge">${escapeText(label)}</span>
      <p class="fw-desc">${escapeText(desc)}</p>
      <span class="fw-cta">Open playground &rarr;</span>
    </a>`,
).join('')

// Apply the initial theme last so the switch reflects it.
applyTheme('light')
