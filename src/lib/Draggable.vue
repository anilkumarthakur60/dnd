<script setup lang="ts" generic="T">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref } from 'vue'
import type {
  DragGroup,
  DragChangePayload,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  Axis,
  Direction,
  GhostFactory,
  KeyboardMoveEvent,
} from './core/types'
import { register, unregister, normalizeGroup } from './core/registry'
import type { RegisteredList, ApplyChange } from './core/registry'
import { beginDrag, isDragging } from './core/dragController'

const props = withDefaults(
  defineProps<{
    modelValue: T[]
    group?: DragGroup
    sort?: boolean
    disabled?: boolean
    animation?: number
    handle?: string
    filter?: string
    draggable?: string
    tag?: string
    itemTag?: string
    itemKey?: keyof T | ((item: T, index: number) => string | number)
    clone?: (item: T) => T
    ghostClass?: string
    chosenClass?: string
    dragClass?: string
    selectedClass?: string
    /** ms to wait before a drag actually starts. Useful on touch. */
    delay?: number
    /** Apply the delay only for pointerType === 'touch'. */
    delayOnTouchOnly?: boolean
    /** Pixels the pointer may move during the delay before drag is cancelled. */
    touchStartThreshold?: number
    /** Lock dragging to a single axis. */
    axis?: Axis
    /** Direction hint for hit-testing (overrides auto-detection). */
    direction?: Direction
    /** Animation easing (any valid CSS easing). */
    easing?: string
    /** Swap with the hovered item instead of inserting. */
    swap?: boolean
    /** 0..1, how much overlap triggers a swap (default 1). */
    swapThreshold?: number
    /** Invert swap direction. */
    invertSwap?: boolean
    /** Custom ghost element factory. */
    ghostFactory?: GhostFactory<T>
    /** Animate the ghost back to source when dropped outside any list. */
    revertOnSpill?: boolean
    /** Remove the dragged item when dropped outside any list. */
    removeOnSpill?: boolean
    /** Animate the cloned ghost back to source when dropped on the source itself. */
    revertClone?: boolean
    /** Disable the autoscroll loop entirely. */
    scrollDisabled?: boolean
    /** Autoscroll speed (px / frame). */
    scrollSpeed?: number
    /** Distance from edge (px) within which autoscroll engages. */
    scrollSensitivity?: number
    /** Treat the list as a drop target when cursor is within N px of its bounds (empty lists only). */
    emptyInsertThreshold?: number
    /** Call preventDefault on pointerdowns that match the filter selector. */
    preventOnFilter?: boolean
    /** Max number of items that may be multi-dragged together (0 = unlimited). */
    dragMaxItems?: number
    /** Force right-to-left interpretation for horizontal axis. Defaults to container's CSS dir. */
    rtl?: boolean
    /** Enable Ctrl/Cmd-click selection of multiple items, then drag the whole selection. */
    multiDrag?: boolean
    /** Allow keyboard reordering — Space to grab, arrows to move, Enter/Space to drop, Esc to cancel. */
    keyboard?: boolean
    /** Accessible name for the list (used in aria-live announcements). */
    ariaLabel?: string
    /** Vue <transition-group> name; when set, items animate in/out via TransitionGroup. */
    transitionName?: string
  }>(),
  {
    sort: true,
    disabled: false,
    animation: 200,
    tag: 'div',
    itemTag: 'div',
    delay: 0,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    swap: false,
    swapThreshold: 1,
    invertSwap: false,
    revertOnSpill: false,
    removeOnSpill: false,
    revertClone: false,
    direction: 'auto',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    scrollDisabled: false,
    scrollSpeed: 18,
    scrollSensitivity: 48,
    emptyInsertThreshold: 0,
    preventOnFilter: true,
    dragMaxItems: 0,
    multiDrag: false,
    keyboard: false,
    selectedClass: 'vue-dnd-selected',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T[]]
  start: [event: DragStartEvent<T>]
  end: [event: DragEndEvent<T>]
  add: [event: { element: T; newIndex: number }]
  remove: [event: { element: T; oldIndex: number }]
  update: [event: { element: T; oldIndex: number; newIndex: number }]
  move: [event: DragMoveEvent<T>]
  change: [event: DragChangePayload<T>]
  choose: [event: { item: T; index: number }]
  unchoose: [event: { item: T; index: number }]
  'selection-change': [event: { selected: T[]; indices: number[] }]
  'keyboard-move': [event: KeyboardMoveEvent<T>]
}>()

