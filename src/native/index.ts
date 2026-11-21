// src/native/index.ts
// Loads the compiled WebAssembly module (wasm/math.wasm) with a pure-JS fallback
// so the API works even without a pre-compiled .wasm file.

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface WasmExports {
  memory: WebAssembly.Memory;
  _fibonacci: (n: number) => number;
  _sum_array: (ptr: number, len: number) => number;
  _is_prime: (n: number) => number;
  _factorial: (n: number) => number;
  _calc_hypot: (a: number, b: number) => number;
  _count_letters: (ptr: number, len: number) => number;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
}

export interface MathModule {
  backend: 'wasm' | 'js';
  fibonacci(n: number): number;
  sum(numbers: number[]): number;
  isPrime(n: number): boolean;
  factorial(n: number): number;
  hypot(a: number, b: number): number;
  countLetters(text: string): number;
}

// ---- Pure-JS fallback (same semantics as C++ code) ----
const jsBackend: MathModule = {
  backend: 'js',
  fibonacci(n: number): number {
    if (n < 0) return -1;
    if (n < 2) return n;
    let a = 0n, b = 1n;
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
    return Number(b);
  },
  sum(numbers: number[]): number {
    return numbers.reduce((s, v) => s + v, 0);
  },
  isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },
  factorial(n: number): number {
    if (n < 0) return -1;
    if (n <= 1) return 1;
    let r = 1n;
    for (let i = 2; i <= n; i++) r *= BigInt(i);
    return Number(r);
  },
  hypot(a: number, b: number): number {
    return Math.sqrt(a * a + b * b);
  },
  countLetters(text: string): number {
    let c = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if ((ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122)) c++;
    }
    return c;
  }
};

let wasmInstance: WasmExports | null = null;

function loadWasm(): WasmExports | null {
  if (wasmInstance) return wasmInstance;
  const wasmPath = join(__dirname, '../../wasm/math.wasm');
  if (!existsSync(wasmPath)) return null;
  try {
    const buf = readFileSync(wasmPath);
    const mem = new WebAssembly.Memory({ initial: 256, maximum: 1024 });
    const imports: WebAssembly.Imports = {
      env: {
        memory: mem,
        __memory_base: 0,
        __table_base: 0
      },
      wasi_snapshot_preview1: {
        proc_exit: () => {},
        fd_write: () => 0,
        fd_close: () => 0,
        fd_seek: () => 0,
        fd_fdstat_get: () => 0
      }
    };
    // Synchronous compilation is supported in Node.js for Buffers.
    const mod = new WebAssembly.Module(buf);
    const inst = new WebAssembly.Instance(mod, imports) as unknown as { exports: any };
    const exp = inst.exports;
    // Ensure memory is accessible: either exported from module or from our imports
    if (!exp.memory) { exp.memory = mem; }
    wasmInstance = exp as WasmExports;
    return wasmInstance;
  } catch (e) {
    console.warn('Failed to load wasm/math.wasm, falling back to JS:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

function buildWasmModule(): MathModule | null {
  const w = loadWasm();
  if (!w) return null;

  const f64View = () => new Float64Array(w.memory.buffer);
  const u8View = () => new Uint8Array(w.memory.buffer);

  return {
    backend: 'wasm',
    fibonacci(n: number): number {
      return Number(w._fibonacci(n));
    },
    sum(numbers: number[]): number {
      const bytes = numbers.length * 8;
      const ptr = w._malloc(bytes);
      try {
        const f64 = f64View();
        const offset = ptr / 8;
        for (let i = 0; i < numbers.length; i++) f64[offset + i] = numbers[i];
        return w._sum_array(ptr, numbers.length);
      } finally {
        w._free(ptr);
      }
    },
    isPrime(n: number): boolean {
      return w._is_prime(n) !== 0;
    },
    factorial(n: number): number {
      return Number(w._factorial(n));
    },
    hypot(a: number, b: number): number {
      return w._calc_hypot(a, b);
    },
    countLetters(text: string): number {
      const encoded = Buffer.from(text, 'utf-8');
      const ptr = w._malloc(encoded.length + 1);
      try {
        u8View().set(encoded, ptr);
        u8View()[ptr + encoded.length] = 0;
        return w._count_letters(ptr, encoded.length);
      } finally {
        w._free(ptr);
      }
    }
  };
}

export const mathModule: MathModule = buildWasmModule() || jsBackend;
export default mathModule;
