const SCROLL_EDGE = 48
const MAX_SPEED = 18

let raf = 0
let active: { x: number; y: number } | null = null

function findScrollable(el: HTMLElement | null): HTMLElement | null {
  let cur: HTMLElement | null = el
  while (cur && cur !== document.body) {
    const style = getComputedStyle(cur)
    const overflowY = style.overflowY
    const overflowX = style.overflowX
    const scrolls =
      (overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight
    const scrollsX =
      (overflowX === 'auto' || overflowX === 'scroll') && cur.scrollWidth > cur.clientWidth
    if (scrolls || scrollsX) return cur
    cur = cur.parentElement
  }
  return null
}

function tick() {
  if (!active) return
  const { x, y } = active

  const innerH = window.innerHeight
  const innerW = window.innerWidth
  let dy = 0
  let dx = 0
  if (y < SCROLL_EDGE) dy = -((SCROLL_EDGE - y) / SCROLL_EDGE) * MAX_SPEED
  else if (innerH - y < SCROLL_EDGE) dy = ((SCROLL_EDGE - (innerH - y)) / SCROLL_EDGE) * MAX_SPEED
  if (x < SCROLL_EDGE) dx = -((SCROLL_EDGE - x) / SCROLL_EDGE) * MAX_SPEED
  else if (innerW - x < SCROLL_EDGE) dx = ((SCROLL_EDGE - (innerW - x)) / SCROLL_EDGE) * MAX_SPEED

  if (dy || dx) window.scrollBy(dx, dy)

  const target = document.elementFromPoint(x, y) as HTMLElement | null
  const scroller = findScrollable(target)
  if (scroller) {
    const rect = scroller.getBoundingClientRect()
    let sdx = 0
    let sdy = 0
    if (y - rect.top < SCROLL_EDGE) sdy = -((SCROLL_EDGE - (y - rect.top)) / SCROLL_EDGE) * MAX_SPEED
    else if (rect.bottom - y < SCROLL_EDGE) sdy = ((SCROLL_EDGE - (rect.bottom - y)) / SCROLL_EDGE) * MAX_SPEED
    if (x - rect.left < SCROLL_EDGE) sdx = -((SCROLL_EDGE - (x - rect.left)) / SCROLL_EDGE) * MAX_SPEED
    else if (rect.right - x < SCROLL_EDGE) sdx = ((SCROLL_EDGE - (rect.right - x)) / SCROLL_EDGE) * MAX_SPEED
    if (sdx || sdy) scroller.scrollBy(sdx, sdy)
  }

  raf = requestAnimationFrame(tick)
}

export function startAutoScroll(x: number, y: number) {
  active = { x, y }
  if (!raf) raf = requestAnimationFrame(tick)
}

export function updateAutoScroll(x: number, y: number) {
  if (active) active = { x, y }
}

export function stopAutoScroll() {
  active = null
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
