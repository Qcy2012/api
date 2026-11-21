// API路由：健康检查
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: `Node.js ${process.version}`,
    platform: process.platform,
    arch: process.arch,
  });
}
