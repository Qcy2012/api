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
        memoryBase: 0,
        tableBase: 0,
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        emscripten_notify_memory_growth: () => {}, // 必须保留
        __cxa_throw: () => {}, // 如果用了 string 可能会需要这个
        abort: () => { throw new Error('WASM aborted'); }
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
  heavyCompute(n: string | number): { result: string, backend: string } {
    const inputStr = String(n);

    if (wasmInstance && wasmInstance.exports.heavy_compute) {
      try {
        const exports = wasmInstance.exports as any;
        
        // 注意：去掉下划线
        const bytes = new TextEncoder().encode(inputStr + '\0');
        const ptr = exports.malloc(bytes.length); 
        new Uint8Array(exports.memory.buffer).set(bytes, ptr);

        const resultPtr = exports.heavy_compute(ptr); 

        const resultBytes = new Uint8Array(exports.memory.buffer, resultPtr);
        let end = 0;
        while (resultBytes[end] !== 0) end++;
        const resultText = new TextDecoder().decode(resultBytes.slice(0, end));

        exports.free(ptr);
        exports.free(resultPtr);

        return { result: resultText, backend: 'wasm' };
      } catch (err) {
        console.error("WASM execution error:", err);
      }
    }
    
    // JS 降级
    const inputBigInt = BigInt(inputStr);
    const resultBigInt = (inputBigInt * (inputBigInt + 1n)) / 2n;
    return { result: resultBigInt.toString(), backend: 'js' };
  },

  // 调用 WASM 处理字符串
  caesarCipher(text: string, shift: number): { result: string, backend: string } {
    // 注意判断条件也要去下划线
    if (wasmInstance && wasmInstance.exports.caesar_cipher) {
      try {
        const exports = wasmInstance.exports as any;
        
        const bytes = new TextEncoder().encode(text + '\0');
        
        // 注意：去掉下划线
        const ptr = exports.malloc(bytes.length);
        new Uint8Array(exports.memory.buffer).set(bytes, ptr);
        
        const resultPtr = exports.caesar_cipher(ptr, shift);
        
        const resultBytes = new Uint8Array(exports.memory.buffer, resultPtr);
        let end = 0;
        while (resultBytes[end] !== 0) end++;
        const resultText = new TextDecoder().decode(resultBytes.slice(0, end));
        
        exports.free(ptr);
        exports.free(resultPtr);
        
        return { result: resultText, backend: 'wasm' };
      } catch (err) {
        console.error("🚨 WASM cipher error:", err);
      }
    }

    // JS 降级实现
    let res = '';
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c >= 97 && c <= 122) res += String.fromCharCode((c - 97 + shift) % 26 + 97);
      else if (c >= 65 && c <= 90) res += String.fromCharCode((c - 65 + shift) % 26 + 65);
      else res += text[i];
    }
    return { result: res, backend: 'js' };
  },
};