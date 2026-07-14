import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChangePayload, DragEndEvent, SelectionChangeEvent } from '../src'
import {
  fireKey,
  firePointer,
  flush,
  installDomShims,
  makeListHarness,
  resetSurfaces,
} from './helpers'
import type { Harness } from './helpers'

const cleanups: Array<() => void> = []

function track(h: Harness): Harness {
  cleanups.push(h.destroy)
  return h
}

beforeEach(() => {
  installDomShims()
})

afterEach(() => {
  // End any drag a failed test left behind, then tear down DOM state.
  firePointer(document, 'pointerup', 0, 0)
  while (cleanups.length) cleanups.pop()!()
  resetSurfaces()
  document.body.innerHTML = ''
})

/** pointerdown on item `index`, then move through `points`, then drop. */
function drag(h: Harness, index: number, points: Array<[number, number]>, drop = true): void {
  const el = h.itemEl(index)
  const rect = el.getBoundingClientRect()
  firePointer(el, 'pointerdown', rect.left + 10, rect.top + 10)
  for (const [x, y] of points) firePointer(document, 'pointermove', x, y)
  if (drop) {
    const last = points[points.length - 1]
    firePointer(document, 'pointerup', last[0], last[1])
  }
}

describe('DndList — pointer dragging', () => {
  it('reorders within a list and reports events', () => {
    const changes: ChangePayload<string>[] = []
    let end: DragEndEvent<string> | null = null
    const h = track(
      makeListHarness(['A', 'B', 'C'], {
        onChange: (c) => changes.push(c),
        onEnd: (e) => (end = e),
      }),
    )

    drag(h, 0, [
      [50, 30],
      [50, 110],
    ])

    expect(h.items()).toEqual(['B', 'C', 'A'])
    expect(changes).toEqual([{ moved: { item: 'A', oldIndex: 0, newIndex: 2 } }])
    expect(end).not.toBeNull()
    expect(end!.oldIndex).toBe(0)
    expect(end!.newIndex).toBe(2)
    expect(end!.cancelled).toBe(false)
    expect(end!.pullMode).toBe(true)
  })

  it('does not reorder when sort is false', () => {
    const h = track(makeListHarness(['A', 'B', 'C'], { sort: false }))
    drag(h, 0, [
      [50, 30],
      [50, 110],
    ])
    expect(h.items()).toEqual(['A', 'B', 'C'])
  })

  it('does not start a drag before the threshold', () => {
    const h = track(makeListHarness(['A', 'B', 'C']))
    const started = vi.fn()
    h.list.setOptions({ animation: 0, onStart: started })
    const el = h.itemEl(0)
    firePointer(el, 'pointerdown', 10, 10)
    firePointer(document, 'pointermove', 12, 11)
    firePointer(document, 'pointerup', 12, 11)
    expect(started).not.toHaveBeenCalled()
    expect(h.items()).toEqual(['A', 'B', 'C'])
  })

  it('moves an item between lists sharing a group', () => {
    const removed = vi.fn()
    const added = vi.fn()
    let end: DragEndEvent<string> | null = null
    const a = track(
      makeListHarness(
        ['A1', 'A2'],
        { group: 'g', onRemove: removed, onEnd: (e) => (end = e) },
        { left: 0 },
      ),
    )
    const b = track(makeListHarness(['B1', 'B2'], { group: 'g', onAdd: added }, { left: 200 }))

    drag(a, 0, [
      [50, 30],
      [250, 10],
    ])

    expect(a.items()).toEqual(['A2'])
    expect(b.items()).toEqual(['A1', 'B1', 'B2'])
    expect(removed).toHaveBeenCalledWith({ item: 'A1', oldIndex: 0 })
    expect(added).toHaveBeenCalledWith({ item: 'A1', newIndex: 0 })
    expect(end!.toEl).toBe(b.container)
    expect(end!.newIndex).toBe(0)
  })

  it('keeps lists isolated when group names differ', () => {
    const a = track(makeListHarness(['A1', 'A2'], { group: 'left' }, { left: 0 }))
    const b = track(makeListHarness(['B1'], { group: 'right' }, { left: 200 }))

    drag(a, 0, [
      [50, 30],
      [250, 10],
    ])

    expect(a.items()).toEqual(['A1', 'A2'])
    expect(b.items()).toEqual(['B1'])
  })

  it('keeps lists isolated when no group is set', () => {
    const a = track(makeListHarness(['A1'], {}, { left: 0 }))
    const b = track(makeListHarness(['B1'], {}, { left: 200 }))

    drag(a, 0, [
      [50, 30],
      [250, 10],
    ])

    expect(a.items()).toEqual(['A1'])
    expect(b.items()).toEqual(['B1'])
  })

  it('respects put: false on the target list', () => {
    const a = track(makeListHarness(['A1', 'A2'], { group: 'g' }, { left: 0 }))
    const b = track(makeListHarness(['B1'], { group: { name: 'g', put: false } }, { left: 200 }))

    drag(a, 0, [
      [50, 30],
      [250, 10],
    ])

    expect(a.items()).toEqual(['A1', 'A2'])
    expect(b.items()).toEqual(['B1'])
  })

  it('clones with pull: "clone" and reports pullMode', () => {
    let end: DragEndEvent<string> | null = null
    const a = track(
      makeListHarness(
        ['A1', 'A2'],
        { group: { name: 'g', pull: 'clone' }, onEnd: (e) => (end = e) },
        { left: 0 },
      ),
    )
    const b = track(makeListHarness(['B1'], { group: 'g' }, { left: 200 }))

    drag(a, 0, [
      [50, 30],
      [250, 10],
    ])

    expect(a.items()).toEqual(['A1', 'A2'])
    expect(b.items()).toEqual(['A1', 'B1'])
    expect(end!.pullMode).toBe('clone')
  })

  it('swaps items in swap mode', () => {
    const h = track(makeListHarness(['A', 'B', 'C'], { swap: true }))
    drag(h, 0, [
      [50, 30],
      [50, 100],
    ])
    expect(h.items()).toEqual(['C', 'B', 'A'])
  })

  it('drags a multi-drag selection as one batch', () => {
    const h = track(makeListHarness(['A', 'B', 'C', 'D'], { multiDrag: true }))
    h.list.select([0, 2])

    drag(h, 0, [
      [50, 30],
      [50, 150],
    ])

    expect(h.items()).toEqual(['B', 'D', 'A', 'C'])
    // Selection clears after a multi-drag drop.
    expect(h.list.getSelection()).toEqual([])
  })

  it('restores order when the drag is cancelled with Escape', async () => {
    let end: DragEndEvent<string> | null = null
    const h = track(makeListHarness(['A', 'B', 'C'], { onEnd: (e) => (end = e) }))

    drag(
      h,
      0,
      [
        [50, 30],
        [50, 110],
      ],
      false,
    )
    expect(h.items()).toEqual(['B', 'C', 'A'])

    fireKey(document, 'Escape')
    await flush()

    expect(h.items()).toEqual(['A', 'B', 'C'])
    expect(end!.cancelled).toBe(true)
  })
})

