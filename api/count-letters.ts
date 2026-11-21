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
  const body = req.body as { text?: string } | undefined;
  const text = typeof body?.text === 'string' ? body!.text : '';
  if (text.length === 0) {
    return res.status(400).json({ error: 'body.text must be a non-empty string.' });
  }
  const start = Date.now();
  const result = mathModule.countLetters(text);
  const ms = Date.now() - start;
  res.status(200).json({ length: text.length, letters: result, backend: mathModule.backend, ms });
}
