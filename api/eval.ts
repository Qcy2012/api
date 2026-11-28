import { runSandboxedLua } from '../src/native/sandbox';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code (string) is required' });
  }

  // 简单长度限制，防止超大脚本
  if (code.length > 10000) {
    return res.status(400).json({ error: 'code too long (max 10000 chars)' });
  }

  const result = await runSandboxedLua(code);
  res.status(result.ok ? 200 : 400).json(result);
}