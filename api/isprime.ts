// API路由：调用C++原生模块判断素数
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const nParam = parseInt(req.query.n as string, 10);
  
  if (isNaN(nParam) || nParam < 0 || nParam > 100000000) {
    return res.status(400).json({
      error: '参数n必须是0到100,000,000之间的整数',
      example: '/api/isprime?n=997'
    });
  }

  const start = process.hrtime.bigint();
  const prime = mathNative.isPrime(nParam);
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1e6;

  res.status(200).json({
    operation: 'isPrime',
    input: nParam,
    isPrime: prime,
    computedBy: 'C++ N-API native addon',
    durationMs: Math.round(durationMs * 1000) / 1000,
  });
}
