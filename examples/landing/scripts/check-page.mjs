#!/usr/bin/env node
// Post-build guard for the dnd landing page.
//
// A broken landing page fails silently: the markup renders, the headings read
// correctly, and only the demos — the entire point of the page — come up as
// dead, undraggable lists. Typechecking cannot catch it either, since every
// wiring bug worth having (a renamed id, a list never passed to
// createSortable, a listener bound to the wrong button) is type-correct.
//
// A full drag needs pointer geometry that jsdom does not provide, so this
// guard does not simulate one. Instead it asserts the two things that DO prove
// the engine ran headlessly:
//
//   1. Every demo list initialized — createSortable() synchronously stamps
//      `data-dnd-index` and the `.dnd-item` class onto each child, so their
//      presence means the engine mounted on that list.
//   2. The programmatic API panel actually reorders — driving the real
//      list.insertAt / move / removeAt path (no pointer events involved) and
//      asserting the DOM and event log change.
//
// Usage:  node scripts/check-page.mjs [outDir]     (default: dist)

import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(here, '..')
const require = createRequire(resolve(pkgRoot, 'package.json'))

const outDir = resolve(pkgRoot, process.argv[2] ?? 'dist')

const failures = []
const check = (condition, msg) => {
  if (!condition) failures.push(msg)
}

// ------------------------------------------------------------------ bootstrap

const html = readFileSync(resolve(outDir, 'index.html'), 'utf8')

const scriptSrc = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
if (!scriptSrc) {
  console.error('✗ check-page: no module script found in index.html')
  process.exit(1)
}

const { JSDOM } = require('jsdom')
const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true })

for (const key of [
  'window',
  'document',
  'navigator',
  'getComputedStyle',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'HTMLElement',
  'Element',
  'Node',
  'MouseEvent',
  'CustomEvent',
  'Event',
]) {
  // Node ≥21 defines some globals (notably `navigator`) as getter-only
  // accessors, so plain assignment throws. defineProperty replaces the
  // descriptor outright and works for both cases.
  Object.defineProperty(globalThis, key, {
    value: dom.window[key] ?? dom.window,
    configurable: true,
    writable: true,
  })
}

// FLIP calls element.animate(), which jsdom does not implement. A drag never
// runs here, but the programmatic move() path touches it — stub it to a no-op.
if (typeof dom.window.Element.prototype.animate !== 'function') {
  dom.window.Element.prototype.animate = () => ({ cancel() {}, finish() {} })
}

// The bundle's top-level code runs on import — that IS the wiring under test.
await import(pathToFileURL(resolve(outDir, scriptSrc.replace(/^\.?\//, ''))).href)

const doc = dom.window.document
const $ = (sel) => doc.querySelector(sel)
const $$ = (sel) => [...doc.querySelectorAll(sel)]
const text = (sel) => $(sel)?.textContent ?? ''
const click = (elem) => elem?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))

// ------------------------------------------------------- every demo initialized

// createSortable() stamps this on each child during construction. If a list
// has zero, the engine never mounted on it.
const initialized = (listSel) =>
  $$(`${listSel} > *`).filter((c) => c.hasAttribute('data-dnd-index')).length

const LISTS = [
  '#hero-list',
  '#g-backlog',
  '#g-doing',
  '#g-done',
  '#multi-list',
  '#swap-grid',
  '#handle-list',
  '#kbd-list',
  '#spill-list',
  '#accent-list',
  '#api-list',
]
for (const sel of LISTS) {
  check(initialized(sel) > 0, `${sel}: createSortable never initialized (no data-dnd-index items).`)
}

// The swap grid tiles are built in JS — if that loop broke, the grid is empty.
check($$('#swap-grid > .tile').length === 8, '#swap-grid: expected 8 generated tiles.')

// Keyboard demo must expose the a11y contract, else "keyboard mode" is a lie.
const kbdItem = $('#kbd-list > .card')
check(kbdItem?.getAttribute('tabindex') === '0', '#kbd-list: items are not keyboard-focusable.')
check(kbdItem?.getAttribute('role') === 'option', '#kbd-list: items lack role="option".')
check(kbdItem?.hasAttribute('aria-setsize'), '#kbd-list: items lack aria-setsize.')

// ------------------------------------------------------- programmatic API panel

const apiTexts = () => $$('#api-list > li').map((li) => li.textContent)

check(apiTexts().length === 3, '#api-list: expected 3 seed items.')

click($('#api-add'))
check(apiTexts().length === 4, '#api-add: did not insert an item.')
check(apiTexts()[3] === 'Item D', '#api-add: inserted item has the wrong label/position.')
check($('#api-log .empty') === null, '#api-log: placeholder not cleared after an event.')
check($$('#api-log .row').length >= 1, '#api-log: no event row logged.')

const firstBeforeMove = apiTexts()[0]
click($('#api-move'))
check(
  apiTexts()[0] !== firstBeforeMove && apiTexts()[3] === firstBeforeMove,
  '#api-move: move(first → last) did not reorder the DOM.',
)

click($('#api-remove'))
check(apiTexts().length === 3, '#api-remove: did not remove the last item.')

// --------------------------------------------------------------- theme switch

click($('#theme-switch button[data-theme="dark"]'))
check(
  doc.documentElement.dataset.theme === 'dark',
  'theme switch: <html data-theme> was not set to dark.',
)
check(
  $('#theme-switch button[data-theme="dark"]')?.getAttribute('aria-pressed') === 'true',
  'theme switch: aria-pressed was not moved to the active button.',
)

// --------------------------------------------------------------- accent picker

click($('#accent-switch button[data-accent="emerald"]'))
check(
  $('#theming-scope')?.style.getPropertyValue('--dnd-accent') === '#10b981',
  'accent picker: --dnd-accent was not applied to the scope.',
)
check(text('#accent-code').includes('#10b981'), 'accent picker: the code sample did not update.')

// ------------------------------------------------------------------ chrome

check(/^v\d/.test(text('#version-badge')), '#version-badge: version was not injected.')

const fwLinks = $$('#fw-grid a')
check(fwLinks.length === 6, `#fw-grid: expected 6 framework cards, found ${fwLinks.length}.`)
for (const slug of ['vanilla', 'react', 'vue', 'svelte', 'solid', 'element']) {
  check(
    fwLinks.some((a) => a.getAttribute('href') === `./${slug}/`),
    `#fw-grid: no card links to ./${slug}/.`,
  )
}

// ---------------------------------------------------------------------- report

if (failures.length > 0) {
  console.error(`\n✗ check-page: ${failures.length} problem(s) in ${outDir}\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(`✓ check-page: landing demos verified in ${outDir}`)
