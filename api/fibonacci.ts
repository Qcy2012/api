// API路由：调用C++原生模块计算斐波那契数列
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const nParam = parseInt(req.query.n as string, 10);
  
  if (isNaN(nParam) || nParam < 0 || nParam > 1000000) {
    return res.status(400).json({
      error: '参数n必须是0到1,000,000之间的整数',
      example: '/api/fibonacci?n=50'
    });
  }

  const start = process.hrtime.bigint();
  const result = mathNative.fibonacci(nParam);
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1e6;

  res.status(200).json({
    operation: 'fibonacci',
    input: nParam,
    result,
    computedBy: 'C++ N-API native addon',
    durationMs: Math.round(durationMs * 1000) / 1000,
  });
}
