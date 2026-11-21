import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// ---- JS Fallback implementations (same behavior as C++/WASM) ----

function jsFibonacci(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  let a = 1, b = 1;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

function jsSumArray(arr: number[]): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s;
}

function jsIsPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function jsFactorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function jsHypot(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

function jsCountLetters(str: string): number[] {
  const counts = new Array(26).fill(0);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 65 && c <= 90) counts[c - 65]++;
    else if (c >= 97 && c <= 122) counts[c - 97]++;
  }
  return counts;
}

// ---- WASM module interface ----

interface WasmInstance {
  exports: {
    fibonacci: (n: number) => number;
    sum_array: (ptr: number, len: number) => number;
    is_prime: (n: number) => number;
    factorial: (n: number) => number;
    calc_hypot: (a: number, b: number) => number;
    count_letters: (strPtr: number, len: number) => number;
    memory: WebAssembly.Memory;
    malloc: (size: number) => number;
    free: (ptr: number) => void;
    memset: (ptr: number, value: number, num: number) => number;
  };
}

let wasmInstance: WasmInstance | null = null;
let backend: 'wasm' | 'js' = 'js';

async function loadWasm(): Promise<boolean> {
  // Determine wasm file path
  // __dirname works in CJS; for bundled/vercel, resolve relative to this file
  let wasmPath: string;
  try {
    wasmPath = join(__dirname, '../../wasm/math.wasm');
  } catch {
    wasmPath = join(process.cwd(), 'wasm/math.wasm');
  }

  if (!existsSync(wasmPath)) {
    return false;
  }

  try {
    const buf = readFileSync(wasmPath);
    const memory = new WebAssembly.Memory({ initial: 256, maximum: 1024 });

    const imports: WebAssembly.Imports = {
      env: {
        memory,
        abort: () => {},
      }
    };

    const { instance } = await WebAssembly.instantiate(buf, imports);
    const exp = instance.exports as WasmInstance['exports'];

    // Verify all expected exports exist
    if (typeof exp.fibonacci === 'function' &&
        typeof exp.sum_array === 'function' &&
        typeof exp.is_prime === 'function' &&
        typeof exp.memory === 'object') {
      wasmInstance = { exports: exp };
      backend = 'wasm';
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Load WASM on module import
let wasmLoadPromise: Promise<boolean> | null = null;

function ensureWasmLoaded(): Promise<boolean> {
  if (!wasmLoadPromise) {
    wasmLoadPromise = loadWasm();
  }
  return wasmLoadPromise;
}

// ---- Helper for array I/O with WASM memory ----

function wasmSumArray(arr: number[]): number {
  if (!wasmInstance) return jsSumArray(arr);
  const exp = wasmInstance.exports;
  const bytesPerDouble = 8;
  const len = arr.length;
  const byteLen = len * bytesPerDouble;
  const ptr = exp.malloc(byteLen);
  if (!ptr) return jsSumArray(arr);

  try {
    const view = new Float64Array(exp.memory.buffer, ptr, len);
    for (let i = 0; i < len; i++) {
      view[i] = arr[i];
    }
    return exp.sum_array(ptr, len);
  } finally {
    exp.free(ptr);
  }
}

function wasmCountLetters(str: string): number[] {
  if (!wasmInstance) return jsCountLetters(str);
  const exp = wasmInstance.exports;
  const encoded = Buffer.from(str, 'utf-8');
  const len = encoded.length;
  const ptr = exp.malloc(len);
  if (!ptr) return jsCountLetters(str);

  try {
    const mem = new Uint8Array(exp.memory.buffer);
    for (let i = 0; i < len; i++) {
      mem[ptr + i] = encoded[i];
    }
    const resultPtr = exp.count_letters(ptr, len);
    const counts = new Array(26);
    for (let i = 0; i < 26; i++) {
      counts[i] = mem[resultPtr + i];
    }
    return counts;
  } finally {
    exp.free(ptr);
  }
}

// ---- Exported math API ----

export const mathNative = {
  async init(): Promise<'wasm' | 'js'> {
    await ensureWasmLoaded();
    return backend;
  },

  getBackend(): 'wasm' | 'js' {
    return backend;
  },

  fibonacci(n: number): number {
    if (wasmInstance && backend === 'wasm') {
      return Number(wasmInstance.exports.fibonacci(n));
    }
    return jsFibonacci(n);
  },

  sum(arr: number[]): number {
    if (wasmInstance && backend === 'wasm') {
      return wasmSumArray(arr);
    }
    return jsSumArray(arr);
  },

  isPrime(n: number): boolean {
    if (wasmInstance && backend === 'wasm') {
      return wasmInstance.exports.is_prime(n) === 1;
    }
    return jsIsPrime(n);
  },

  factorial(n: number): number {
    if (wasmInstance && backend === 'wasm') {
      return Number(wasmInstance.exports.factorial(n));
    }
    return jsFactorial(n);
  },

  hypot(a: number, b: number): number {
    if (wasmInstance && backend === 'wasm') {
      return wasmInstance.exports.calc_hypot(a, b);
    }
    return jsHypot(a, b);
  },

  countLetters(str: string): number[] {
    if (wasmInstance && backend === 'wasm') {
      return wasmCountLetters(str);
    }
    return jsCountLetters(str);
  }
};
