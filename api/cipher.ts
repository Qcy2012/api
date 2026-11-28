import { mathNative } from '../src/native/index';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const text = req.query.text as string;
  const shift = parseInt(req.query.shift as string, 10);

  if (!text || isNaN(shift)) {
    return res.status(400).json({ error: 'text and shift are required' });
  }

  const { result, backend } = mathNative.caesarCipher(text, shift);

  res.status(200).json({
    input: text,
    shift,
    result,
    backend
  });
}