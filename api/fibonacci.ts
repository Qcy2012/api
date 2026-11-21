// GET /api/fibonacci?n=50 - C++ Fibonacci calculation
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const n = parseInt(req.query.n as string, 10);
  if (isNaN(n) || n < 0) return res.status(400).json({ error: 'n must be a non-negative integer' });
  if (n > 93) return res.status(400).json({ error: 'n must be <= 93 (fits uint64)' });
  const start = process.hrtime.bigint();
  const result = mathNative.fibonacci(n);
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  res.status(200).json({ n, result, elapsed_ms: elapsed, backend: mathNative.backend });
}
