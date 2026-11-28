import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = process.cwd();
const wasmDir = path.join(rootDir, 'wasm');
const cppFile = path.join(rootDir, 'src', 'native', 'math.cpp');

if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
}

console.log('Building WASM using local emcc...');

try {
  execSync(
    `emcc "${cppFile}" -o "${path.join(wasmDir, 'math.wasm')}" ` +
    `--no-entry ` +                      // 新增：告诉编译器没有 main 函数
    `-s WASM=1 -s STANDALONE_WASM=1 ` +
    `-s ALLOW_MEMORY_GROWTH=1 ` +
    `-s "EXPORTED_FUNCTIONS=['_heavy_compute']" ` +
    `-O3`,
    { stdio: 'inherit' }
  );
  console.log('✅ Build success: wasm/math.wasm');
} catch (error) {
  console.error('❌ Build failed. Please check the error messages above.');
  process.exit(1);
}