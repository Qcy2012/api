import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backend = await mathNative.init();
  res.status(200).json({
    backend,
    wasmSupport: typeof WebAssembly !== 'undefined',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    }
  });
}
