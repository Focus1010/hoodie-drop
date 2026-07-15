// Minimal in-memory rate limiter. Good enough for a single-instance MVP
// deploy. Resets on cold start / redeploy. For multi-instance production
// scale, swap this for a Redis-backed limiter (e.g. Upstash).

const hits = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