describe('DndList — keyboard reordering', () => {
  it('grabs with Space, moves with arrows, drops with Space', () => {
    const kbMoves: Array<{ oldIndex: number; newIndex: number }> = []
    const h = track(
      makeListHarness(['A', 'B', 'C'], {
        keyboard: true,
        onKeyboardMove: (e) => kbMoves.push({ oldIndex: e.oldIndex, newIndex: e.newIndex }),
      }),
    )

    fireKey(h.itemEl(0), ' ')
    fireKey(h.itemEl(0), 'ArrowDown')
    expect(h.items()).toEqual(['B', 'A', 'C'])
    fireKey(h.itemEl(1), ' ')

    expect(kbMoves).toEqual([{ oldIndex: 0, newIndex: 1 }])
    expect(h.list.keyboardIndex).toBeNull()
  })

  it('announces to the shared live region', () => {
    const h = track(makeListHarness(['A', 'B'], { keyboard: true, ariaLabel: 'Todos' }))
    fireKey(h.itemEl(0), ' ')
    const live = document.querySelector('.dnd-live')
    expect(live?.textContent).toContain('Picked up item 1 of 2 in Todos')
  })

  it('restores order on Escape', () => {
    const h = track(makeListHarness(['A', 'B', 'C'], { keyboard: true }))
    fireKey(h.itemEl(0), ' ')
    fireKey(h.itemEl(0), 'ArrowDown')
    expect(h.items()).toEqual(['B', 'A', 'C'])
    fireKey(h.itemEl(1), 'Escape')
    expect(h.items()).toEqual(['A', 'B', 'C'])
    expect(h.list.keyboardIndex).toBeNull()
  })
})

describe('DndList — selection & programmatic API', () => {
  it('select / getSelection / clearSelection round-trip', () => {
    const events: SelectionChangeEvent<string>[] = []
    const h = track(
      makeListHarness(['A', 'B', 'C'], {
        multiDrag: true,
        onSelectionChange: (e) => events.push(e),
      }),
    )

    h.list.select([2, 0, 99])
    expect(h.list.getSelection()).toEqual([0, 2])
    expect(h.list.isSelected(2)).toBe(true)
    expect(events[events.length - 1]).toEqual({ items: ['A', 'C'], indices: [0, 2] })

    h.list.clearSelection()
    expect(h.list.getSelection()).toEqual([])
  })

  it('toggles selection with modifier-click', () => {
    const h = track(makeListHarness(['A', 'B'], { multiDrag: true }))
    const el = h.itemEl(1)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true, detail: 1 }))
    expect(h.list.getSelection()).toEqual([1])
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true, detail: 1 }))
    expect(h.list.getSelection()).toEqual([])
  })

  it('move / insertAt / removeAt update the data and fire events', () => {
    const changes: ChangePayload<string>[] = []
    const h = track(makeListHarness(['A', 'B', 'C'], { onChange: (c) => changes.push(c) }))

    h.list.move(0, 2)
    expect(h.items()).toEqual(['B', 'C', 'A'])

    h.list.insertAt(1, 'X')
    expect(h.items()).toEqual(['B', 'X', 'C', 'A'])

    const removed = h.list.removeAt(1)
    expect(removed).toBe('X')
    expect(h.items()).toEqual(['B', 'C', 'A'])

    expect(changes).toEqual([
      { moved: { item: 'A', oldIndex: 0, newIndex: 2 } },
      { added: { item: 'X', newIndex: 1 } },
      { removed: { item: 'X', oldIndex: 1 } },
    ])
  })

  it('ignores drags when disabled', () => {
    const h = track(makeListHarness(['A', 'B'], { disabled: true }))
    drag(h, 0, [
      [50, 30],
      [50, 70],
    ])
    expect(h.items()).toEqual(['A', 'B'])
  })

  it('only starts drags from the handle when set', () => {
    const h = track(makeListHarness(['A', 'B'], { handle: '.grip' }))
    drag(h, 0, [
      [50, 30],
      [50, 70],
    ])
    expect(h.items()).toEqual(['A', 'B'])
  })
})
