import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOk } from '../src/utils/response.js';
import { getMathModule } from '../src/native/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const m = await getMathModule();
  sendOk(res, { status: 'ok', backend: m.backend, timestamp: new Date().toISOString() });
}
