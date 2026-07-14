import { describe, expect, it } from 'vitest'
import { applyListChange, normalizeGroup } from '../src'

describe('applyListChange', () => {
  const base = ['A', 'B', 'C']

  it('moves an item and returns a new array', () => {
    const next = applyListChange(base, { type: 'move', from: 0, to: 2 })
    expect(next).toEqual(['B', 'C', 'A'])
    expect(base).toEqual(['A', 'B', 'C'])
  })

  it('inserts an item at an index', () => {
    expect(applyListChange(base, { type: 'insert', index: 1, item: 'X' })).toEqual([
      'A',
      'X',
      'B',
      'C',
    ])
  })

  it('removes an item at an index', () => {
    expect(applyListChange(base, { type: 'remove', index: 1 })).toEqual(['A', 'C'])
  })
})

describe('normalizeGroup', () => {
  it('expands a string to a full group object', () => {
    expect(normalizeGroup('tasks')).toEqual({ name: 'tasks', pull: true, put: true })
  })

  it('fills pull/put defaults on partial objects', () => {
    expect(normalizeGroup({ name: 'g', pull: 'clone' })).toEqual({
      name: 'g',
      pull: 'clone',
      put: true,
    })
  })

  it('falls back to a default name when undefined', () => {
    expect(normalizeGroup(undefined).name).toBe('__default__')
  })
})
