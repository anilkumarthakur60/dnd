import { createSortable } from '@anil-labs/dnd-core'
import type { Sortable, SortableOptions } from '@anil-labs/dnd-core'
import styles from '@anil-labs/dnd-core/styles.css'

export * from '@anil-labs/dnd-core'

const STYLE_ID = 'dnd-list-styles'

function injectStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `${styles}\ndnd-list { display: block; }`
  document.head.appendChild(style)
}

function boolAttr(value: string | null): boolean | undefined {
  if (value === null) return undefined
  return value !== 'false'
}

function numAttr(value: string | null): number | undefined {
  if (value === null) return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

function strAttr(value: string | null): string | undefined {
  return value === null ? undefined : value
}

/**
 * `<dnd-list>` custom element — its element children are the sortable items,
 * reordered in place by the engine.
 *
 * ```html
 * <dnd-list group="tasks" animation="200">
 *   <div>Apple</div>
 *   <div>Banana</div>
 *   <div>Cherry</div>
 * </dnd-list>
 * ```
 *
 * Common options are attributes (`group`, `animation`, `handle`, `filter`,
 * `disabled`, `sort`, `swap`, `axis`, `direction`, `delay`, `multi-drag`,
 * `keyboard`, `list-label`, …); the full config can be assigned via the
 * `options` property. Every engine event is re-dispatched as a DOM
 * CustomEvent: `dnd-start`, `dnd-end`, `dnd-add`, `dnd-remove`, `dnd-update`,
 * `dnd-change`, `dnd-choose`, `dnd-unchoose`, `dnd-select`, `dnd-keyboard`
 * (detail = the engine payload; `item` values are the child elements).
 */
export class DndListElement extends HTMLElement {
  static observedAttributes = [
    'group',
    'animation',
    'easing',
    'handle',
    'filter',
    'item-selector',
    'disabled',
    'sort',
    'swap',
    'swap-threshold',
    'invert-swap',
    'axis',
    'direction',
    'delay',
    'delay-on-touch-only',
    'touch-start-threshold',
    'ghost-class',
    'chosen-class',
    'drag-class',
    'selected-class',
    'empty-insert-threshold',
    'drag-max-items',
    'rtl',
    'multi-drag',
    'keyboard',
    'list-label',
  ]

  private sortableInstance: Sortable | null = null
  private optionsValue: SortableOptions = {}

  /** Extra engine options merged over the attribute-derived config. */
  get options(): SortableOptions {
    return this.optionsValue
  }

  set options(value: SortableOptions) {
    this.optionsValue = value ?? {}
    this.sortableInstance?.setOptions(this.buildOptions())
  }

  /** The underlying sortable (programmatic API via `.sortable.list`). */
  get sortable(): Sortable | null {
    return this.sortableInstance
  }

  connectedCallback(): void {
    injectStyles()
    this.upgradeProperty('options')
    if (!this.sortableInstance) {
      this.sortableInstance = createSortable(this, this.buildOptions())
    }
  }

  disconnectedCallback(): void {
    this.sortableInstance?.destroy()
    this.sortableInstance = null
  }

  attributeChangedCallback(): void {
    this.sortableInstance?.setOptions(this.buildOptions())
  }

  /** Re-scan children after adding/removing items yourself. */
  refresh(): void {
    this.sortableInstance?.refresh()
  }

  private buildOptions(): SortableOptions {
    const attr = (name: string): string | null => this.getAttribute(name)
    const fromAttributes: SortableOptions = {
      group: strAttr(attr('group')),
      animation: numAttr(attr('animation')),
      easing: strAttr(attr('easing')),
      handle: strAttr(attr('handle')),
      filter: strAttr(attr('filter')),
      itemSelector: strAttr(attr('item-selector')),
      disabled: boolAttr(attr('disabled')),
      sort: boolAttr(attr('sort')),
      swap: boolAttr(attr('swap')),
      swapThreshold: numAttr(attr('swap-threshold')),
      invertSwap: boolAttr(attr('invert-swap')),
      axis: (strAttr(attr('axis')) as SortableOptions['axis']) ?? undefined,
      direction: (strAttr(attr('direction')) as SortableOptions['direction']) ?? undefined,
      delay: numAttr(attr('delay')),
      delayOnTouchOnly: boolAttr(attr('delay-on-touch-only')),
      touchStartThreshold: numAttr(attr('touch-start-threshold')),
      ghostClass: strAttr(attr('ghost-class')),
      chosenClass: strAttr(attr('chosen-class')),
      dragClass: strAttr(attr('drag-class')),
      selectedClass: strAttr(attr('selected-class')),
      emptyInsertThreshold: numAttr(attr('empty-insert-threshold')),
      dragMaxItems: numAttr(attr('drag-max-items')),
      rtl: boolAttr(attr('rtl')),
      multiDrag: boolAttr(attr('multi-drag')),
      keyboard: boolAttr(attr('keyboard')),
      ariaLabel: strAttr(attr('list-label')),
    }

    const emit =
      (type: string) =>
      (detail: unknown): void => {
        this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
      }

    return {
      ...fromAttributes,
      ...this.optionsValue,
      onStart: (e) => {
        emit('dnd-start')(e)
        this.optionsValue.onStart?.(e)
      },
      onEnd: (e) => {
        emit('dnd-end')(e)
        this.optionsValue.onEnd?.(e)
      },
      onAdd: (e) => {
        emit('dnd-add')(e)
        this.optionsValue.onAdd?.(e)
      },
      onRemove: (e) => {
        emit('dnd-remove')(e)
        this.optionsValue.onRemove?.(e)
      },
      onUpdate: (e) => {
        emit('dnd-update')(e)
        this.optionsValue.onUpdate?.(e)
      },
      onChange: (e) => {
        emit('dnd-change')(e)
        this.optionsValue.onChange?.(e)
      },
      onChoose: (e) => {
        emit('dnd-choose')(e)
        this.optionsValue.onChoose?.(e)
      },
      onUnchoose: (e) => {
        emit('dnd-unchoose')(e)
        this.optionsValue.onUnchoose?.(e)
      },
      onSelectionChange: (e) => {
        emit('dnd-select')(e)
        this.optionsValue.onSelectionChange?.(e)
      },
      onKeyboardMove: (e) => {
        emit('dnd-keyboard')(e)
        this.optionsValue.onKeyboardMove?.(e)
      },
    }
  }

  /** Handle properties assigned before the element was upgraded. */
  private upgradeProperty(prop: 'options'): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as Record<string, unknown>)[prop]
      delete (this as Record<string, unknown>)[prop]
      ;(this as Record<string, unknown>)[prop] = value
    }
  }
}

/** Register the custom element (no-op if already registered). */
export function register(tag = 'dnd-list'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, DndListElement)
  }
}

register()
