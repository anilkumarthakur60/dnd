import { DndList, applyListChange } from '../src'
import type { DndListOptions, ListChange } from '../src'

/** Minimal PointerEvent stand-in — jsdom lacks a full implementation. */
export class TestPointerEvent extends MouseEvent {
  readonly pointerId = 1
  readonly pointerType: string

  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, { bubbles: true, cancelable: true, ...init })
    this.pointerType = init.pointerType ?? 'mouse'
  }
}

export function firePointer(
  target: EventTarget,
  type: string,
  x: number,
  y: number,
  init: MouseEventInit & { pointerType?: string } = {},
): void {
  target.dispatchEvent(new TestPointerEvent(type, { clientX: x, clientY: y, ...init }))
}

export function fireKey(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

export async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Mock an element's layout — jsdom has none. */
export function mockRect(el: Element, box: () => Box): void {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: (): DOMRect => {
      const b = box()
      return {
        x: b.left,
        y: b.top,
        left: b.left,
        top: b.top,
        width: b.width,
        height: b.height,
        right: b.left + b.width,
        bottom: b.top + b.height,
        toJSON: () => ({}),
      }
    },
  })
}

interface Surface {
  el: HTMLElement
  box: () => Box
}

const surfaces: Surface[] = []

/** Register a container for the `document.elementsFromPoint` stub. */
export function registerSurface(el: HTMLElement, box: () => Box): void {
  surfaces.push({ el, box })
}

export function resetSurfaces(): void {
  surfaces.length = 0
}

export function installDomShims(): void {
  if (!Element.prototype.animate) {
    Element.prototype.animate = function animateShim() {
      const anim = {
        cancel() {},
        finish() {},
        play() {},
        pause() {},
        onfinish: null as (() => void) | null,
        oncancel: null as (() => void) | null,
        finished: Promise.resolve(),
      }
      // Let the caller assign `onfinish` first, then complete "instantly".
      queueMicrotask(() => anim.onfinish?.())
      return anim as unknown as Animation
    }
  }

  document.elementsFromPoint = (x: number, y: number): Element[] =>
    surfaces
      .filter(({ box }) => {
        const b = box()
        return x >= b.left && x <= b.left + b.width && y >= b.top && y <= b.top + b.height
      })
      .map(({ el }) => el)

  document.elementFromPoint = (): Element | null => null
}

export interface Harness {
  container: HTMLElement
  list: DndList<string>
  items: () => string[]
  itemEl: (index: number) => HTMLElement
  destroy: () => void
}

export interface HarnessLayout {
  left?: number
  itemHeight?: number
  width?: number
}

/**
 * A data-driven list like a framework binding would create: an array of
 * strings rendered as `<li data-dnd-index>` children, re-rendered from scratch
 * on every applied change (synchronously, so `afterRender` runs inline).
 */
export function makeListHarness(
  initial: string[],
  options: DndListOptions<string> = {},
  layout: HarnessLayout = {},
): Harness {
  const left = layout.left ?? 0
  const itemHeight = layout.itemHeight ?? 40
  const width = layout.width ?? 100

  const container = document.createElement('ul')
  document.body.appendChild(container)

  let items = [...initial]

  const render = (): void => {
    container.innerHTML = ''
    items.forEach((label, i) => {
      const li = document.createElement('li')
      li.dataset.dndIndex = String(i)
      li.className = 'dnd-item'
      li.tabIndex = 0
      li.textContent = label
      mockRect(li, () => ({ left, top: i * itemHeight, width, height: itemHeight }))
      container.appendChild(li)
    })
  }

  const containerBox = (): Box => ({
    left,
    top: 0,
    width,
    height: Math.max(items.length * itemHeight, itemHeight),
  })
  mockRect(container, containerBox)
  registerSurface(container, containerBox)

  render()

  const list = new DndList<string>(
    container,
    { animation: 0, ...options },
    {
      getItems: () => items,
      apply: (change: ListChange<string>) => {
        items = applyListChange(items, change)
        render()
      },
      afterRender: (fn) => fn(),
    },
  )

  return {
    container,
    list,
    items: () => items,
    itemEl: (index: number) => container.querySelector<HTMLElement>(`[data-dnd-index="${index}"]`)!,
    destroy: () => {
      list.destroy()
      container.remove()
    },
  }
}
