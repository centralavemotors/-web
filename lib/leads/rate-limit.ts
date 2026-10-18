export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, number[]>();
  return function allow(ip: string, now: Date) {
    const time = now.getTime();
    const recent = (hits.get(ip) ?? []).filter((stamp) => time - stamp < windowMs);
    if (recent.length >= limit) {
      hits.set(ip, recent);
      return false;
    }
    recent.push(time);
    hits.set(ip, recent);
    return true;
  };
}
