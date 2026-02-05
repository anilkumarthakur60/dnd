import { toRaw } from 'vue'
import type { Ref } from 'vue'

/**
 * Deep-clones a value. Always goes through JSON to strip Vue reactive Proxies —
 * `structuredClone` can't clone those, and `toRaw` only peels one level.
 * Demo data is plain JSON, so this is sufficient.
 */
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(toRaw(v))) as T
}

/**
 * Captures the initial value of each ref at the moment it's called,
 * and returns a function that restores every ref to its captured value.
 *
 *   const items = ref([...])
 *   const reset = makeReset(items)
 *
 *   const left = ref([...])
 *   const right = ref([...])
 *   const reset = makeReset(left, right)
 */
export function makeReset(...refs: Array<Ref<unknown>>): () => void {
  const snaps = refs.map((r) => clone(r.value))
  return () => {
    refs.forEach((r, i) => {
      r.value = clone(snaps[i])
    })
  }
}
