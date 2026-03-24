import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { DefineComponent } from 'vue'
import { Draggable } from '../src'
import type { DraggableExpose } from '../src'

const Cmp = Draggable as unknown as DefineComponent<Record<string, unknown>>

interface Item {
  id: number
  n: string
}

beforeEach(() => {
  document.body.innerHTML = ''
  // jsdom doesn't ship Element.prototype.animate
  if (!Element.prototype.animate) {
    Element.prototype.animate = function animateShim() {
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

function mountList(
  initial: Item[] = [
    { id: 1, n: 'A' },
    { id: 2, n: 'B' },
    { id: 3, n: 'C' },
  ],
  extraProps: Record<string, unknown> = {},
  exposed?: { value: DraggableExpose<Item> | null },
) {
  const items = ref(initial)
  const App = defineComponent({
    setup() {
      return () =>
        h(
          Cmp,
          {
            ref: exposed
              ? (r: unknown) => {
                  exposed.value = r as DraggableExpose<Item> | null
                }
              : undefined,
            modelValue: items.value,
            'onUpdate:modelValue': (v: Item[]) => (items.value = v),
            itemKey: 'id',
            animation: 0,
            ...extraProps,
          },
          {
            item: ({ element }: { element: Item }) => h('div', { class: 'row' }, element.n),
          },
        )
    },
  })
  return {
    wrapper: mount(App, {
      attachTo: document.body,
      global: { stubs: { transition: false, 'transition-group': false } },
    }),
    items,
  }
}

function rootEl(wrapper: { element: unknown }): HTMLElement {
  return wrapper.element as HTMLElement
}

describe('Draggable (Vue)', () => {
  it('renders one element per item with data-dnd-index', () => {
    const { wrapper } = mountList()
    const els = rootEl(wrapper).querySelectorAll('[data-dnd-index]')
    expect(els.length).toBe(3)
    expect((els[0] as HTMLElement).dataset.dndIndex).toBe('0')
    expect((els[2] as HTMLElement).dataset.dndIndex).toBe('2')
    expect((els[0] as HTMLElement).classList.contains('dnd-item')).toBe(true)
  })

  it('re-renders when the model changes from outside', async () => {
    const { wrapper, items } = mountList()
    items.value = [...items.value, { id: 4, n: 'D' }]
    await flushPromises()
    expect(rootEl(wrapper).querySelectorAll('[data-dnd-index]').length).toBe(4)
  })

  it('exposes keyboard a11y attributes when keyboard is on', () => {
    const { wrapper } = mountList(
      [
        { id: 1, n: 'A' },
        { id: 2, n: 'B' },
      ],
      { keyboard: true },
    )
    const el = rootEl(wrapper).querySelector('[data-dnd-index="0"]') as HTMLElement
    expect(el.tabIndex).toBe(0)
    expect(el.getAttribute('role')).toBe('option')
    expect(el.getAttribute('aria-setsize')).toBe('2')
  })

  it('reorders via keyboard grab + arrow keys', async () => {
    const { wrapper, items } = mountList(undefined, { keyboard: true })
    const first = rootEl(wrapper).querySelector('[data-dnd-index="0"]') as HTMLElement
    first.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    await flushPromises()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPromises()
    expect(items.value.map((i) => i.n)).toEqual(['B', 'A', 'C'])
  })

  it('renders header and footer slots outside item nodes', () => {
    const items = ref<Item[]>([{ id: 1, n: 'A' }])
    const App = defineComponent({
      setup() {
        return () =>
          h(
            Cmp,
            {
              modelValue: items.value,
              'onUpdate:modelValue': (v: Item[]) => (items.value = v),
              itemKey: 'id',
              animation: 0,
            },
            {
              header: () => h('h1', { id: 'h' }, 'HEAD'),
              footer: () => h('p', { id: 'f' }, 'FOOT'),
              item: ({ element }: { element: Item }) => h('div', element.n),
            },
          )
      },
    })
    const wrapper = mount(App, { attachTo: document.body })
    expect(rootEl(wrapper).querySelector('#h')?.textContent).toBe('HEAD')
    expect(rootEl(wrapper).querySelector('#f')?.textContent).toBe('FOOT')
    const header = rootEl(wrapper).querySelector('#h') as HTMLElement
    expect(header.hasAttribute('data-dnd-index')).toBe(false)
    expect(rootEl(wrapper).querySelectorAll('[data-dnd-index]').length).toBe(1)
  })

  it('programmatic API: move, insertAt, removeAt update v-model', async () => {
    const exposed = { value: null as DraggableExpose<Item> | null }
    const { items } = mountList(undefined, {}, exposed)
    await flushPromises()

    exposed.value!.move(0, 2)
    expect(items.value.map((i) => i.n)).toEqual(['B', 'C', 'A'])

    exposed.value!.insertAt(1, { id: 99, n: 'X' })
    expect(items.value.map((i) => i.n)).toEqual(['B', 'X', 'C', 'A'])

    const removed = exposed.value!.removeAt(1)
    expect(removed?.n).toBe('X')
    expect(items.value.map((i) => i.n)).toEqual(['B', 'C', 'A'])
  })

  it('selection API round-trips', async () => {
    const exposed = { value: null as DraggableExpose<Item> | null }
    mountList(undefined, { multiDrag: true }, exposed)
    await flushPromises()

    exposed.value!.select([0, 2])
    expect(exposed.value!.getSelection()).toEqual([0, 2])
    exposed.value!.clearSelection()
    expect(exposed.value!.getSelection()).toEqual([])
  })

  it('renders a TransitionGroup root when transitionName is set', () => {
    const { wrapper } = mountList(undefined, { transitionName: 'list', tag: 'ul' })
    const root = rootEl(wrapper)
    expect(root.tagName).toBe('UL')
    expect(root.classList.contains('dnd-container')).toBe(true)
    expect(root.querySelectorAll('[data-dnd-index]').length).toBe(3)
  })
})
