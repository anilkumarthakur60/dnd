<script setup lang="ts" generic="T">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type {
  DragGroup,
  DragChangePayload,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
} from './core/types'
import { register, unregister, normalizeGroup } from './core/registry'
import type { RegisteredList, ApplyChange } from './core/registry'
import { beginDrag } from './core/dragController'

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
  }>(),
  {
    sort: true,
    disabled: false,
    animation: 200,
    tag: 'div',
    itemTag: 'div',
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
}>()

const containerRef = ref<HTMLElement | null>(null)
const internal = ref([...props.modelValue]) as Ref<T[]>

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

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || props.disabled || !registered) return
  const found = findItemElement(e.target)
  if (!found) return
  if (!targetMatchesDraggable(found.el)) return
  if (targetMatchesFilter(e.target)) return
  if (!targetInsideHandle(e.target, found.el)) return

  const item = internal.value[found.index]
  const fromEl = containerRef.value!
  const oldIndex = found.index

  emit('choose', { item, index: oldIndex })

  beginDrag({
    source: registered,
    sourceIndex: oldIndex,
    sourceItem: item,
    sourceEl: found.el,
    pointerEvent: e,
    animationMs: props.animation,
    thresholdPx: 5,
    cloneFn: props.clone ? (it) => props.clone!(it as T) : undefined,
    ghostClass: props.ghostClass,
    chosenClass: props.chosenClass,
    dragClass: props.dragClass,
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
    },
  })
}

function resolveKey(item: T, index: number): string | number {
  if (props.itemKey == null) return index
  if (typeof props.itemKey === 'function') return props.itemKey(item, index)
  const v = (item as Record<string, unknown>)[props.itemKey as string]
  return (v as string | number) ?? index
}
</script>

<template>
  <component
    :is="tag"
    ref="containerRef"
    class="vue-dnd-container"
    @pointerdown="onPointerDown"
  >
    <slot name="header" />
    <component
      v-for="(item, index) in internal"
      :is="itemTag"
      :key="resolveKey(item, index)"
      :data-vue-dnd-index="index"
      class="vue-dnd-item"
    >
      <slot name="item" :element="item" :index="index">
        {{ item }}
      </slot>
    </component>
    <slot name="footer" />
  </component>
</template>
