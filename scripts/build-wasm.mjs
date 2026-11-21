// scripts/build-wasm.mjs
// Compile wasm/math.cpp to wasm/math.wasm using emscripten.
// Requires emcc in PATH (install via: https://emscripten.org/docs/getting_started/downloads.html)
// This is a build helper, NOT required for Vercel deployment — wasm/math.wasm is committed.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const src = resolve(root, 'wasm/math.cpp');
const out = resolve(root, 'wasm/math.wasm');

const hasEmcc = (() => {
  try {
    execSync('emcc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

if (!hasEmcc) {
  console.error('ERROR: emcc not found in PATH.');
  console.error('Install Emscripten (https://emscripten.org) then run `npm run build:wasm` again.');
  console.error('Alternatively compile with Docker one-liner (see README.md).');
  process.exit(1);
}

if (!existsSync(src)) {
  console.error('ERROR: source file not found:', src);
  process.exit(1);
}

const exported = "['_fibonacci','_sum_array','_is_prime','_factorial','_calc_hypot','_count_letters','_malloc','_free']";

const args = [
  'emcc', src,
  '-o', out,
  '-s', 'WASM=1',
  '-s', 'STANDALONE_WASM=1',
  '-s', 'NO_EXIT_RUNTIME=1',
  '-s', 'ALLOW_MEMORY_GROWTH=1',
  '-s', 'MALLOC=emmalloc',
  '-O3',
  '-s', `EXPORTED_FUNCTIONS=${exported}`
];

console.log('Compiling with emcc…');
try {
  execSync(args.join(' '), { stdio: 'inherit', cwd: root });
  console.log('Built:', out);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Compilation failed:', msg);
  process.exit(1);
}
