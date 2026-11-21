import express from 'express';
const addon = require('../build/Release/heavy_calc.node');

const app = express();

app.get('/api/compute/:n', async (req, res) => {
  try {
    const n = parseInt(req.params.n, 10);
    if (isNaN(n) || n < 0) {
      return res.status(400).json({ error: 'n must be a non-negative integer' });
    }

    // 调用 C++ 异步计算，不阻塞事件循环
    const result = await addon.computeAsync(n);
    res.json({ input: n, result });
  } catch (err) {
    res.status(500).json({ error: 'compute failed' });
  }
});

// 一个简单的健康检查，证明服务在计算期间仍可响应
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;