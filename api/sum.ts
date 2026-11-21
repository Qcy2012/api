import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathModule } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const body = req.body as { numbers?: number[] } | undefined;
  const numbers = Array.isArray(body?.numbers) ? body!.numbers : [];
  if (numbers.length === 0) {
    return res.status(400).json({ error: 'body.numbers must be a non-empty array of numbers.' });
  }
  const start = Date.now();
  const result = mathModule.sum(numbers);
  const ms = Date.now() - start;
  res.status(200).json({ count: numbers.length, result, backend: mathModule.backend, ms });
}
