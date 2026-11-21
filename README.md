# Node.js + C++/WASM API on Vercel

Zero gyp, zero Visual Studio. C++ code compiles to WebAssembly instead of native .node modules.

## Quick start

```bash
npm install
npm run typecheck    # optional, type check only (no build output needed)
npx vercel dev       # local dev server at http://localhost:3000/api
```

All APIs work immediately via JS fallback — no C++ compiler needed to run the project.

## Compile C++ to WASM (one-time, optional)

With Docker (no Emscripten install needed):
```bash
node scripts/build-wasm.mjs
```

Or with Emscripten installed directly:
```bash
npm run build:wasm
```

This produces `wasm/math.wasm`. Commit it to Git — Vercel will serve it directly, no build-time compilation needed.

## Deploy to Vercel

Push to GitHub, then import at vercel.com/new. Or CLI:
```bash
vercel --prod
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api` | Documentation |
| GET | `/api/health` | Health check |
| GET | `/api/fibonacci?n=50` | Fibonacci |
| POST | `/api/sum` | Array sum `{numbers: number[]}` |
| GET | `/api/isprime?n=997` | Primality test |
| GET | `/api/factorial?n=15` | Factorial |
| GET | `/api/hypot?a=3&b=4` | Hypotenuse |
| POST | `/api/count-letters` | Count letters `{text: string}` |
| GET | `/api/info` | Runtime info & backend status |

Visit `/api/info` — if `backend: "wasm"` shows, C++ compiled module is active.
