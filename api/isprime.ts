// GET /api/isprime?n=997 - C++ primality test
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const n = parseInt(req.query.n as string, 10);
  if (isNaN(n)) return res.status(400).json({ error: 'n must be an integer' });
  const start = process.hrtime.bigint();
  const isPrime = mathNative.isPrime(n);
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  res.status(200).json({ n, isPrime, elapsed_ms: elapsed, backend: mathNative.backend });
}
