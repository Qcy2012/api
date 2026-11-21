// C++原生模块加载封装
// 在Vercel Serverless环境中，node-gyp会在install阶段编译生成build/Release/math_addon.node
import path from 'path';
import { createRequire } from 'module';

// 兼容CommonJS和ESM环境加载.node二进制模块
const require = createRequire(import.meta.url);

// 加载编译后的C++ addon，binding文件通过node-gyp-build自动定位
// 需要安装 node-gyp-build 包来处理跨平台路径
let addon: any;
try {
  addon = require('node-gyp-build')(path.resolve(__dirname, '..'));
} catch (e) {
  // Fallback: 直接加载（本地开发时可能的路径）
  try {
    addon = require('../build/Release/math_addon.node');
  } catch (e2) {
    console.warn('Native addon not loaded, using JS fallback. Run "npm run rebuild" first.');
    // JS fallback实现，保证即使C++编译失败也能运行（开发阶段降级）
    addon = {
      fibonacci(n: number): number {
        if (n <= 1) return n;
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
        return b;
      },
      sumArray(arr: Float64Array): number {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) sum += arr[i];
        return sum;
      },
      isPrime(n: number): boolean {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        for (let i = 3; i <= Math.sqrt(n); i += 2) { if (n % i === 0) return false; }
        return true;
      }
    };
  }
}

export const mathNative = {
  fibonacci: addon.fibonacci as (n: number) => number,
  sumArray: addon.sumArray as (arr: Float64Array) => number,
  isPrime: addon.isPrime as (n: number) => boolean,
};
