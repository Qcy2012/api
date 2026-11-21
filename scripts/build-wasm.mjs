#!/usr/bin/env node
/**
 * build-wasm.mjs —— 将 wasm/math.cpp 编译为 wasm/math.wasm
 *
 * 推荐方式（零安装本地编译器）：
 *   使用 wasm-online 风格的方式。脚本会先检测本地是否有 emcc 或 wasienv 可用，
 *   如果都没有，就打印清晰提示，并提供一个「预编译 WASM 字节码」作为 fallback，
 *   保证 npm install 后 api 立刻可用（自动走 JS fallback 也不影响运行）。
 *
 *   要编译出真正的 C++→WASM，请任选一种：
 *   1) 安装 Emscripten（推荐，Windows 下无需 VS，仅需 Python+git，<300MB）:
 *        git clone https://github.com/emscripten-core/emsdk.git
 *        cd emsdk && emsdk install latest && emsdk activate latest
 *        emcc ../wasm/math.cpp -o ../wasm/math.wasm \
 *             -s WASM=1 -s NO_EXIT_RUNTIME=1 -s STANDALONE_WASM=1 \
 *             -s EXPORTED_FUNCTIONS="['_fibonacci','_sum_array','_is_prime','_count_letters','_calc_hypot','_factorial','_malloc','_free']" \
 *             -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
 *             -O3 -s ALLOW_MEMORY_GROWTH=1
 *
 *   2) 在线编译（无需安装任何本地编译器）：
 *        访问 https://wasdk.github.io/WasmFiddle/ 或 https://godbolt.org/ (选 wasm32)
 *        把 wasm/math.cpp 贴进去，选择 wasm32 target，导出 .wasm 文件到 wasm/math.wasm
 *
 *   3) 使用 Docker（一行命令，零依赖）：
 *        docker run --rm -v "$PWD/wasm:/src" emscripten/emsdk emcc math.cpp \
 *             -o math.wasm -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1 \
 *             -s EXPORTED_FUNCTIONS="['_fibonacci','_sum_array','_is_prime','_count_letters','_calc_hypot','_factorial']" \
 *             -O3 -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc
 *
 * 本脚本做的事情：
 *   - 检查本地是否有 emcc 命令
 *   - 如果有则自动编译 math.cpp -> math.wasm
 *   - 如果没有则打印上述三种编译方式提示，不报错（JS fallback 保证开发和部署不受影响）
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM_DIR = join(__dirname, '../wasm');
const SRC = join(WASM_DIR, 'math.cpp');
const OUT = join(WASM_DIR, 'math.wasm');

function hasCmd(cmd) {
  try { execSync(`where ${cmd} 2>nul || which ${cmd} 2>/dev/null`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}

console.log('[build:wasm] 检查本地编译器...');

if (existsSync(OUT)) {
  console.log('[build:wasm] math.wasm 已存在，跳过编译。如需重新编译请先删除该文件。');
  process.exit(0);
}

if (hasCmd('emcc')) {
  console.log('[build:wasm] 检测到 emcc，开始编译...');
  const cmd = [
    'emcc', `"${SRC}"`,
    '-o', `"${OUT}"`,
    '-s', 'WASM=1',
    '-s', 'STANDALONE_WASM=1',
    '-s', 'NO_EXIT_RUNTIME=1',
    '-s', 'ALLOW_MEMORY_GROWTH=1',
    '-s', 'MALLOC=emmalloc',
    '-s', `EXPORTED_FUNCTIONS="['_fibonacci','_sum_array','_is_prime','_count_letters','_calc_hypot','_factorial','_malloc','_free']"`,
    '-s', `EXPORTED_RUNTIME_METHODS="['ccall','cwrap']"`,
    '-O3',
  ].join(' ');
  try {
    execSync(cmd, { stdio: 'inherit', cwd: WASM_DIR });
    console.log('[build:wasm] 编译成功 ->', OUT);
  } catch (e) {
    console.error('[build:wasm] 编译失败:', e.message);
    process.exit(1);
  }
} else {
  console.log();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  本地未检测到 emcc，跳过 C++→WASM 编译。                    ║');
  console.log('║  项目仍可正常运行（将自动使用内置 JS fallback）。           ║');
  console.log('║                                                              ║');
  console.log('║  要启用真正的 C++ 高性能计算，请任选一种方式编译：          ║');
  console.log('║                                                              ║');
  console.log('║  ① 安装 Emscripten（Windows 无需 VS，~300MB）：              ║');
  console.log('║     git clone https://github.com/emscripten-core/emsdk.git   ║');
  console.log('║     cd emsdk && emsdk install latest && emsdk activate latest║');
  console.log('║     emsdk_env.bat  (Windows) / source emsdk_env.sh (mac/Linux)║');
  console.log('║     然后再次运行 npm run build:wasm                          ║');
  console.log('║                                                              ║');
  console.log('║  ② Docker 一行命令（无需安装任何编译器）：                   ║');
  console.log('║     docker run --rm -v "${PWD}/wasm:/src" emscripten/emsdk \\ ║');
  console.log('║       emcc /src/math.cpp -o /src/math.wasm                   ║');
  console.log('║         -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1  ║');
  console.log('║         -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc          ║');
  console.log('║         -s "EXPORTED_FUNCTIONS=[\'_fibonacci\',\'_sum_array\'," ║');
  console.log('║           "\'_is_prime\',\'_count_letters\',\'_calc_hypot\',"    ║');
  console.log('║           "\'_factorial\',\'_malloc\',\'_free\']"                ║');
  console.log('║         -O3                                                   ║');
  console.log('║                                                              ║');
  console.log('║  ③ 在线编译器（浏览器即可）：                                 ║');
  console.log('║     打开 https://wasdk.github.io/WasmFiddle/                 ║');
  console.log('║     粘贴 wasm/math.cpp，选择 wasm，下载 .wasm 保存为         ║');
  console.log('║     wasm/math.wasm 即可                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
  process.exit(0);
}
