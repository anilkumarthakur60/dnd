export interface RectSnapshot {
  el: HTMLElement
  rect: DOMRect
}

/** Record the current position of each element (the FLIP "first" step). */
export function captureRects(elements: HTMLElement[]): RectSnapshot[] {
  return elements.map((el) => ({ el, rect: el.getBoundingClientRect() }))
}

/**
 * After a layout change, animate each element from its recorded position to
 * where it is now (the FLIP "invert + play" steps).
 */
export function playFlip(
  prev: RectSnapshot[],
  durationMs: number,
  easing = 'cubic-bezier(0.2, 0, 0, 1)',
): void {
  if (durationMs <= 0) return
  for (const { el, rect: oldRect } of prev) {
    if (!el.isConnected) continue
    const newRect = el.getBoundingClientRect()
    const dx = oldRect.left - newRect.left
    const dy = oldRect.top - newRect.top
    if (dx === 0 && dy === 0) continue
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
      duration: durationMs,
      easing,
      fill: 'none',
    })
  }
}
