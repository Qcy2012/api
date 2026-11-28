import express from 'express';
import { mathNative } from './native';

const app = express();

app.get('/api/compute', (req, res) => {
  const n = parseInt(req.query.n as string, 10);
  if (isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'n must be a non-negative integer' });
  }
  const { result, backend } = mathNative.heavyCompute(n);
  res.json({ input: n, result: result.toString(), backend });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local Express server running on http://localhost:${PORT}`);
});