const containerRef = ref<HTMLElement | null>(null)
const liveRef = ref<HTMLElement | null>(null)
const internal = ref([...props.modelValue]) as Ref<T[]>

const selection = ref<Set<number>>(new Set())
const keyboardActiveIndex = ref<number | null>(null)
const keyboardOriginalIndex = ref<number | null>(null)

let suppressNextWatch = false
watch(
  () => props.modelValue,
  (v) => {
    if (suppressNextWatch) {
      suppressNextWatch = false
      return
    }
    internal.value = v.slice()
  },
)

function commit(next: T[]) {
  internal.value = next
  suppressNextWatch = true
  emit('update:modelValue', next)
}

function applyChange(change: ApplyChange) {
  const next = internal.value.slice()
  if (change.type === 'move') {
    const [it] = next.splice(change.from, 1)
    next.splice(change.to, 0, it)
    commit(next)
    emit('update', { element: it, oldIndex: change.from, newIndex: change.to })
    emit('change', { moved: { element: it, oldIndex: change.from, newIndex: change.to } })
  } else if (change.type === 'remove') {
    const it = next[change.index]
    next.splice(change.index, 1)
    commit(next)
    emit('remove', { element: it, oldIndex: change.index })
    emit('change', { removed: { element: it, oldIndex: change.index } })
  } else {
    const it = change.item as T
    next.splice(change.index, 0, it)
    commit(next)
    emit('add', { element: it, newIndex: change.index })
    emit('change', { added: { element: it, newIndex: change.index } })
  }
}

const groupObj = computed(() => normalizeGroup(props.group))

let registered: RegisteredList | null = null

function getItemElements(): HTMLElement[] {
  if (!containerRef.value) return []
  return Array.from(
    containerRef.value.querySelectorAll<HTMLElement>(':scope > [data-vue-dnd-index]'),
  )
}

function isRtl(): boolean {
  if (props.rtl !== undefined) return props.rtl
  if (!containerRef.value) return false
  return getComputedStyle(containerRef.value).direction === 'rtl'
}

onMounted(() => {
  if (!containerRef.value) return
  registered = register({
    el: containerRef.value,
    group: groupObj.value,
    disabled: () => props.disabled,
    getItems: getItemElements,
    listRef: () => internal.value as unknown[],
    applyChange,
    itemAt: (i) => internal.value[i],
    emptyInsertThreshold: () => props.emptyInsertThreshold ?? 0,
    rtl: isRtl,
  })
})

onBeforeUnmount(() => {
  if (registered) unregister(registered)
  registered = null
})

watch(groupObj, (g) => {
  if (registered) registered.group = g
})

function findItemElement(target: EventTarget | null): { el: HTMLElement; index: number } | null {
  if (!(target instanceof Element)) return null
  const closest = target.closest('[data-vue-dnd-index]') as HTMLElement | null
  if (!closest) return null
  if (closest.parentElement !== containerRef.value) return null
  const i = Number(closest.dataset.vueDndIndex)
  if (Number.isNaN(i)) return null
  return { el: closest, index: i }
}

function targetInsideHandle(target: EventTarget | null, itemEl: HTMLElement): boolean {
  if (!props.handle) return true
  if (!(target instanceof Element)) return false
  const handleEl = target.closest(props.handle)
  return !!handleEl && itemEl.contains(handleEl)
}

