const STANDALONE_SPAWN_BASE = 40
const STANDALONE_SPAWN_STEP = 24

/** Canvas spawn offset for standalone links (matches section drag defaults). */
export function standaloneSpawnPosition(index: number): { x: number; y: number } {
  return {
    x: STANDALONE_SPAWN_BASE + index * STANDALONE_SPAWN_STEP,
    y: STANDALONE_SPAWN_BASE + index * STANDALONE_SPAWN_STEP,
  }
}
