import { DndList } from './list'
import type { DndListOptions } from './types'

export interface SortableOptions extends DndListOptions<HTMLElement> {
  /**
   * CSS selector for which direct children count as items (all element
   * children by default).
   */
  itemSelector?: string
}

export interface Sortable {
  /** The container element. */
  el: HTMLElement
  /** The underlying list controller (programmatic API: `move`, `select`, …). */
  list: DndList<HTMLElement>
  /** Re-scan children and refresh `data-dnd-index` (after manual DOM changes). */
  refresh(): void
  /** Replace the options. */
  setOptions(options: SortableOptions): void
  /** Tear down listeners, observers and registry entries. */
  destroy(): void
}

/**
 * Vanilla-DOM sortable: the container's element children are the items and
 * the engine reorders them in place — no framework required.
 *
 * ```ts
 * import { createSortable } from '@anil-labs/dnd-core'
 * import '@anil-labs/dnd-core/styles.css'
 *
 * createSortable(document.querySelector('#list')!, {
 *   group: 'tasks',
 *   animation: 200,
 *   onEnd: ({ oldIndex, newIndex }) => console.log(oldIndex, '→', newIndex),
 * })
 * ```
 *
 * Items are indexed automatically; call `refresh()` (or rely on the built-in
 * MutationObserver) after adding or removing children yourself.
 */
export function createSortable(el: HTMLElement, options: SortableOptions = {}): Sortable {
  let opts = options
  let selection = new Set<number>()
  let kbIndex: number | null = null

  const itemEls = (): HTMLElement[] => {
    const selector = opts.itemSelector ?? '*'
    return Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && c.matches(selector),
    )
  }

  const reindex = (): void => {
    const els = itemEls()
    els.forEach((item, i) => {
      item.setAttribute('data-dnd-index', String(i))
      item.classList.add('dnd-item')
      if (opts.keyboard) {
        item.tabIndex = 0
        item.setAttribute('role', 'option')
        item.setAttribute('aria-posinset', String(i + 1))
        item.setAttribute('aria-setsize', String(els.length))
        if (kbIndex === i) item.setAttribute('aria-grabbed', 'true')
        else item.removeAttribute('aria-grabbed')
      }
      item.classList.toggle(opts.selectedClass ?? 'dnd-selected', selection.has(i))
      item.classList.toggle('dnd-keyboard-active', kbIndex === i)
    })
  }

  const buildListOptions = (): DndListOptions<HTMLElement> => {
    const { itemSelector: _itemSelector, ...rest } = opts
    return {
      ...rest,
      clone: opts.clone ?? ((node) => node.cloneNode(true) as HTMLElement),
      onSelectionChange: (event) => {
        selection = new Set(event.indices)
        reindex()
        opts.onSelectionChange?.(event)
      },
      onKeyboardStateChange: (index) => {
        kbIndex = index
        reindex()
        opts.onKeyboardStateChange?.(index)
      },
    }
  }

  const list = new DndList<HTMLElement>(el, buildListOptions(), {
    getItems: () => itemEls(),
    apply: (change) => {
      if (change.type === 'move') {
        const els = itemEls()
        const node = els[change.from]
        node.remove()
        const rest = itemEls()
        el.insertBefore(node, rest[change.to] ?? null)
      } else if (change.type === 'insert') {
        el.insertBefore(change.item, itemEls()[change.index] ?? null)
      } else {
        itemEls()[change.index]?.remove()
      }
      reindex()
    },
    afterRender: (fn) => fn(),
  })

  // Keep indices fresh when children are added/removed outside the engine.
  const observer = new MutationObserver(() => reindex())
  observer.observe(el, { childList: true })

  reindex()

  return {
    el,
    list,
    refresh: reindex,
    setOptions(next: SortableOptions) {
      opts = next
      list.setOptions(buildListOptions())
      reindex()
    },
    destroy() {
      observer.disconnect()
      list.destroy()
    },
  }
}
