// GET /api/hypot?a=3&b=4 - C++ hypotenuse
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const a = parseFloat(req.query.a as string);
  const b = parseFloat(req.query.b as string);
  if (isNaN(a) || isNaN(b)) return res.status(400).json({ error: 'a and b must be numbers' });
  const start = process.hrtime.bigint();
  const result = mathNative.hypot(a, b);
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  res.status(200).json({ a, b, result, elapsed_ms: elapsed, backend: mathNative.backend });
}
