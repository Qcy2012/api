import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk, sendError, parsePositiveInt } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const n = parsePositiveInt(req.query.n, 1000, 10);
  if (n > 1000) return sendError(res, 400, 'n 必须为 0-1000 的正整数');
  const m = await getMathModule();
  const t0 = Date.now();
  const result = m.fibonacci(n);
  sendOk(res, { n, result, elapsed_ms: Date.now() - t0, backend: m.backend });
}
