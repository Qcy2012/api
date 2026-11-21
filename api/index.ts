// api/index.ts — API documentation entry
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Node.js + TypeScript + C++ (WASM) API',
    endpoints: {
      health: 'GET /api/health',
      fibonacci: 'GET /api/fibonacci?n=60',
      sum: 'POST /api/sum  body: { numbers: number[] }',
      isprime: 'GET /api/isprime?n=997',
      factorial: 'GET /api/factorial?n=15',
      hypot: 'GET /api/hypot?a=3&b=4',
      countLetters: 'POST /api/count-letters  body: { text: string }',
      info: 'GET /api/info'
    }
  });
}
