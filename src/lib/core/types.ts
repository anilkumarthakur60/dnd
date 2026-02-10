export type ItemKeyGetter<T> = keyof T | ((item: T, index: number) => string | number)

export interface DragGroupObject {
  name: string
  pull?: boolean | 'clone' | Array<string> | ((to: GroupContext, from: GroupContext) => boolean | 'clone' | undefined)
  put?: boolean | Array<string> | ((to: GroupContext, from: GroupContext) => boolean | undefined)
  revertClone?: boolean
}

export type DragGroup = string | DragGroupObject

export interface GroupContext {
  name: string
  el: HTMLElement
}

export interface DragStartEvent<T = unknown> {
  item: T
  index: number
  fromList: T[]
  fromEl: HTMLElement
  originalEvent: PointerEvent
}

export interface DragEndEvent<T = unknown> {
  item: T
  oldIndex: number
  newIndex: number
  fromList: T[]
  toList: T[]
  fromEl: HTMLElement
  toEl: HTMLElement
  pullMode: false | 'clone' | true
  cancelled: boolean
  originalEvent: PointerEvent | KeyboardEvent
}

export interface DragMoveEvent<T = unknown> {
  item: T
  fromList: T[]
  toList: T[]
  fromEl: HTMLElement
  toEl: HTMLElement
  oldIndex: number
  newIndex: number
  willInsertAfter: boolean
  originalEvent: PointerEvent
}

export interface DragChangePayload<T = unknown> {
  added?: { element: T; newIndex: number }
  removed?: { element: T; oldIndex: number }
  moved?: { element: T; oldIndex: number; newIndex: number }
}

export type CloneFn<T = unknown> = (original: T) => T

export type PullMode = false | true | 'clone'

export type Axis = 'x' | 'y' | null

export type Direction = 'horizontal' | 'vertical' | 'auto'

export interface GhostFactoryInfo<T = unknown> {
  items: T[]
  sourceEl: HTMLElement
  count: number
}

export type GhostFactory<T = unknown> = (info: GhostFactoryInfo<T>) => HTMLElement

export interface KeyboardMoveEvent<T = unknown> {
  item: T
  oldIndex: number
  newIndex: number
}

export interface ScrollConfig {
  disabled?: boolean
  speed?: number
  sensitivity?: number
}

export interface DraggableExpose<T = unknown> {
  move(from: number, to: number): void
  insertAt(index: number, item: T): void
  removeAt(index: number): T | undefined
  select(indices: number[]): void
  clearSelection(): void
  getSelection(): number[]
}
