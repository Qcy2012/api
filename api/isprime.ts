import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk, sendError, parsePositiveInt } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const n = parsePositiveInt(req.query.n, 1_000_000_000, 2);
  const m = await getMathModule();
  const t0 = Date.now();
  const prime = m.isPrime(n);
  sendOk(res, { n, isPrime: prime, elapsed_ms: Date.now() - t0, backend: m.backend });
}
