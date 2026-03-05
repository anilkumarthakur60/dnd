<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent, type Component } from 'vue'

interface DemoEntry {
  slug: string
  title: string
  loader: () => Promise<{ default: Component }>
}

const demos: DemoEntry[] = [
  { slug: 'simple', title: 'Simple', loader: () => import('./demo/pages/SimpleDemo.vue') },
  { slug: 'two-lists', title: 'Two Lists', loader: () => import('./demo/pages/TwoListsDemo.vue') },
  { slug: 'clone', title: 'Clone', loader: () => import('./demo/pages/CloneDemo.vue') },
  { slug: 'custom-clone', title: 'Custom Clone', loader: () => import('./demo/pages/CustomCloneDemo.vue') },
  { slug: 'clone-on-control', title: 'Clone on Control', loader: () => import('./demo/pages/CloneOnControlDemo.vue') },
  { slug: 'handle', title: 'Handle', loader: () => import('./demo/pages/HandleDemo.vue') },
  { slug: 'transition', title: 'Transition', loader: () => import('./demo/pages/TransitionDemo.vue') },
  { slug: 'transitions', title: 'Transitions', loader: () => import('./demo/pages/TransitionsDemo.vue') },
  { slug: 'table', title: 'Table', loader: () => import('./demo/pages/TableDemo.vue') },
  { slug: 'table-column', title: 'Table Column', loader: () => import('./demo/pages/TableColumnDemo.vue') },
  { slug: 'third-party', title: 'Third party', loader: () => import('./demo/pages/ThirdPartyDemo.vue') },
  { slug: 'footer-slot', title: 'Footer slot', loader: () => import('./demo/pages/FooterSlotDemo.vue') },
  { slug: 'header-slot', title: 'Header slot', loader: () => import('./demo/pages/HeaderSlotDemo.vue') },
  { slug: 'two-list-header-slot', title: 'Two list header slot', loader: () => import('./demo/pages/TwoListHeaderSlotDemo.vue') },
  { slug: 'nested', title: 'Nested', loader: () => import('./demo/pages/NestedDemo.vue') },
  { slug: 'touch-delay', title: 'Touch delay', loader: () => import('./demo/pages/TouchDelayDemo.vue') },
  { slug: 'multi-drag', title: 'Multi-drag', loader: () => import('./demo/pages/MultiDragDemo.vue') },
  { slug: 'swap', title: 'Swap', loader: () => import('./demo/pages/SwapDemo.vue') },
  { slug: 'keyboard', title: 'Keyboard a11y', loader: () => import('./demo/pages/KeyboardDemo.vue') },
  { slug: 'axis-lock', title: 'Axis lock', loader: () => import('./demo/pages/AxisLockDemo.vue') },
  { slug: 'custom-ghost', title: 'Custom ghost', loader: () => import('./demo/pages/CustomGhostDemo.vue') },
  { slug: 'entrance-exit', title: 'Entrance / exit', loader: () => import('./demo/pages/EntranceExitDemo.vue') },
  { slug: 'revert-spill', title: 'Revert on spill', loader: () => import('./demo/pages/RevertSpillDemo.vue') },
  { slug: 'programmatic', title: 'Programmatic API', loader: () => import('./demo/pages/ProgrammaticDemo.vue') },
  { slug: 'rtl', title: 'RTL horizontal', loader: () => import('./demo/pages/RtlDemo.vue') },
  { slug: 'empty-list', title: 'Empty list drop', loader: () => import('./demo/pages/EmptyListDemo.vue') },
]

const route = ref(location.hash.slice(1) || demos[0].slug)
const sidebarOpen = ref(false)
const isMobile = ref(false)

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'vue-dnd-theme'
const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
const initialTheme: Theme = ((): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  const urlTheme = new URLSearchParams(location.search).get('theme')
  if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme
  return prefersDark() ? 'dark' : 'light'
})()
const theme = ref<Theme>(initialTheme)

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  document.documentElement.style.colorScheme = t
}
applyTheme(theme.value)

watch(theme, (t) => {
  applyTheme(t)
  localStorage.setItem(STORAGE_KEY, t)
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

function onHashChange() {
  route.value = location.hash.slice(1) || demos[0].slug
  if (isMobile.value) sidebarOpen.value = false
}

function checkViewport() {
  isMobile.value = window.matchMedia('(max-width: 860px)').matches
  if (!isMobile.value) sidebarOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && sidebarOpen.value) sidebarOpen.value = false
}

onMounted(() => {
  checkViewport()
  window.addEventListener('hashchange', onHashChange)
  window.addEventListener('resize', checkViewport)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
  window.removeEventListener('resize', checkViewport)
  window.removeEventListener('keydown', onKeydown)
})

watch(sidebarOpen, (open) => {
  document.body.style.overflow = open && isMobile.value ? 'hidden' : ''
})

const current = computed(() => demos.find((d) => d.slug === route.value) ?? demos[0])
const currentComponent = computed(() => defineAsyncComponent(current.value.loader))

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="app" :class="{ 'sidebar-open': sidebarOpen }">
    <button
      class="hamburger"
      :aria-expanded="sidebarOpen"
      aria-label="Toggle navigation"
      @click="toggleSidebar"
    >
      <span /><span /><span />
    </button>

    <div
      class="scrim"
      :class="{ visible: sidebarOpen && isMobile }"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-head">
        <div>
          <h1>vue-dnd</h1>
          <p class="tagline">Zero-dep Vue 3 drag &amp; drop</p>
        </div>
        <button class="close" aria-label="Close navigation" @click="sidebarOpen = false">×</button>
      </div>
      <nav>
        <a
          v-for="d in demos"
          :key="d.slug"
          :href="`#${d.slug}`"
          :class="{ active: d.slug === route }"
        >
          {{ d.title }}
        </a>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <h2>{{ current.title }}</h2>
        <button
          class="theme-toggle"
          type="button"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          @click="toggleTheme"
        >
          <span aria-hidden="true">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        </button>
      </header>
      <section class="content">
        <component :is="currentComponent" />
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --sidebar-w: 240px;
  --topbar-h: 56px;
}

