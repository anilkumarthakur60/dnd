import '@anil-labs/dnd-element'
import './style.css'

const status = document.querySelector<HTMLElement>('#status')!

document.addEventListener('dnd-end', (event) => {
  const { oldIndex, newIndex, cancelled } = (
    event as CustomEvent<{ oldIndex: number; newIndex: number; cancelled: boolean }>
  ).detail
  status.textContent = cancelled ? 'Drag cancelled.' : `Dropped: index ${oldIndex} → ${newIndex}.`
})
