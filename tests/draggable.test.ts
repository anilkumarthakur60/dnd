import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { Draggable } from '../src/lib'

beforeEach(() => {
  // jsdom doesn't ship Element.prototype.animate
  if (!Element.prototype.animate) {
    Element.prototype.animate = function () {
      return {
        cancel() {},
        finish() {},
        play() {},
        pause() {},
        onfinish: null,
        oncancel: null,
        finished: Promise.resolve(),
      } as unknown as Animation
    }
  }
})

function mountList(initial = [{ id: 1, n: 'A' }, { id: 2, n: 'B' }, { id: 3, n: 'C' }]) {
  const items = ref(initial)
  const App = defineComponent({
    setup() {
      return () =>
        h(
          Draggable as any,
          {
            modelValue: items.value,
            'onUpdate:modelValue': (v: typeof initial) => (items.value = v),
            itemKey: 'id',
            animation: 0,
          },
          {
            item: ({ element }: { element: { id: number; n: string } }) =>
              h('div', { class: 'row' }, element.n),
          },
        )
    },
  })
  return { wrapper: mount(App, { attachTo: document.body }), items }
}

describe('Draggable', () => {
  it('renders one element per item with data-vue-dnd-index', () => {
    const { wrapper } = mountList()
    const els = wrapper.element.querySelectorAll('[data-vue-dnd-index]')
    expect(els.length).toBe(3)
    expect((els[0] as HTMLElement).dataset.vueDndIndex).toBe('0')
    expect((els[2] as HTMLElement).dataset.vueDndIndex).toBe('2')
  })

  it('emits update:modelValue when items prop changes round-trip', async () => {
    const { wrapper, items } = mountList()
    items.value = [...items.value, { id: 4, n: 'D' }]
    await flushPromises()
    const els = wrapper.element.querySelectorAll('[data-vue-dnd-index]')
    expect(els.length).toBe(4)
  })

  it('exposes keyboard tabindex when keyboard prop is on', async () => {
    const items = ref([{ id: 1, n: 'A' }, { id: 2, n: 'B' }])
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              keyboard: true,
              animation: 0,
            },
            {
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    const wrapper = mount(App, { attachTo: document.body })
    const els = wrapper.element.querySelectorAll('[data-vue-dnd-index]')
    expect((els[0] as HTMLElement).tabIndex).toBe(0)
    expect((els[0] as HTMLElement).getAttribute('role')).toBe('option')
    expect((els[0] as HTMLElement).getAttribute('aria-setsize')).toBe('2')
  })

  it('keyboard arrow keys reorder the list', async () => {
    const items = ref([{ id: 1, n: 'A' }, { id: 2, n: 'B' }, { id: 3, n: 'C' }])
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              keyboard: true,
              animation: 0,
            },
            {
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    const wrapper = mount(App, { attachTo: document.body })
    const firstItem = wrapper.element.querySelector('[data-vue-dnd-index="0"]') as HTMLElement
    firstItem.focus()
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    await flushPromises()
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPromises()
    expect(items.value.map((i) => i.n)).toEqual(['B', 'A', 'C'])
  })

  it('renders header and footer slot content outside item nodes', () => {
    const items = ref([{ id: 1, n: 'A' }])
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              animation: 0,
            },
            {
              header: () => h('h1', { id: 'h' }, 'HEAD'),
              footer: () => h('p', { id: 'f' }, 'FOOT'),
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    const wrapper = mount(App, { attachTo: document.body })
    expect(wrapper.element.querySelector('#h')?.textContent).toBe('HEAD')
    expect(wrapper.element.querySelector('#f')?.textContent).toBe('FOOT')
    const header = wrapper.element.querySelector('#h') as HTMLElement
    expect(header.hasAttribute('data-vue-dnd-index')).toBe(false)
  })

  it('programmatic API: move, insertAt, removeAt update v-model', async () => {
    const items = ref([{ id: 1, n: 'A' }, { id: 2, n: 'B' }, { id: 3, n: 'C' }])
    const exposedRef = ref<{ move: (f: number, t: number) => void; insertAt: (i: number, it: { id: number; n: string }) => void; removeAt: (i: number) => { id: number; n: string } | undefined } | null>(null)
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              ref: (r: unknown) => { exposedRef.value = r as typeof exposedRef.value },
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              animation: 0,
            },
            {
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    mount(App, { attachTo: document.body })
    await flushPromises()
    exposedRef.value!.move(0, 2)
    expect(items.value.map((i) => i.n)).toEqual(['B', 'C', 'A'])
    exposedRef.value!.insertAt(1, { id: 99, n: 'X' })
    expect(items.value.map((i) => i.n)).toEqual(['B', 'X', 'C', 'A'])
    const removed = exposedRef.value!.removeAt(1)
    expect(removed?.n).toBe('X')
    expect(items.value.map((i) => i.n)).toEqual(['B', 'C', 'A'])
  })

  it('selection API round-trips', async () => {
    const items = ref([{ id: 1, n: 'A' }, { id: 2, n: 'B' }, { id: 3, n: 'C' }])
    const exposedRef = ref<{ select: (xs: number[]) => void; getSelection: () => number[]; clearSelection: () => void } | null>(null)
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              ref: (r: unknown) => { exposedRef.value = r as typeof exposedRef.value },
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              multiDrag: true,
              animation: 0,
            },
            {
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    mount(App, { attachTo: document.body })
    await flushPromises()
    exposedRef.value!.select([0, 2])
    expect(exposedRef.value!.getSelection()).toEqual([0, 2])
    exposedRef.value!.clearSelection()
    expect(exposedRef.value!.getSelection()).toEqual([])
  })

  it('does not include header/footer in the items query', () => {
    const items = ref([{ id: 1, n: 'A' }, { id: 2, n: 'B' }])
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Draggable as any,
            {
              modelValue: items.value,
              'onUpdate:modelValue': (v: typeof items.value) => (items.value = v),
              itemKey: 'id',
              animation: 0,
            },
            {
              header: () => h('h1', 'HEAD'),
              footer: () => h('p', 'FOOT'),
              item: ({ element }: { element: { id: number; n: string } }) =>
                h('div', element.n),
            },
          )
      },
    })
    const wrapper = mount(App, { attachTo: document.body })
    const indexed = wrapper.element.querySelectorAll('[data-vue-dnd-index]')
    expect(indexed.length).toBe(2)
  })
})
