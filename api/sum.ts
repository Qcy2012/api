// API路由：调用C++原生模块对数组求和
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST方法' });
  }

  const body = req.body as { numbers?: number[] };
  if (!body?.numbers || !Array.isArray(body.numbers)) {
    return res.status(400).json({
      error: '请求体需包含numbers数组',
      example: { numbers: [1.5, 2.3, 3.7, 4.2] }
    });
  }

  const arr = new Float64Array(body.numbers);
  const start = process.hrtime.bigint();
  const sum = mathNative.sumArray(arr);
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1e6;

  res.status(200).json({
    operation: 'sumArray',
    arrayLength: arr.length,
    sum,
    computedBy: 'C++ N-API native addon',
    durationMs: Math.round(durationMs * 1000) / 1000,
  });
}
