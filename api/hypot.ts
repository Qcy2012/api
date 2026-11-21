import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk } from '../src/utils/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const a = Number(req.query.a) || 0;
  const b = Number(req.query.b) || 0;
  const m = await getMathModule();
  const result = m.calcHypot(a, b);
  sendOk(res, { a, b, hypot: result, backend: m.backend });
}
