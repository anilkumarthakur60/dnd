interface Config {
  disabled: boolean
  sensitivity: number
  speed: number
}

const DEFAULTS: Config = { disabled: false, sensitivity: 48, speed: 18 }

let raf = 0
let active: { x: number; y: number } | null = null
let cfg: Config = { ...DEFAULTS }

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

function tick(): void {
  if (!active) return
  if (cfg.disabled) {
    raf = requestAnimationFrame(tick)
    return
  }
  const { x, y } = active
  const edge = cfg.sensitivity
  const max = cfg.speed
  const innerH = window.innerHeight
  const innerW = window.innerWidth
  let dy = 0
  let dx = 0
  if (y < edge) dy = -((edge - y) / edge) * max
  else if (innerH - y < edge) dy = ((edge - (innerH - y)) / edge) * max
  if (x < edge) dx = -((edge - x) / edge) * max
  else if (innerW - x < edge) dx = ((edge - (innerW - x)) / edge) * max

  if (dy || dx) window.scrollBy(dx, dy)

  const target = document.elementFromPoint(x, y) as HTMLElement | null
  const scroller = findScrollable(target)
  if (scroller) {
    const rect = scroller.getBoundingClientRect()
    let sdx = 0
    let sdy = 0
    if (y - rect.top < edge) sdy = -((edge - (y - rect.top)) / edge) * max
    else if (rect.bottom - y < edge) sdy = ((edge - (rect.bottom - y)) / edge) * max
    if (x - rect.left < edge) sdx = -((edge - (x - rect.left)) / edge) * max
    else if (rect.right - x < edge) sdx = ((edge - (rect.right - x)) / edge) * max
    if (sdx || sdy) scroller.scrollBy(sdx, sdy)
  }

  raf = requestAnimationFrame(tick)
}

export function startAutoScroll(x: number, y: number, config?: Partial<Config>): void {
  cfg = { ...DEFAULTS, ...config }
  active = { x, y }
  if (!raf) raf = requestAnimationFrame(tick)
}

export function updateAutoScroll(x: number, y: number): void {
  if (active) active = { x, y }
}

export function stopAutoScroll(): void {
  active = null
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
