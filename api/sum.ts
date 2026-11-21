import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk, sendError } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendError(res, 405, '仅支持 POST');
  const { numbers } = req.body as { numbers?: number[] };
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return sendError(res, 400, '请求体需为 { numbers: number[] }');
  }
  if (numbers.length > 1_000_000) return sendError(res, 400, '数组长度不能超过 100 万');
  const m = await getMathModule();
  const t0 = Date.now();
  const result = m.sumArray(numbers);
  sendOk(res, { count: numbers.length, result, elapsed_ms: Date.now() - t0, backend: m.backend });
}
