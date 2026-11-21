# Node.js + TS + C++(WASM) API → Vercel（零 gyp，零 VS）

这个项目展示如何用 **Node.js + TypeScript + C++** 搭建 API 并部署到 Vercel，
**全程不需要安装 node-gyp、不需要 Visual Studio Build Tools、不需要任何本地 C++ 编译器**。

核心思路：把 C++ 代码编译为 **WebAssembly (.wasm)** 而不是 `.node` 原生模块。

---

## 为什么不用 gyp

| 问题 | gyp 方案 | WASM 方案 |
|---|---|---|
| 本地需要的编译器 | VS Build Tools（~6GB）/ Xcode / GCC | **零**（只需 Node.js） |
| 安装额外工具 | Python 2.7/3.x + C++ 工具链 | 无 |
| 跨平台兼容性 | Linux/macOS/Windows 各编一份 | 一份 `.wasm` 全平台通用 |
| Vercel 部署 | 必须在 build 阶段编译（可行但慢） | 直接上传 `.wasm`，零编译 |
| 冷启动/性能 | 原生机器码，最快 | 接近原生，约为原生 70-90% |
| 浏览器复用 | 不可用 | 同一 .wasm 可直接在前端用 |

---

## 快速开始

```bash
# 1. 安装依赖（只会装 JS/TS 包，不会触发任何 C++ 编译）
npm install

# 2. 编译 TypeScript
npm run build

# 3. 本地启动（这一步就能跑！会自动使用 JS fallback）
npx vercel dev
# 或 npm run dev

# 浏览器访问 http://localhost:3000/api
curl http://localhost:3000/api/info
curl "http://localhost:3000/api/fibonacci?n=60"
```

此时你已经可以开发和部署 API 了，**C++ 部分会自动用纯 JS 实现替代**，功能完全一致。

---

## 启用真正的 C++ → WASM（三种方式，任选一种，均无需安装 VS）

### 方式 A：Docker 一行命令（推荐，零本地依赖）

```bash
docker run --rm -v "${PWD}/wasm:/src" emscripten/emsdk \
  emcc /src/math.cpp -o /src/math.wasm \
  -s WASM=1 -s STANDALONE_WASM=1 -s NO_EXIT_RUNTIME=1 \
  -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc \
  -s "EXPORTED_FUNCTIONS=['_fibonacci','_sum_array','_is_prime','_count_letters','_calc_hypot','_factorial','_malloc','_free']" \
  -O3
```

生成 `wasm/math.wasm`，提交到 Git。

### 方式 B：在线编译（浏览器即可）

打开 https://wasdk.github.io/WasmFiddle/ 或 https://godbolt.org/（选 wasm32 target），
把 `wasm/math.cpp` 粘贴进去，下载生成的 `.wasm` 文件保存为 `wasm/math.wasm`。

### 方式 C：安装 Emscripten SDK（Windows 仅需 git + Python，~300MB，不需要 VS）

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
emsdk install latest
emsdk activate latest
# Windows: emsdk_env.bat
# macOS/Linux: source ./emsdk_env.sh

# 回到项目目录
npm run build:wasm
```

Emscripten 自带完整的 LLVM/Clang 工具链，**完全不依赖 Visual Studio**。

---

## 部署到 Vercel

因为 `.wasm` 是跨平台字节码，部署到 Vercel 时：

- **不需要在 Vercel 上编译任何 C++ 代码**
- 直接把 `wasm/math.wasm` 和源码一起推到 GitHub
- 在 Vercel 导入仓库，零配置自动部署
- `vercel.json` 已配置好所有路由、CORS 和运行时

```bash
# 或 CLI 一键部署
npm i -g vercel
vercel login
npm run deploy
```

访问 `/api/info` 可看到 `backend: "wasm"` 表示 C++ 编译的模块已被加载。

---

## 项目结构

```
.
├── api/                    # Vercel Serverless Functions（自动路由）
│   ├── index.ts            # GET /api
│   ├── health.ts           # GET /api/health
│   ├── fibonacci.ts        # GET /api/fibonacci?n=60
│   ├── sum.ts              # POST /api/sum {numbers:[...]}
│   ├── isprime.ts          # GET /api/isprime?n=997
│   ├── factorial.ts        # GET /api/factorial?n=15
│   ├── hypot.ts            # GET /api/hypot?a=3&b=4
│   ├── count-letters.ts    # POST /api/count-letters {text:"..."}
│   └── info.ts             # GET /api/info
├── src/
│   ├── native/index.ts     # WASM 加载器 + JS fallback（核心胶水）
│   └── utils/response.ts   # 响应工具函数
├── wasm/
│   ├── math.cpp            # C++ 业务源码
│   └── math.wasm           # （编译后生成）WebAssembly 字节码
├── scripts/
│   └── build-wasm.mjs      # 自动检测 emcc 并编译
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 如何添加新的 C++ 函数

1. 在 `wasm/math.cpp` 中用 `extern "C"` 添加函数
2. 在 EXPORTED_FUNCTIONS 列表中加入 `_函数名`
3. 在 `src/native/index.ts` 的 WasmExports 接口和 getMathModule 返回值中添加对应方法
4. 在 JS fallback（jsImpl）中也添加同名方法（保证无 wasm 时不报错）
5. 重新编译 `.wasm`，新建一个 `api/xxx.ts` 路由即可

---

## 其他可选方案对比

| 方案 | 本地零编译 | Vercel 兼容 | 性能 | 评价 |
|---|---|---|---|---|
| **WebAssembly（推荐）** | ✅ 可直接用 JS fallback | ✅ 原生支持 | ⭐⭐⭐⭐ 接近原生 | 最佳平衡 |
| Koffi FFI | ❌ 仍需编译 ffi 原生模块 | ❌ Linux/Windows DLL 不通用 | ⭐⭐⭐ | 适合已有 DLL 场景 |
| prebuildify 预编译 | ⚠️ 用户不用编译但开发者仍需 VS | ✅ | ⭐⭐⭐⭐⭐ | 你自己仍要装 VS |
| napi-rs (Rust) | ❌ 仍需 Rust 工具链 | ✅ | ⭐⭐⭐⭐⭐ | 需要学 Rust |
| child_process 调用 exe | ✅ 可在 CI 编译 | ❌ Vercel 无 gcc | ⭐⭐⭐⭐ | 部署不可行 |