function targetMatchesFilter(target: EventTarget | null): boolean {
  if (!props.filter) return false
  if (!(target instanceof Element)) return false
  return !!target.closest(props.filter)
}

function targetMatchesDraggable(itemEl: HTMLElement): boolean {
  if (!props.draggable) return true
  return itemEl.matches(props.draggable)
}

function announce(msg: string) {
  if (!liveRef.value) return
  liveRef.value.textContent = ''
  // Reflow so screen readers see the change
  void liveRef.value.offsetWidth
  liveRef.value.textContent = msg
}

function toggleSelection(index: number, additive: boolean) {
  if (!props.multiDrag) return
  const next = new Set(selection.value)
  if (additive) {
    if (next.has(index)) next.delete(index)
    else next.add(index)
  } else {
    if (next.size === 1 && next.has(index)) {
      next.clear()
    } else {
      next.clear()
      next.add(index)
    }
  }
  selection.value = next
  const indices = [...next].sort((a, b) => a - b)
  emit('selection-change', {
    selected: indices.map((i) => internal.value[i]),
    indices,
  })
}

function clearSelection() {
  if (selection.value.size === 0) return
  selection.value = new Set()
  emit('selection-change', { selected: [], indices: [] })
}

function isSelected(index: number) {
  return selection.value.has(index)
}

function buildSourceItems(initialIndex: number): { index: number; item: unknown; el: HTMLElement }[] {
  const els = getItemElements()
  if (props.multiDrag && selection.value.has(initialIndex) && selection.value.size > 1) {
    let indices = [...selection.value].sort((a, b) => a - b)
    if (props.dragMaxItems > 0 && indices.length > props.dragMaxItems) {
      indices = indices.slice(0, props.dragMaxItems)
    }
    return indices.map((i) => ({ index: i, item: internal.value[i] as unknown, el: els[i] }))
  }
  return [{ index: initialIndex, item: internal.value[initialIndex] as unknown, el: els[initialIndex] }]
}

let pendingDelay: { timer: number; cleanup: () => void } | null = null

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || props.disabled || !registered) return
  if (isDragging()) return
  const found = findItemElement(e.target)
  if (!found) return
  if (!targetMatchesDraggable(found.el)) return
  if (targetMatchesFilter(e.target)) {
    if (props.preventOnFilter) e.preventDefault()
    return
  }
  if (!targetInsideHandle(e.target, found.el)) return

  if (props.multiDrag && (e.ctrlKey || e.metaKey || e.shiftKey)) {
    toggleSelection(found.index, true)
    return
  }

  if (props.multiDrag && !selection.value.has(found.index)) {
    clearSelection()
  }

  const useDelay = props.delay > 0 && (!props.delayOnTouchOnly || e.pointerType === 'touch')
  if (useDelay) {
    startDelayedDrag(e, found)
  } else {
    actuallyBeginDrag(e, found)
  }
}

function startDelayedDrag(e: PointerEvent, found: { el: HTMLElement; index: number }) {
  let lastEvent = e
  const startX = e.clientX
  const startY = e.clientY

  const cleanup = () => {
    if (!pendingDelay) return
    clearTimeout(pendingDelay.timer)
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    pendingDelay = null
  }

  const onMove = (ev: PointerEvent) => {
    lastEvent = ev
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > props.touchStartThreshold) {
      cleanup()
    }
  }
  const onUp = () => cleanup()

  document.addEventListener('pointermove', onMove, { passive: false })
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)

  const timer = window.setTimeout(() => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    pendingDelay = null
    actuallyBeginDrag(lastEvent, found)
  }, props.delay)

  pendingDelay = { timer, cleanup }
}

