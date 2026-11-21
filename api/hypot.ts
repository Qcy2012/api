import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  await mathNative.init();
  const a = parseFloat(req.query.a as string);
  const b = parseFloat(req.query.b as string);
  if (isNaN(a) || isNaN(b)) {
    res.status(400).json({ error: 'Parameters a and b must be numbers' });
    return;
  }
  const start = Date.now();
  const result = mathNative.hypot(a, b);
  const elapsed = Date.now() - start;
  res.status(200).json({
    a, b, result: Number(result.toFixed(10)),
    backend: mathNative.getBackend(),
    elapsedMs: elapsed
  });
}
