import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Node + TS + C++(WASM) API on Vercel',
    version: '1.0.0',
    note: 'NO node-gyp needed, NO Visual Studio needed',
    endpoints: {
      'GET  /api/health': '健康检查',
      'GET  /api/fibonacci?n=50': 'C++/WASM 斐波那契',
      'POST /api/sum': 'C++/WASM 数组求和 body={numbers:[...]}',
      'GET  /api/isprime?n=997': 'C++/WASM 素数判定',
      'GET  /api/factorial?n=15': 'C++/WASM 阶乘',
      'GET  /api/hypot?a=3&b=4': 'C++/WASM 勾股定理',
      'POST /api/count-letters': 'C++/WASM 字母计数 body={text:"..."}',
      'GET  /api/info': '运行时后端信息',
    }
  });
}
