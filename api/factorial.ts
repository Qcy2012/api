import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathModule } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const n = parseInt(String(req.query.n ?? '5'), 10);
  if (Number.isNaN(n) || n < 0 || n > 20) {
    return res.status(400).json({ error: 'Parameter n must be an integer between 0 and 20.' });
  }
  const start = Date.now();
  const result = mathModule.factorial(n);
  const ms = Date.now() - start;
  res.status(200).json({ n, result, backend: mathModule.backend, ms });
}
