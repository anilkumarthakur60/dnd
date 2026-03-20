let region: HTMLElement | null = null

/**
 * Post a message to a shared visually-hidden `aria-live` region (created on
 * first use, one per document). Used by keyboard mode to announce grabs,
 * moves and drops to screen readers.
 */
export function announce(message: string): void {
  if (typeof document === 'undefined') return
  if (!region || !region.isConnected) {
    region = document.createElement('div')
    region.className = 'dnd-live'
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    document.body.appendChild(region)
  }
  region.textContent = ''
  // Force a reflow so successive identical messages are still announced.
  void region.offsetWidth
  region.textContent = message
}
