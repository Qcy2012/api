import express from 'express';
import { mathNative } from './native';
import { encodeWebP } from './native/webp'; // 引入刚才写的 webp 模块

const app = express();

// 必须加上这一行，用于解析前端发来的 JSON 数据（POST 请求）
app.use(express.json({ limit: '10mb' })); 

// 根路径：返回 API 文档 HTML
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

// 接口 1：计算累加
app.get('/api/compute', (req, res) => {
  const n = req.query.n as string;
  if (!n) return res.status(400).json({ error: 'n is required' });
  const { result, backend } = mathNative.heavyCompute(n);
  res.json({ input: n, result, backend });
});

// 接口 2：字符串加密
app.get('/api/cipher', (req, res) => {
  const text = req.query.text as string;
  const shift = parseInt(req.query.shift as string, 10);
  if (!text || isNaN(shift)) {
    return res.status(400).json({ error: 'text and shift are required' });
  }
  const { result, backend } = mathNative.caesarCipher(text, shift);
  res.json({ input: text, shift, result, backend });
});

// 接口 3：WebP 编码
app.post('/api/encode', (req, res) => {
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

    // 调用 WASM 进行编码
    const webpData = encodeWebP(rgba, width, height, quality);
    
    if (!webpData) {
      return res.status(500).json({ error: 'Encoding failed' });
    }

    res.json({
      size: webpData.length,
      webpBase64: Buffer.from(webpData).toString('base64'),
      backend: 'wasm'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local Express server running on http://localhost:${PORT}`);
});