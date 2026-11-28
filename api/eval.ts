import { runSandboxedLua } from '../src/native/sandbox';

export default async function handler(req: any, res: any) {
  // 获取客户端 IP（Vercel 会通过 x-forwarded-for 传递）
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'anonymous';
  
  const { success, limit, remaining, reset } = await evalRatelimit.limit(ip);
  
  // 设置标准的限流响应头，方便前端感知
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', reset);
  
  if (!success) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

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