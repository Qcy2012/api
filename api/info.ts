// GET /api/info - Runtime info and backend status
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    backend: mathNative.backend,
    wasmSupport: typeof WebAssembly !== 'undefined',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    region: process.env.VERCEL_REGION || null,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
  });
}
