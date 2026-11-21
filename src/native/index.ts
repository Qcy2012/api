// ============================================================
// WASM 加载器 + JS fallback
// - 如果 wasm/math.wasm 存在则用 C++ 编译的 wasm 模块（高性能）
// - 如果 .wasm 不存在则自动降级到纯 JS 实现（保证可直接 npm start）
// - 完全不依赖 node-gyp，不需要任何本地 C++ 编译器
// ============================================================

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM_PATH = join(__dirname, '../../wasm/math.wasm');

// ---------- 导出的 TS 类型 ----------
export interface MathModule {
  fibonacci(n: number): number;
  sumArray(arr: number[]): number;
  isPrime(n: number): boolean;
  countLetters(s: string): number;
  calcHypot(a: number, b: number): number;
  factorial(n: number): number;
  readonly backend: 'wasm' | 'js';
}

// ---------- JS fallback 实现（和 C++ 行为一致）----------
const jsImpl: MathModule = {
  backend: 'js',
  fibonacci(n) {
    if (n <= 1) return n;
    let a = 0n, b = 1n;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return Number(b);
  },
  sumArray(arr) { return arr.reduce((s, v) => s + v, 0); },
  isPrime(n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6)
      if (n % i === 0 || n % (i + 2) === 0) return false;
    return true;
  },
  countLetters(s) {
    let cnt = 0;
    for (const ch of s) {
      const code = ch.charCodeAt(0);
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) cnt++;
    }
    return cnt;
  },
  calcHypot(a, b) { return Math.hypot(a, b); },
  factorial(n) {
    let r = 1n;
    for (let i = 2n; i <= BigInt(n); i++) r *= i;
    return Number(r);
  }
};

// ---------- WASM 实例包装（含内存读写辅助）----------
interface WasmExports {
  memory: WebAssembly.Memory;
  fibonacci(n: number): bigint;
  sum_array(ptr: number, len: number): bigint;
  is_prime(n: number): number;
  count_letters(ptr: number, len: number): number;
  calc_hypot(a: number, b: number): number;
  factorial(n: number): bigint;
  malloc(size: number): number;
  free(ptr: number): void;
}

let wasmModule: MathModule | null = null;

async function loadWasm(): Promise<MathModule | null> {
  try {
    const buf = await readFile(WASM_PATH);
    const imports: WebAssembly.Imports = {
      env: {
        // emscripten 风格：提供简单的 malloc/free（若 wasm 需要）
        memory: new WebAssembly.Memory({ initial: 256 }),
      }
    };
    const { instance } = await WebAssembly.instantiate(buf, imports);
    const e = instance.exports as unknown as WasmExports;

    // 内存辅助：将 JS 字符串写入 wasm memory
    const writeString = (s: string): [number, number] => {
      const bytes = new TextEncoder().encode(s);
      const ptr = e.malloc(bytes.length);
      const view = new Uint8Array(e.memory.buffer, ptr, bytes.length);
      view.set(bytes);
      return [ptr, bytes.length];
    };

    // 将 JS number[] 写入 wasm memory（int32 数组）
    const writeI32Array = (arr: number[]): [number, number] => {
      const ptr = e.malloc(arr.length * 4);
      const view = new Int32Array(e.memory.buffer, ptr, arr.length);
      view.set(arr);
      return [ptr, arr.length];
    };

    return {
      backend: 'wasm',
      fibonacci: (n) => Number(e.fibonacci(n)),
      sumArray: (arr) => {
        const [ptr, len] = writeI32Array(arr);
        const result = Number(e.sum_array(ptr, len));
        e.free(ptr);
        return result;
      },
      isPrime: (n) => e.is_prime(n) === 1,
      countLetters: (s) => {
        const [ptr, len] = writeString(s);
        const result = e.count_letters(ptr, len);
        e.free(ptr);
        return result;
      },
      calcHypot: (a, b) => e.calc_hypot(a, b),
      factorial: (n) => Number(e.factorial(n)),
    };
  } catch (err) {
    // wasm 文件不存在或编译失败，返回 null 走 fallback
    console.warn('[wasm] failed to load, falling back to JS:', (err as Error).message);
    return null;
  }
}

/**
 * 获取数学计算模块实例。
 * 优先使用 C++ 编译的 WASM，文件不存在时自动降级到纯 JS。
 */
export async function getMathModule(): Promise<MathModule> {
  if (wasmModule) return wasmModule;
  wasmModule = (await loadWasm()) ?? jsImpl;
  return wasmModule;
}
