import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk, parsePositiveInt } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const n = parsePositiveInt(req.query.n, 170, 1);
  const m = await getMathModule();
  const t0 = Date.now();
  const result = m.factorial(n);
  sendOk(res, { n, result, elapsed_ms: Date.now() - t0, backend: m.backend });
}
