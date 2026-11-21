import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMathModule } from '../src/native/index.js';
import { sendOk } from '../src/utils/response.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const m = await getMathModule();
  sendOk(res, {
    backend: m.backend,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    wasmSupport: typeof WebAssembly !== 'undefined',
    note: m.backend === 'js'
      ? 'wasm/math.wasm 不存在，正在使用纯 JS 实现。运行 npm run build:wasm 编译 C++ 为 WASM。'
      : 'C++ 编译的 WASM 模块已加载'
  });
}
