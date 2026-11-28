import { encodeWebP } from '../src/native/webp';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, width, height, quality = 75 } = req.body || {};

  if (!base64 || !width || !height) {
    return res.status(400).json({ error: 'base64, width, height are required' });
  }

  try {
    const rgba = Buffer.from(base64, 'base64');
    const expected = width * height * 4;
    if (rgba.length !== expected) {
      return res.status(400).json({ 
        error: `RGBA data length mismatch: got ${rgba.length}, expected ${expected}` 
      });
    }

    const webpData = encodeWebP(rgba, width, height, quality);
    if (!webpData) {
      return res.status(500).json({ error: 'Encoding failed' });
    }

    res.status(200).json({
      size: webpData.length,
      webpBase64: Buffer.from(webpData).toString('base64'),
      backend: 'wasm'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}