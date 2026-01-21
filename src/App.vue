<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent, type Component } from 'vue'

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

function onHashChange() {
  route.value = location.hash.slice(1) || demos[0].slug
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))

const current = computed(() => demos.find((d) => d.slug === route.value) ?? demos[0])

const currentComponent = computed(() => defineAsyncComponent(current.value.loader))
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <h1>vue-dnd</h1>
      <p class="tagline">Zero-dep Vue 3 drag &amp; drop</p>
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
      </header>
      <section class="content">
        <component :is="currentComponent" />
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --bg: #0e1014;
  --surface: #161a22;
  --surface-2: #1f2530;
  --border: #2a313e;
  --text: #e6e9ef;
  --muted: #8a93a3;
  --accent: #6ea8ff;
  --accent-2: #8effc7;
}

* { box-sizing: border-box; }

html, body, #app {
  margin: 0;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
}

.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
}

.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 20px 14px;
  overflow-y: auto;
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
  padding: 8px 10px;
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
}

.sidebar nav a:hover {
  background: var(--surface-2);
}

.sidebar nav a.active {
  background: var(--accent);
  color: #0b0f17;
  font-weight: 600;
}

.main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  padding: 18px 28px;
  border-bottom: 1px solid var(--border);
}

.topbar h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.01em;
}

.content {
  padding: 24px 28px;
  overflow-y: auto;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 18px;
}

.demo-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
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
}

.demo-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.demo-desc {
  color: var(--muted);
  margin: 0 0 16px;
  max-width: 720px;
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
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
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
</style>
