import { mathNative } from '../src/native/index';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const nStr = req.query.n as string;
  if (!nStr) {
    return res.status(400).json({ error: 'n is required' });
  }

  const n = parseInt(nStr, 10);

  if (isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'n must be a non-negative integer' });
  }

  const { result, backend } = mathNative.heavyCompute(n);

  res.status(200).json({ 
    input: n, 
    result: result, 
    backend 
  });
}