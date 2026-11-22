import express from 'express';
const addon = require('../build/Release/heavy_calc.node');

const app = express();

app.get('/api/compute/:n', async (req, res) => {
  const n = parseInt(req.params.n, 10);
  if (isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'n must be a non-negative integer' });
  }
  const result: bigint = await addon.computeAsync(n);
  res.json({ input: n, result: result.toString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;