import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathModule } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const n = parseInt(String(req.query.n ?? '2'), 10);
  if (Number.isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'Parameter n must be a non-negative integer.' });
  }
  const start = Date.now();
  const result = mathModule.isPrime(n);
  const ms = Date.now() - start;
  res.status(200).json({ n, isPrime: result, backend: mathModule.backend, ms });
}
