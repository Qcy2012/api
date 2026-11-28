import fs from 'fs';
import path from 'path';

let wasmInstance: WebAssembly.Instance | null = null;

// 更新 WasmExports 接口
interface WasmExports {
  _heavy_compute: (n: number) => bigint;
  _caesar_cipher: (ptr: number, shift: number) => number; // 返回结果字符串的内存指针
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  memory: WebAssembly.Memory;
}

// 尝试加载 WASM
try {
  const wasmPath = path.join(process.cwd(), 'wasm', 'math.wasm');
  if (fs.existsSync(wasmPath)) {
    const wasmBuffer = fs.readFileSync(wasmPath);
    const wasmModule = new WebAssembly.Module(wasmBuffer);
    wasmInstance = new WebAssembly.Instance(wasmModule, {
      env: {
        // Emscripten 可能需要的一些基础模拟
        memoryBase: 0,
        tableBase: 0,
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
      }
    });
    console.log('✅ WASM loaded successfully');
  } else {
    console.log('⚠️ math.wasm not found, falling back to JS');
  }
} catch (err) {
  console.error('❌ Failed to load WASM, falling back to JS:', err);
}

export const mathNative = {
  heavyCompute(n: number): { result: bigint, backend: string } {
    // 如果有 WASM，走高性能 C++ 路径
    if (wasmInstance && wasmInstance.exports.heavy_compute) {
      const computeFn = wasmInstance.exports.heavy_compute as (n: number) => bigint;
      return {
        result: computeFn(n),
        backend: 'wasm'
      };
    }
    
    // 否则走 JS 降级路径，同样使用 BigInt 保证精度
    let sum = 0n;
    for (let i = 0n; i < BigInt(n); i++) {
      sum += i;
    }
    return {
      result: sum,
      backend: 'js'
    };
  },

  // 调用 WASM 处理字符串
  caesarCipher(text: string, shift: number): { result: string, backend: string } {
    // 如果没有加载 WASM，使用 JS 降级
    if (!wasmInstance || !wasmInstance.exports._caesar_cipher) {
      // JS 降级实现
      let res = '';
      for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        if (c >= 97 && c <= 122) res += String.fromCharCode((c - 97 + shift) % 26 + 97);
        else if (c >= 65 && c <= 90) res += String.fromCharCode((c - 65 + shift) % 26 + 65);
        else res += text[i];
      }
      return { result: res, backend: 'js' };
    }

    const exports = wasmInstance.exports as unknown as WasmExports;
    
    // 1. 将 JS 字符串编码为 UTF-8 字节数组（加上结束符 \0）
    const bytes = new TextEncoder().encode(text + '\0');
    
    // 2. 在 WASM 内存中分配空间，并把字符串写进去
    const ptr = exports._malloc(bytes.length);
    const memoryBuffer = new Uint8Array(exports.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    
    // 3. 调用 C++ 函数，传入指针，拿到结果指针
    const resultPtr = exports._caesar_cipher(ptr, shift);
    
    // 4. 从 WASM 内存中读取结果
    // 因为不知道长度，需要遍历寻找 \0 或者用 TextDecoder 自动处理
    const resultBytes = new Uint8Array(exports.memory.buffer, resultPtr);
    let end = 0;
    while (resultBytes[end] !== 0) end++; // 找结束符
    const resultText = new TextDecoder().decode(resultBytes.slice(0, end));
    
    // 5. 释放内存（非常重要，否则会内存泄漏）
    exports._free(ptr);
    exports._free(resultPtr);
    
    return { result: resultText, backend: 'wasm' };
  }
};