:root,
:root[data-theme='dark'] {
  --bg: #0e1014;
  --surface: #161a22;
  --surface-2: #1f2530;
  --border: #2a313e;
  --text: #e6e9ef;
  --muted: #8a93a3;
  --accent: #6ea8ff;
  --accent-2: #8effc7;
  --accent-on: #0b0f17;
}

:root[data-theme='light'] {
  --bg: #ffffff;
  --surface: #f6f7f9;
  --surface-2: #eef0f4;
  --border: #d8dce4;
  --text: #0e1014;
  --muted: #5b6472;
  --accent: #2d6df0;
  --accent-2: #1aa672;
  --accent-on: #ffffff;
}

* { box-sizing: border-box; }

html, body, #app {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
}

html, body { overscroll-behavior-y: none; }

.app {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
  min-height: 100dvh;
}

.hamburger {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 60;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.hamburger span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}

.scrim {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
  z-index: 40;
}
.scrim.visible {
  opacity: 1;
  pointer-events: auto;
}

.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 20px 14px;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
}

.sidebar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-head .close {
  display: none;
  background: transparent;
  color: var(--muted);
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.sidebar h1 {
  margin: 0 6px 2px;
  font-size: 18px;
  letter-spacing: -0.01em;
}

.sidebar .tagline {
  margin: 0 6px 18px;
  font-size: 12px;
  color: var(--muted);
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar nav a {
  display: block;
  padding: 7px 10px;
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
}

.sidebar nav a:hover { background: var(--surface-2); }
.sidebar nav a.active {
  background: var(--accent);
  color: var(--accent-on);
  font-weight: 600;
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
}

.topbar {
  padding: 18px 28px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.01em;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}
.theme-toggle:hover { background: var(--surface-2); }
.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.content {
  padding: 24px 28px;
  flex: 1;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.demo-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  min-width: 0;
}

.demo-card h3 {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 48px;
}

.demo-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  word-break: break-word;
  transition: background 0.12s, border-color 0.12s;
}

.demo-item:hover {
  background: var(--border);
  border-color: var(--muted);
}

.demo-state {
  margin-top: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
}

.demo-desc {
  color: var(--muted);
  margin: 0 0 16px;
  max-width: 720px;
}

.demo-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

button.btn.reset {
  background: transparent;
  border-color: var(--border);
  color: var(--muted);
}
button.btn.reset:hover {
  background: var(--surface);
  color: var(--text);
  border-color: var(--accent);
}

.handle-grip {
  cursor: grab;
  color: var(--muted);
  font-size: 18px;
  line-height: 1;
  padding: 0 6px;
  user-select: none;
}

button.btn {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  min-height: 36px;
}

button.btn:hover { background: var(--border); }

.kbd {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  background: var(--surface-2);
  color: var(--text);
}

/* === Tablet === */
@media (max-width: 1100px) {
  :root { --sidebar-w: 220px; }
  .content { padding: 20px 22px; }
  .topbar { padding: 16px 22px; }
  .demo-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
}

/* === Mobile === */
@media (max-width: 860px) {
  .app { grid-template-columns: 1fr; }

  .hamburger { display: flex; }

  .scrim { display: block; }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: min(280px, 84vw);
    height: 100vh;
    height: 100dvh;
    transform: translateX(-105%);
    transition: transform 0.22s ease;
    z-index: 50;
    box-shadow: 8px 0 24px rgba(0, 0, 0, 0.4);
    padding: 14px 10px;
  }
  .sidebar.open { transform: translateX(0); }
  .sidebar nav a { font-size: 13.5px; padding: 9px 12px; }
  .sidebar-head .close { display: block; }

  .topbar {
    padding: 10px 14px 10px 60px;
    min-height: 52px;
    display: flex;
    align-items: center;
  }
  .topbar h2 { font-size: 16px; }

  .content {
    padding: 12px 12px 32px;
  }

  .demo-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .demo-desc {
    font-size: 13px;
    margin: 0 0 10px;
  }

  .demo-card {
    padding: 10px;
    border-radius: 8px;
  }

  .demo-card h3 {
    font-size: 11px;
    margin-bottom: 8px;
  }

  .demo-item {
    padding: 8px 10px;
    min-height: 40px;
    font-size: 13px;
    border-radius: 6px;
  }

  .demo-state {
    font-size: 11px;
    padding: 8px 10px;
    border-radius: 8px;
    max-height: 200px;
    overflow: auto;
  }

  button.btn {
    min-height: 38px;
    padding: 8px 14px;
    font-size: 12.5px;
  }

  .kbd { font-size: 10.5px; padding: 1px 5px; }
}

/* === Small phones === */
@media (max-width: 420px) {
  .topbar { padding: 10px 12px 10px 58px; }
  .topbar h2 { font-size: 15px; }
  .content { padding: 10px 10px 28px; }
  .demo-card { padding: 8px; }
  .demo-item { padding: 7px 9px; font-size: 12.5px; min-height: 38px; }
  .demo-desc { font-size: 12.5px; line-height: 1.45; }
  .demo-state { font-size: 10.5px; padding: 8px; }
}
</style>
