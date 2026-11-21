import type { VercelResponse } from '@vercel/node';

export function sendError(res: VercelResponse, status: number, message: string, detail?: unknown) {
  res.status(status).json({ ok: false, error: message, detail: detail ?? null });
}

export function sendOk<T>(res: VercelResponse, data: T, extra?: Record<string, unknown>) {
  res.status(200).json({ ok: true, ...extra, data });
}

export function parsePositiveInt(v: unknown, max = 1_000_000, fallback = 10): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return fallback;
  return Math.floor(n);
}
