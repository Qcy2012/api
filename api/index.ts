import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Node.js + WASM C++ API',
    description: 'API built with TypeScript, C++ compiled to WASM, deployed on Vercel',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/api', desc: 'API documentation (this page)' },
      { method: 'GET', path: '/api/health', desc: 'Health check' },
      { method: 'GET', path: '/api/info', desc: 'Runtime info and backend status' },
      { method: 'GET', path: '/api/fibonacci?n=N', desc: 'Compute Fibonacci(N)' },
      { method: 'POST', path: '/api/sum', desc: 'Sum array of numbers', body: { numbers: 'number[]' } },
      { method: 'GET', path: '/api/isprime?n=N', desc: 'Check if N is prime' },
      { method: 'GET', path: '/api/factorial?n=N', desc: 'Compute N!' },
      { method: 'GET', path: '/api/hypot?a=A&b=B', desc: 'Compute sqrt(a^2 + b^2)' },
      { method: 'POST', path: '/api/count-letters', desc: 'Count A-Z letters in text', body: { text: 'string' } }
    ]
  });
}
