import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk, sendError } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendError(res, 405, '仅支持 POST');
  const { text } = req.body as { text?: string };
  if (typeof text !== 'string') return sendError(res, 400, '请求体需为 { text: string }');
  const m = await getMathModule();
  const t0 = Date.now();
  const count = m.countLetters(text);
  sendOk(res, { total: text.length, letters: count, elapsed_ms: Date.now() - t0, backend: m.backend });
}
