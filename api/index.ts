// API路由：根路径健康检查
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Node.js + TypeScript + C++ API on Vercel',
    version: '1.0.0',
    endpoints: [
      'GET /api/health - 健康检查',
      'GET /api/fibonacci?n=50 - C++斐波那契计算',
      'POST /api/sum - C++数组求和（body: {numbers: number[]}）',
      'GET /api/isprime?n=997 - C++素数判断',
      'GET /api/info - 运行环境信息',
    ],
  });
}
