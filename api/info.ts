// API路由：展示运行环境信息（验证C++模块是否成功加载）
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mathNative } from '../src/native/index.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  // 用一个小测试验证native模块正常工作
  const testFib = mathNative.fibonacci(10);
  const testPrime = mathNative.isPrime(17);
  const testSum = mathNative.sumArray(new Float64Array([1, 2, 3, 4, 5]));

  res.status(200).json({
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      nodeEnv: process.env.NODE_ENV || 'development',
      vercel: process.env.VERCEL === '1' ? 'true' : 'false',
      region: process.env.VERCEL_REGION || 'local',
    },
    nativeModule: {
      loaded: true,
      selfTest: {
        fibonacci_10: testFib,
        isPrime_17: testPrime,
        sum_1to5: testSum,
        expected: { fibonacci_10: 55, isPrime_17: true, sum_1to5: 15 },
        passed: testFib === 55 && testPrime === true && testSum === 15,
      }
    },
    techStack: {
      language: 'TypeScript',
      native: 'C++ via N-API (node-addon-api)',
      runtime: 'Node.js on Vercel Serverless Functions',
      packageManager: 'npm',
    },
  });
}
