import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathModule } from '../src/native/index';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    backend: mathModule.backend,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    wasmSupport: true, // Node 20+ always has WebAssembly
    timestamp: new Date().toISOString()
  });
}
