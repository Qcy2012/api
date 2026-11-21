// build-wasm.mjs - Helper script to compile C++ to WASM via Emscripten Docker
// Usage: node scripts/build-wasm.mjs
// Requires Docker running; no Emscripten install needed on host.

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const wasmDir = resolve(import.meta.dirname, '../wasm');
const cppFile = resolve(wasmDir, 'math.cpp');

if (!existsSync(cppFile)) {
  console.error('math.cpp not found at', cppFile);
  process.exit(1);
}

// Check if docker is available
let dockerAvailable = false;
try {
  execSync('docker --version', { stdio: 'pipe' });
  dockerAvailable = true;
} catch {
  console.log('Docker not found. Using pre-compiled math.wasm or JS fallback.');
  console.log('To compile C++, install Docker or Emscripten, then:');
  console.log('  emcc wasm/math.cpp -o wasm/math.wasm -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc -s "EXPORTED_FUNCTIONS=[\'_fibonacci\',\'_sum_array\',\'_is_prime\',\'_factorial\',\'_calc_hypot\',\'_count_letters\',\'_malloc\',\'_free\']" -O3');
  process.exit(0);
}

console.log('Compiling C++ to WASM via Emscripten Docker...');
const cmd = `docker run --rm -v "${wasmDir}:/src" emscripten/emsdk emcc /src/math.cpp -o /src/math.wasm -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc -s "EXPORTED_FUNCTIONS=['_fibonacci','_sum_array','_is_prime','_factorial','_calc_hypot','_count_letters','_malloc','_free']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 -O3`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Success: wasm/math.wasm generated');
} catch (e) {
  console.error('Compilation failed:', (e as Error).message);
  process.exit(1);
}
