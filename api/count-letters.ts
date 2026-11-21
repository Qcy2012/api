import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed, use POST' });
    return;
  }
  await mathNative.init();
  const { text } = req.body as { text?: string };
  if (typeof text !== 'string' || text.length === 0 || text.length > 100000) {
    res.status(400).json({ error: 'Body must contain a text field (1-100000 chars)' });
    return;
  }
  const start = Date.now();
  const counts = mathNative.countLetters(text);
  const elapsed = Date.now() - start;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const result: Record<string, number> = {};
  for (let i = 0; i < 26; i++) {
    if (counts[i] > 0) result[letters[i]] = counts[i];
  }
  res.status(200).json({
    totalLetters: counts.reduce((a, b) => a + b, 0),
    counts: result,
    backend: mathNative.getBackend(),
    elapsedMs: elapsed
  });
}
