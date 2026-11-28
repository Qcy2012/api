import fs from 'fs';
import path from 'path';
import { WASI } from 'wasi'; // 1. 引入 Node.js 的 WASI

let webpInstance: WebAssembly.Instance | null = null;
let webpMemory: WebAssembly.Memory | null = null;

try {
  const wasmPath = path.join(process.cwd(), 'wasm', 'webp.wasm');
  if (fs.existsSync(wasmPath)) {
    const buffer = fs.readFileSync(wasmPath);
    const module = new WebAssembly.Module(buffer);
    
    // 2. 创建 WASI 实例
    const wasi = new WASI({
      version: 'preview1',
      args: [],
      env: {},
    });
    
    // 3. 将 WASI 提供的导入对象合并进去
    webpInstance = new WebAssembly.Instance(module, {
      ...wasi.getImportObject(), // 关键：注入 wasi_snapshot_preview1
      env: {
        emscripten_notify_memory_growth: () => {},
      }
    });
    
    // 4. 初始化 WASI（如果需要）
    // wasi.initialize(webpInstance); // 通常对于纯库函数不强制需要，如果报错可以取消注释
    
    webpMemory = (webpInstance.exports as any).memory;
    console.log('✅ WebP WASM loaded');
  }
} catch (err) {
  console.error('❌ Failed to load WebP WASM:', err);
}

export function encodeWebP(rgba: Uint8Array, width: number, height: number, quality: number = 75): Uint8Array | null {
  if (!webpInstance || !webpMemory) {
    throw new Error('WebP WASM not loaded');
  }
  const exports = webpInstance.exports as any;
  const stride = width * 4;

  // 1. 写入 RGBA 像素数据到 WASM 内存
  const rgbaPtr = exports.malloc(rgba.length);
  new Uint8Array(webpMemory.buffer).set(rgba, rgbaPtr);

  // 2. 分配一个 4 字节空间存放 out_size (size_t 在 wasm32 下是 4 字节)
  const sizePtr = exports.malloc(4);

  // 3. 调用编码函数
  const outputPtr = exports.encode_webp(rgbaPtr, width, height, stride, quality, sizePtr);

  // 4. 读取返回的数据大小
  const outSize = new DataView(webpMemory.buffer).getUint32(sizePtr, true); // 小端

  let result: Uint8Array | null = null;
  if (outputPtr !== 0 && outSize > 0) {
    result = new Uint8Array(webpMemory.buffer, outputPtr, outSize).slice(); // 复制出来
    exports.free_webp_output(outputPtr);
  }

  // 5. 释放临时内存
  exports.free(rgbaPtr);
  exports.free(sizePtr);

  return result;
}