import './style.css'

export { default as Draggable } from './Draggable.vue'
export { useDraggable } from './composables/useDraggable'
export type { UseDraggableOptions, UseDraggableReturn } from './composables/useDraggable'

export type {
  DragGroup,
  DragGroupObject,
  GroupContext,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  DragChangePayload,
  CloneFn,
  PullMode,
  ItemKeyGetter,
  Axis,
  Direction,
  GhostFactory,
  GhostFactoryInfo,
  KeyboardMoveEvent,
  ScrollConfig,
  DraggableExpose,
} from './core/types'

import { default as Draggable } from './Draggable.vue'
import type { App, Plugin } from 'vue'

export const VueDndPlugin: Plugin = {
  install(app: App) {
    app.component('Draggable', Draggable)
  },
}

export default VueDndPlugin
