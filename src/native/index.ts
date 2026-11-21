// Native math module - WASM loader with JS fallback (CommonJS)
// No gyp, no C++ compiler required to run; JS fallback always works.

const fs = require('fs');
const path = require('path');

interface WasmExports {
  fibonacci(n: number): number;
  sum_array(arrPtr: number, len: number): number;
  is_prime(n: number): number;
  factorial(n: number): number;
  calc_hypot(a: number, b: number): number;
  count_letters(ptr: number, len: number): number;
  malloc(size: number): number;
  free(ptr: number): void;
}

interface WasmInstance extends WasmExports {
  memory: { buffer: ArrayBuffer; grow(delta: number): number };
}

interface MathModule {
  backend: 'wasm' | 'js';
  init(): Promise<void>;
  fibonacci(n: number): number | string;
  sumArray(arr: number[]): number;
  isPrime(n: number): boolean;
  factorial(n: number): number;
  hypot(a: number, b: number): number;
  countLetters(s: string): number;
}

// ---- JS fallback (pure JavaScript implementations, identical behavior) ----
const jsImpl = {
  fibonacci(n: number): number | string {
    if (n < 0) return 0;
    if (n > 93) return 'n too large, use BigInt'; // beyond uint64
    let a = 0n, b = 1n;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return Number(b);
  },
  sumArray(arr: number[]): number { return arr.reduce((s, v) => s + v, 0); },
  isPrime(n: number): boolean {
    if (n <= 1) return false; if (n <= 3) return true; if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  },
  factorial(n: number): number {
    if (n < 0) return 0; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  },
  hypot(a: number, b: number): number { return Math.sqrt(a * a + b * b); },
  countLetters(s: string): number { let c = 0; for (const ch of s) if (/[A-Za-z]/.test(ch)) c++; return c; },
};

// ---- WASM loader ----
let wasmInstance: WasmInstance | null = null;
let wasmMemory: WebAssembly.Memory | null = null;

async function loadWasm(): Promise<WasmInstance | null> {
  if (wasmInstance) return wasmInstance;
  try {
    const wasmPath = path.join(__dirname, '../../wasm/math.wasm');
    if (!fs.existsSync(wasmPath)) return null;
    const buf = fs.readFileSync(wasmPath);
    const memory = new WebAssembly.Memory({ initial: 256, maximum: 2048 });
    const imports: WebAssembly.Imports = {
      env: { memory, abort: () => {} },
      wasi_snapshot_preview1: {
        proc_exit: () => {}, fd_write: () => 0,
        environ_sizes_get: () => 0, environ_get: () => 0
      }
    };
    const { instance } = await WebAssembly.instantiate(buf, imports);
    wasmMemory = memory;
    const exports = instance.exports as unknown as WasmExports;
    wasmInstance = Object.assign({}, exports, { memory });
    return wasmInstance;
  } catch (_e) {
    return null;
  }
}

// Helper: copy JS number array into WASM memory (Float64)
function copyArrayToWasm(exports: WasmExports, arr: number[]): { ptr: number; free: () => void } {
  const bytes = arr.length * 8;
  const ptr = exports.malloc(bytes);
  const view = new Float64Array(wasmMemory!.buffer, ptr, arr.length);
  view.set(arr);
  return { ptr, free: () => exports.free(ptr) };
}

// Helper: copy JS string into WASM memory (UTF-8 bytes)
function copyStringToWasm(exports: WasmExports, s: string): { ptr: number; len: number; free: () => void } {
  const buf = Buffer.from(s, 'utf-8');
  const ptr = exports.malloc(buf.length);
  const view = new Uint8Array(wasmMemory!.buffer, ptr, buf.length);
  view.set(buf);
  return { ptr, len: buf.length, free: () => exports.free(ptr) };
}

// Export unified interface
export const mathNative: MathModule = {
  backend: 'js',

  async init(): Promise<void> {
    const w = await loadWasm();
    if (w) this.backend = 'wasm';
  },

  fibonacci(n: number): number | string {
    if (this.backend === 'wasm' && wasmInstance) {
      if (n > 93) return 'n too large, use BigInt';
      return Number(wasmInstance.fibonacci(n));
    }
    return jsImpl.fibonacci(n);
  },

  sumArray(arr: number[]): number {
    if (this.backend === 'wasm' && wasmInstance) {
      const { ptr, free } = copyArrayToWasm(wasmInstance, arr);
      const r = wasmInstance.sum_array(ptr, arr.length);
      free();
      return r;
    }
    return jsImpl.sumArray(arr);
  },

  isPrime(n: number): boolean {
    if (this.backend === 'wasm' && wasmInstance) return wasmInstance.is_prime(n) === 1;
    return jsImpl.isPrime(n);
  },

  factorial(n: number): number {
    if (this.backend === 'wasm' && wasmInstance) return Number(wasmInstance.factorial(n));
    return jsImpl.factorial(n);
  },

  hypot(a: number, b: number): number {
    if (this.backend === 'wasm' && wasmInstance) return wasmInstance.calc_hypot(a, b);
    return jsImpl.hypot(a, b);
  },

  countLetters(s: string): number {
    if (this.backend === 'wasm' && wasmInstance) {
      const { ptr, len, free } = copyStringToWasm(wasmInstance, s);
      const r = wasmInstance.count_letters(ptr, len);
      free();
      return r;
    }
    return jsImpl.countLetters(s);
  },
};

// Auto-init on module load
mathNative.init().catch(() => {});
