// GET /api - API documentation entry
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Node.js + C++/WASM API',
    description: 'API site running on Vercel, no gyp/VS required',
    endpoints: {
      'GET /api/health': 'Health check',
      'GET /api/fibonacci?n=50': 'C++ Fibonacci (uint64)',
      'POST /api/sum': 'C++ array sum, body: { numbers: number[] }',
      'GET /api/isprime?n=997': 'C++ primality test',
      'GET /api/factorial?n=15': 'C++ factorial',
      'GET /api/hypot?a=3&b=4': 'C++ hypotenuse',
      'POST /api/count-letters': 'C++ letter count, body: { text: string }',
      'GET /api/info': 'Runtime info and backend status'
    }
  });
}
