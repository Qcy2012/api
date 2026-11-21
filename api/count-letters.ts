// POST /api/count-letters - C++ letter count (demonstrates string passing via memory)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { text } = req.body || {};
  if (typeof text !== 'string') return res.status(400).json({ error: 'body.text must be a string' });
  const start = process.hrtime.bigint();
  const result = mathNative.countLetters(text);
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  res.status(200).json({ textLength: text.length, letterCount: result, elapsed_ms: elapsed, backend: mathNative.backend });
}
