import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathModule } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const a = parseFloat(String(req.query.a ?? '0'));
  const b = parseFloat(String(req.query.b ?? '0'));
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'Parameters a and b must be numbers.' });
  }
  const start = Date.now();
  const result = mathModule.hypot(a, b);
  const ms = Date.now() - start;
  res.status(200).json({ a, b, result, backend: mathModule.backend, ms });
}
