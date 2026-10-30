export type GateCookie = { count: number; day: string; lastShown: number };

export const MAX_PER_DAY = 3;
export const MIN_INTERVAL_MS = 10 * 60 * 1000; // 10 min between gates
export const SKIP_MS = 24 * 60 * 60 * 1000;    // 24h skip after dismiss

export function parseGateCookie(raw: string | undefined): GateCookie | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GateCookie;
  } catch {
    return null;
  }
}

export function canShowGate(
  gate: GateCookie | null,
  skipUntil: number | null
): boolean {
  const now = Date.now();
  if (skipUntil && now < skipUntil) return false;
  if (!gate) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (gate.day !== today) return true;
  if (gate.count >= MAX_PER_DAY) return false;
  if (now - gate.lastShown < MIN_INTERVAL_MS) return false;
  return true;
}