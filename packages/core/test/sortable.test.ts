import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSortable } from '../src'
import type { Sortable } from '../src'
import { firePointer, installDomShims, mockRect, registerSurface, resetSurfaces } from './helpers'

let container: HTMLElement
let sortable: Sortable | null = null

function texts(): string[] {
  return Array.from(container.children).map((c) => c.textContent ?? '')
}

beforeEach(() => {
  installDomShims()
  container = document.createElement('div')
  document.body.appendChild(container)
  for (const label of ['A', 'B', 'C']) {
    const child = document.createElement('div')
    child.textContent = label
    container.appendChild(child)
    mockRect(child, () => {
      const i = Array.prototype.indexOf.call(container.children, child)
      return { left: 0, top: i * 40, width: 100, height: 40 }
    })
  }
  mockRect(container, () => ({ left: 0, top: 0, width: 100, height: 120 }))
  registerSurface(container, () => ({ left: 0, top: 0, width: 100, height: 120 }))
})

afterEach(() => {
  firePointer(document, 'pointerup', 0, 0)
  sortable?.destroy()
  sortable = null
  resetSurfaces()
  document.body.innerHTML = ''
})

describe('createSortable (vanilla DOM)', () => {
  it('indexes children and applies the dnd-item class', () => {
    sortable = createSortable(container, { animation: 0 })
    const children = Array.from(container.children) as HTMLElement[]
    expect(children.map((c) => c.dataset.dndIndex)).toEqual(['0', '1', '2'])
    expect(children.every((c) => c.classList.contains('dnd-item'))).toBe(true)
  })

  it('reorders the real DOM on drag', () => {
    sortable = createSortable(container, { animation: 0 })
    const first = container.children[0] as HTMLElement
    firePointer(first, 'pointerdown', 50, 20)
    firePointer(document, 'pointermove', 50, 30)
    firePointer(document, 'pointermove', 50, 110)
    firePointer(document, 'pointerup', 50, 110)

    expect(texts()).toEqual(['B', 'C', 'A'])
    const children = Array.from(container.children) as HTMLElement[]
    expect(children.map((c) => c.dataset.dndIndex)).toEqual(['0', '1', '2'])
  })

  it('exposes the programmatic API via .list', () => {
    sortable = createSortable(container, { animation: 0 })
    sortable.list.move(0, 2)
    expect(texts()).toEqual(['B', 'C', 'A'])
  })

  it('applies keyboard a11y attributes when enabled', () => {
    sortable = createSortable(container, { animation: 0, keyboard: true })
    const first = container.children[0] as HTMLElement
    expect(first.tabIndex).toBe(0)
    expect(first.getAttribute('role')).toBe('option')
    expect(first.getAttribute('aria-setsize')).toBe('3')
  })
})
