export function stepFade(current: number, target: number, delta: number, duration: number): number {
  if (duration <= 0) return target;
  const step = Math.max(delta, 0) / duration;
  if (current < target) return Math.min(current + step, target);
  return Math.max(current - step, target);
}