function actuallyBeginDrag(e: PointerEvent, found: { el: HTMLElement; index: number }) {
  if (!registered) return
  const item = internal.value[found.index]
  const fromEl = containerRef.value!
  const oldIndex = found.index
  const sourceItems = buildSourceItems(found.index)

  emit('choose', { item, index: oldIndex })

  beginDrag({
    source: registered,
    sourceItems,
    pointerEvent: e,
    animationMs: props.animation,
    thresholdPx: props.delay > 0 ? 0 : 5,
    axis: props.axis ?? null,
    direction: props.direction,
    easing: props.easing,
    swap: props.swap,
    swapThreshold: props.swapThreshold,
    invertSwap: props.invertSwap,
    revertOnSpill: props.revertOnSpill,
    removeOnSpill: props.removeOnSpill,
    revertClone: props.revertClone,
    cloneFn: props.clone ? (it) => props.clone!(it as T) : undefined,
    ghostFactory: props.ghostFactory as GhostFactory | undefined,
    ghostClass: props.ghostClass,
    chosenClass: props.chosenClass,
    dragClass: props.dragClass,
    scrollConfig: {
      disabled: props.scrollDisabled,
      speed: props.scrollSpeed,
      sensitivity: props.scrollSensitivity,
    },
    onStart: (origEvent) => {
      emit('start', {
        item,
        index: oldIndex,
        fromList: internal.value,
        fromEl,
        originalEvent: origEvent,
      })
    },
    onMove: (info) => {
      emit('move', {
        item,
        fromList: internal.value,
        toList: info.toList.listRef() as T[],
        fromEl,
        toEl: info.toList.el,
        oldIndex,
        newIndex: info.toIndex,
        willInsertAfter: info.willInsertAfter,
        originalEvent: info.pointerEvent,
      })
    },
    onEnd: (info) => {
      emit('unchoose', { item, index: oldIndex })
      const toListItems = (info.toList?.listRef() as T[] | undefined) ?? internal.value
      emit('end', {
        item,
        oldIndex,
        newIndex: info.toIndex,
        fromList: internal.value,
        toList: toListItems,
        fromEl,
        toEl: info.toList?.el ?? fromEl,
        pullMode: info.pullMode,
        cancelled: info.cancelled,
        originalEvent: info.originalEvent,
      })
      if (props.multiDrag) clearSelection()
    },
  })
}

function onItemClick(e: MouseEvent, index: number) {
  if (!props.multiDrag) return
  if (e.detail === 0) return
  if (e.ctrlKey || e.metaKey || e.shiftKey) {
    toggleSelection(index, true)
  }
}

function onItemKeyDown(e: KeyboardEvent, index: number) {
  if (!props.keyboard || props.disabled) return

  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    if (keyboardActiveIndex.value === null) {
      keyboardActiveIndex.value = index
      keyboardOriginalIndex.value = index
      announce(`Picked up item ${index + 1} of ${internal.value.length}${props.ariaLabel ? ` in ${props.ariaLabel}` : ''}. Use arrow keys to move, Enter or Space to drop, Escape to cancel.`)
    } else {
      const from = keyboardOriginalIndex.value ?? index
      const to = keyboardActiveIndex.value
      keyboardActiveIndex.value = null
      keyboardOriginalIndex.value = null
      if (from !== to) {
        emit('keyboard-move', { item: internal.value[to], oldIndex: from, newIndex: to })
      }
      announce(from === to ? 'Drop cancelled, item returned.' : `Dropped at position ${to + 1}.`)
      void nextTick(() => focusItemAt(to))
    }
    return
  }

  if (e.key === 'Escape' && keyboardActiveIndex.value !== null) {
    e.preventDefault()
    const original = keyboardOriginalIndex.value ?? index
    const current = keyboardActiveIndex.value
    if (current !== original) {
      applyChange({ type: 'move', from: current, to: original })
    }
    keyboardActiveIndex.value = null
    keyboardOriginalIndex.value = null
    announce('Drop cancelled, item returned.')
    void nextTick(() => focusItemAt(original))
    return
  }

  if (keyboardActiveIndex.value === null) return

  const cur = keyboardActiveIndex.value
  let target = cur
  const len = internal.value.length
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = Math.max(0, cur - 1)
  else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = Math.min(len - 1, cur + 1)
  else if (e.key === 'Home') target = 0
  else if (e.key === 'End') target = len - 1
  else return

  e.preventDefault()
  if (target !== cur) {
    applyChange({ type: 'move', from: cur, to: target })
    keyboardActiveIndex.value = target
    announce(`Moved to position ${target + 1} of ${len}.`)
    void nextTick(() => focusItemAt(target))
  }
}

