# Node.js + WASM (C++) API on Vercel

A minimal API template using Node.js + TypeScript + C++ (compiled to WebAssembly), deployed to Vercel as Serverless Functions. **No Visual Studio, no node-gyp, no local C++ compiler needed.**

## Quick Start

```bash
npm install
npm run typecheck       # Type-check TypeScript (no build step needed)
npx vercel dev          # Local development server
```

## Deploy to Vercel

```bash
# Option 1: CLI
vercel login && vercel --prod

# Option 2: Git push (recommended)
# Push to GitHub, then import at https://vercel.com/new
```

Vercel automatically detects `api/*.ts` as Serverless Functions and compiles them with `@vercel/node`. No manual build step is needed.

## Enable C++ (WASM) Backend

Without a `.wasm` file, the API uses pure JavaScript fallback (fully functional). To get C++ performance:

### Option A: Docker (recommended, one command)
```bash
npm run build:wasm      # Uses emscripten/emsdk Docker image
git add wasm/math.wasm
git commit -m "add compiled wasm" && git push
```

### Option B: Online compiler
Open https://wasdk.github.io/WasmFiddle/, paste `wasm/math.cpp`, compile to `.wasm`, save as `wasm/math.wasm`.

### Option C: Install Emscripten (~300MB, no VS needed)
Follow https://emscripten.org/docs/getting_started/downloads.html, then run `npm run build:wasm`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | API documentation |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Runtime info & backend status |
| GET | `/api/fibonacci?n=N` | Compute Fibonacci(N) |
| POST | `/api/sum` | Sum array `{ "numbers": [1,2,3] }` |
| GET | `/api/isprime?n=N` | Primality test |
| GET | `/api/factorial?n=N` | N! (n ≤ 20) |
| GET | `/api/hypot?a=A&b=B` | sqrt(a² + b²) |
| POST | `/api/count-letters` | Count letters `{ "text": "Hello" }` |

## Project Structure

```
api/            Serverless Functions (one file per route)
public/         Static files (index.html landing page)
src/native/     WASM loader + JS fallback
wasm/           C++ source + compiled .wasm
scripts/        WASM build script (Docker-based)
vercel.json     Vercel configuration
tsconfig.json   TypeScript configuration
```

## Adding a New C++ Function

1. Add function to `wasm/math.cpp` (use `EMSCRIPTEN_KEEPALIVE`, C linkage)
2. Add function name to `EXPORTED_FUNCTIONS` in `scripts/build-wasm.mjs`
3. Add TS interface method in `src/native/index.ts`
4. Add JS fallback implementation in the same file
5. Rebuild WASM: `npm run build:wasm`
6. Add API route in `api/`
