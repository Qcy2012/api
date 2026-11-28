import express from 'express';
import { mathNative } from './native';

const app = express();

// 已有的 compute 路由
app.get('/api/compute', (req, res) => {
  const nStr = req.query.n as string;
  
  if (!nStr) {
    return res.status(400).json({ error: 'n is required' });
  }

  try {
    const { result, backend } = mathNative.heavyCompute(nStr);
    // result 已经是字符串了，直接返回即可
    res.json({ input: nStr, result, backend });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input for BigInt conversion' });
  }
});

// 已有的 health 路由
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 已有的 cipher 路由
app.get('/api/cipher', (req, res) => {
  const text = req.query.text as string;
  const shift = parseInt(req.query.shift as string, 10);
  
  if (!text || isNaN(shift)) {
    return res.status(400).json({ error: 'text and shift are required' });
  }

  // 调用新加的 C++ 函数
  const { result, backend } = mathNative.caesarCipher(text, shift);
  res.json({ input: text, shift, result, backend });
});

// 根路由，返回 API 文档
app.get('/', (_req, res) => {
  res.json({
    message: "欢迎使用 C++ (WASM) API 服务",
    endpoints: {
      "GET /api/health": "健康检查接口",
      "GET /api/compute?n={number}": "计算累加和",
      "GET /api/cipher?text={string}&shift={number}": "字符串加密"
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local Express server running on http://localhost:${PORT}`);
});