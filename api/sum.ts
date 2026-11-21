import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed, use POST' });
    return;
  }
  await mathNative.init();
  const { numbers } = req.body as { numbers?: number[] };
  if (!Array.isArray(numbers) || numbers.length === 0 || numbers.length > 1000000) {
    res.status(400).json({ error: 'Body must contain a numbers array (1-1,000,000 elements)' });
    return;
  }
  const start = Date.now();
  const result = mathNative.sum(numbers);
  const elapsed = Date.now() - start;
  res.status(200).json({
    count: numbers.length,
    result,
    backend: mathNative.getBackend(),
    elapsedMs: elapsed
  });
}
