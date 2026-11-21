# Node.js + TypeScript + C++ (WASM) API on Vercel

Zero-install C++ via WebAssembly — **no Visual Studio, no Python, no gyp required**.

## Quick start

```bash
npm install      # installs JS/TS deps only, never invokes any C++ compiler
npm run build    # typecheck with tsc (no emit — Vercel transpiles TypeScript automatically)
npx vercel dev   # local dev server at http://localhost:3000/api
```

All APIs work out of the box with a pure-JS fallback. Visit `/api/info` to see whether the WASM backend loaded.

## Project layout

```
api/                 Vercel Serverless Functions (filesystem routing)
  index.ts           GET /api          — API entry
  health.ts          GET /api/health   — health check
  fibonacci.ts       GET /api/fibonacci?n=60
  sum.ts             POST /api/sum        { numbers: number[] }
  isprime.ts         GET /api/isprime?n=997
  factorial.ts       GET /api/factorial?n=15
  hypot.ts           GET /api/hypot?a=3&b=4
  count-letters.ts   POST /api/count-letters  { text: string }
  info.ts            GET /api/info     — backend/node info
src/native/
  index.ts           WASM loader + JS fallback
wasm/
  math.cpp           C++ source
  math.wasm          (optional) compiled WebAssembly, produced by npm run build:wasm
scripts/
  build-wasm.mjs     emcc build helper (requires emscripten or Docker)
```

## Compiling C++ → WASM (optional, only needed if you edit math.cpp)

**Option A: Docker (no local toolchain at all)**

```
docker run --rm -v "${PWD}/wasm:/src" emscripten/emsdk \
  emcc /src/math.cpp -o /src/math.wasm \
  -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1 \
  -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc -O3 \
  -s "EXPORTED_FUNCTIONS=['_fibonacci','_sum_array','_is_prime','_factorial','_calc_hypot','_count_letters','_malloc','_free']"
```

**Option B: Emscripten SDK** (~300 MB, independent from VS)

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && emsdk install latest && emsdk activate latest
# Windows: emsdk_env.bat    macOS/Linux: source ./emsdk_env.sh
cd .. && npm run build:wasm
```

Commit `wasm/math.wasm` to Git so Vercel never needs to compile anything.

## Deploy to Vercel

```
git push
```

Vercel auto-detects the project — `vercel.json` needs no runtime/buildCommand entries.

## Adding a new C++ function

1. Add the function in `wasm/math.cpp` inside `extern "C" { ... }`.
2. Add its name to `EXPORTED_FUNCTIONS` in `scripts/build-wasm.mjs` (or the Docker command).
3. Recompile WASM.
4. Add a method on `WasmExports` interface + `buildWasmModule()` return in `src/native/index.ts`.
5. Add the matching JS fallback in `jsBackend`.
6. Add an `api/xxx.ts` handler.
