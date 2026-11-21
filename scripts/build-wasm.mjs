#!/usr/bin/env node
/**
 * Build C++ to WASM using Emscripten Docker image.
 * No local C++ compiler needed. Requires Docker.
 */
import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = resolve(__dirname, '..', 'wasm');
const cppFile = resolve(wasmDir, 'math.cpp');
const wasmFile = resolve(wasmDir, 'math.wasm');

if (!existsSync(cppFile)) {
  console.error('Error: wasm/math.cpp not found');
  process.exit(1);
}

// Check Docker is available
try {
  execSync('docker --version', { stdio: 'pipe' });
} catch (e) {
  console.error('Docker not found. Please install Docker first.');
  console.error('Alternatively, use https://wasdk.github.io/WasmFiddle/ to compile wasm/math.cpp online.');
  process.exit(1);
}

const exportedFuncs = [
  '_fibonacci', '_sum_array', '_is_prime',
  '_factorial', '_calc_hypot', '_count_letters',
  '_malloc', '_free', '_memset'
];

const cmd = [
  'docker run --rm',
  `-v "${wasmDir}:/src"`,
  'emscripten/emsdk',
  'emcc /src/math.cpp -o /src/math.wasm',
  '-s WASM=1',
  '-s STANDALONE_WASM=1',
  '-s NO_EXIT_RUNTIME=1',
  '-s ALLOW_MEMORY_GROWTH=1',
  '-s MALLOC=emmalloc',
  `-s "EXPORTED_FUNCTIONS=[${exportedFuncs.map(f => "'" + f + "'").join(',')}]"`,
  '-s ERROR_ON_UNDEFINED_SYMBOLS=0',
  '-O3'
].join(' ');

console.log('Building WASM...');
console.log(cmd);
try {
  execSync(cmd, { stdio: 'inherit', shell: true });
  if (existsSync(wasmFile)) {
    const sz = statSync(wasmFile).size;
    console.log('WASM built successfully:', wasmFile, '(' + sz + ' bytes)');
  } else {
    console.error('WASM file not found after build.');
    process.exit(1);
  }
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Compilation failed:', msg);
  process.exit(1);
}
