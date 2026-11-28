import fs from 'fs';
import path from 'path';

let wasmInstance: WebAssembly.Instance | null = null;

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
  }
};