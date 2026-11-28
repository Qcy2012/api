import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = process.cwd();
const wasmDir = path.join(rootDir, 'wasm');
const cppFile = path.join(rootDir, 'src', 'native', 'math.cpp');

if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
}

console.log('Building WASM using local em++...');

try {
  execSync(
    `em++ "${cppFile}" -o "${path.join(wasmDir, 'math.wasm')}" ` +
    `--no-entry ` +
    `-s WASM=1 -s STANDALONE_WASM=1 ` +
    `-s ALLOW_MEMORY_GROWTH=1 ` +
    `-s EXPORT_ALL=1 ` +     // 增加 EXPORT_ALL=1，强制导出所有符号，防止 malloc/free 被优化掉
    `-s "EXPORTED_FUNCTIONS=['_heavy_compute', '_caesar_cipher', '_malloc', '_free']" ` +
    `-O3`,
    { stdio: 'inherit' }
  );
  console.log('✅ Build success: wasm/math.wasm');
} catch (error) {
  console.error('❌ Build failed. Please check the error messages above.');
  process.exit(1);
}