/* One shared, lazily-created AudioContext for the whole site (keymap "thock"
   clicks + cave ambience). Browsers cap the number of live AudioContexts, and
   both callers only ever start theirs on a user gesture, so a single shared
   context is both correct and friendlier to that cap. Returns null where the
   Web Audio API is unavailable. */
let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext | null {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = ctx || new AC()
  // reused across gestures — resume if a prior interaction left it suspended
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}
