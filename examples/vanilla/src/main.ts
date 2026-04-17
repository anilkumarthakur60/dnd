import { createSortable } from '@anil-labs/dnd-core'
import '@anil-labs/dnd-core/styles.css'
import './style.css'

const status = document.querySelector<HTMLElement>('#status')!

const report = (list: string) => ({
  onEnd: ({
    oldIndex,
    newIndex,
    cancelled,
  }: {
    oldIndex: number
    newIndex: number
    cancelled: boolean
  }) => {
    status.textContent = cancelled
      ? `Drag from “${list}” cancelled.`
      : `Dropped: “${list}” index ${oldIndex} → ${newIndex}.`
  },
})

createSortable(document.querySelector<HTMLElement>('#todo')!, {
  group: 'tasks',
  animation: 200,
  ...report('To do'),
})

createSortable(document.querySelector<HTMLElement>('#done')!, {
  group: 'tasks',
  animation: 200,
  ...report('Done'),
})

createSortable(document.querySelector<HTMLElement>('#keys')!, {
  animation: 200,
  keyboard: true,
  ariaLabel: 'Keyboard demo',
  onKeyboardMove: ({ oldIndex, newIndex }) => {
    status.textContent = `Keyboard move: index ${oldIndex} → ${newIndex}.`
  },
})
