// POST /api/sum - C++ array sum
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { numbers } = req.body || {};
  if (!Array.isArray(numbers) || numbers.some(v => typeof v !== 'number')) {
    return res.status(400).json({ error: 'body must contain numbers: number[]' });
  }
  const start = process.hrtime.bigint();
  const result = mathNative.sumArray(numbers);
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  res.status(200).json({ count: numbers.length, result, elapsed_ms: elapsed, backend: mathNative.backend });
}
