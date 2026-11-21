import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  await mathNative.init();
  const n = parseInt(req.query.n as string, 10);
  if (isNaN(n) || n < 0 || n > 2147483647) {
    res.status(400).json({ error: 'Parameter n must be a positive integer' });
    return;
  }
  const start = Date.now();
  const result = mathNative.isPrime(n);
  const elapsed = Date.now() - start;
  res.status(200).json({
    n,
    isPrime: result,
    backend: mathNative.getBackend(),
    elapsedMs: elapsed
  });
}
