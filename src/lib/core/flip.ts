interface Snapshot {
  el: HTMLElement
  rect: DOMRect
}

export function snapshot(elements: HTMLElement[]): Snapshot[] {
  return elements.map((el) => ({ el, rect: el.getBoundingClientRect() }))
}

export function play(prev: Snapshot[], durationMs: number, easing: string = 'cubic-bezier(0.2, 0, 0, 1)') {
  if (durationMs <= 0) return
  for (const { el, rect: oldRect } of prev) {
    if (!el.isConnected) continue
    const newRect = el.getBoundingClientRect()
    const dx = oldRect.left - newRect.left
    const dy = oldRect.top - newRect.top
    if (dx === 0 && dy === 0) continue
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: durationMs, easing, fill: 'none' },
    )
  }
}