function focusItemAt(index: number) {
  const els = getItemElements()
  els[index]?.focus()
}

function resolveKey(item: T, index: number): string | number {
  if (props.itemKey == null) return index
  if (typeof props.itemKey === 'function') return props.itemKey(item, index)
  const v = (item as Record<string, unknown>)[props.itemKey as string]
  return (v as string | number) ?? index
}

function itemClass(index: number) {
  return {
    'vue-dnd-item': true,
    [props.selectedClass]: isSelected(index),
    'vue-dnd-keyboard-active': keyboardActiveIndex.value === index,
  }
}

defineExpose({
  /** Move an item from one index to another (synchronous v-model update). */
  move(from: number, to: number) {
    if (from < 0 || from >= internal.value.length) return
    const bounded = Math.max(0, Math.min(internal.value.length - 1, to))
    if (from === bounded) return
    applyChange({ type: 'move', from, to: bounded })
  },
  /** Insert an item at index (clamped to the list length). */
  insertAt(index: number, item: T) {
    const i = Math.max(0, Math.min(internal.value.length, index))
    applyChange({ type: 'insert', index: i, item })
  },
  /** Remove an item by index; returns the removed item. */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= internal.value.length) return undefined
    const it = internal.value[index]
    applyChange({ type: 'remove', index })
    return it
  },
  /** Set the multi-drag selection by index. */
  select(indices: number[]) {
    const next = new Set<number>()
    for (const i of indices) {
      if (i >= 0 && i < internal.value.length) next.add(i)
    }
    selection.value = next
    const sorted = [...next].sort((a, b) => a - b)
    emit('selection-change', {
      selected: sorted.map((i) => internal.value[i]),
      indices: sorted,
    })
  },
  /** Clear the multi-drag selection. */
  clearSelection,
  /** Read the current multi-drag selection. */
  getSelection(): number[] {
    return [...selection.value].sort((a, b) => a - b)
  },
})
</script>

<template>
  <div class="vue-dnd-wrap">
    <component
      :is="transitionName ? 'TransitionGroup' : tag"
      v-bind="transitionName ? { tag, name: transitionName } : {}"
      ref="containerRef"
      class="vue-dnd-container"
      @pointerdown="onPointerDown"
    >
      <template v-if="!transitionName">
        <slot name="header" />
      </template>
      <component
        v-for="(item, index) in internal"
        :is="itemTag"
        :key="resolveKey(item, index)"
        :data-vue-dnd-index="index"
        :class="itemClass(index)"
        :tabindex="keyboard && !disabled ? 0 : -1"
        :aria-grabbed="keyboard && keyboardActiveIndex === index ? 'true' : undefined"
        :aria-posinset="index + 1"
        :aria-setsize="internal.length"
        :role="keyboard ? 'option' : undefined"
        @click="onItemClick($event, index)"
        @keydown="onItemKeyDown($event, index)"
      >
        <slot name="item" :element="item" :index="index" :selected="isSelected(index)">
          {{ item }}
        </slot>
      </component>
      <template v-if="!transitionName">
        <slot name="footer" />
      </template>
    </component>
    <div
      ref="liveRef"
      class="vue-dnd-live"
      aria-live="polite"
      aria-atomic="true"
    />
  </div>
</template>
