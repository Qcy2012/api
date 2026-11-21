# Node.js + TypeScript + C++ API on Vercel

一个完整的全栈 API 示例，演示如何在 Node.js 项目中集成 C++ 高性能原生模块（通过 N-API），并用 TypeScript 编写 Serverless API，最终部署到 Vercel。

## 技术栈

| 层 | 技术 | 用途 |
|---|---|---|
| 运行时 | Node.js 20.x | Serverless 函数运行时 |
| 语言 | TypeScript 5.x | API 业务逻辑（类型安全） |
| 高性能层 | C++ + N-API (node-addon-api) | CPU 密集型计算加速 |
| 构建 | node-gyp | 编译 C++ 原生模块为 .node 二进制 |
| 包管理 | npm | 依赖管理 |
| 部署平台 | Vercel Serverless Functions | 自动扩缩容、全球CDN |

## 项目结构

```
node-cpp-vercel-api/
├── api/                        # Vercel Serverless Functions（自动映射路由）
│   ├── index.ts                # GET /api         - 入口文档
│   ├── health.ts               # GET /api/health  - 健康检查
│   ├── fibonacci.ts            # GET /api/fibonacci?n=50 - C++斐波那契
│   ├── sum.ts                  # POST /api/sum    - C++数组求和
│   ├── isprime.ts              # GET /api/isprime?n=997 - C++素数判断
│   └── info.ts                 # GET /api/info    - 运行环境信息
├── src/
│   └── native/
│       ├── math_addon.cc       # C++ 原生模块源码（N-API绑定）
│       └── index.ts            # TS封装层（加载.node + JS fallback）
├── types/
│   └── math_addon.d.ts         # TypeScript 类型声明
├── binding.gyp                 # node-gyp 编译配置
├── vercel.json                 # Vercel 部署配置
├── tsconfig.json               # TypeScript 编译配置
├── package.json
└── .gitignore
```

## 前置环境要求

### 本地开发
- **Node.js** >= 18.x（推荐 20.x LTS）
- **npm** >= 9.x
- **Python** 3.8+（node-gyp构建脚本依赖）
- **C++编译器**：
  - Windows: Visual Studio Build Tools 2019/2022（勾选"Desktop development with C++"）
  - macOS: `xcode-select --install`
  - Linux: `sudo apt install build-essential python3`（Ubuntu/Debian）

### Vercel 部署
Vercel 的 Linux 构建环境（Amazon Linux）默认已预装 GCC、Python3、make，**可以直接编译 C++ 原生模块**，无需额外配置。

## 快速开始（本地开发）

```bash
# 1. 进入项目目录
cd node-cpp-vercel-api

# 2. 安装依赖（npm install 会自动触发 node-gyp rebuild 编译C++模块）
npm install

# 3. 手动编译C++模块（如果install后未自动编译）
npm run rebuild

# 4. 编译TypeScript
npm run build

# 5. 启动本地开发服务器（模拟Vercel环境）
npm start

# 访问 http://localhost:3000/api 查看API文档
```

## API 接口说明

### 1. 入口文档
```
GET /api
```
返回所有可用接口列表。

### 2. 健康检查
```
GET /api/health
```
返回服务状态、运行时间、Node版本等。

### 3. C++斐波那契计算
```
GET /api/fibonacci?n=50
```
| 参数 | 类型 | 范围 | 说明 |
|---|---|---|---|
| n | number | 0 - 1,000,000 | 斐波那契数列项数 |

### 4. C++数组求和
```
POST /api/sum
Content-Type: application/json

{"numbers": [1.5, 2.3, 3.7, 4.2]}
```

### 5. C++素数判断
```
GET /api/isprime?n=997
```
| 参数 | 类型 | 范围 | 说明 |
|---|---|---|---|
| n | number | 0 - 100,000,000 | 待判断的整数 |

### 6. 运行环境信息
```
GET /api/info
```
展示Node版本、平台架构、C++模块加载自检结果。

## 部署到 Vercel

### 方式一：Git 自动部署（推荐）

```bash
# 1. 将代码推送到 GitHub/GitLab/Bitbucket
git init
git add .
git commit -m "feat: init node-cpp-vercel-api"
git remote add origin <你的仓库地址>
git push -u origin main

# 2. 打开 https://vercel.com/new
#    - 选择你的仓库
#    - Vercel 会自动识别为 Node.js 项目
#    - Framework Preset 选择 "Other"
#    - Build Command 和 Install Command 会自动读取 vercel.json
#    - 点击 Deploy
```

### 方式二：CLI 一键部署

```bash
# 安装 Vercel CLI（已包含在devDependencies中）
npm i -g vercel

# 登录
vercel login

# 预览部署
npm run deploy:preview

# 生产部署
npm run deploy:prod
```

### 部署时会发生什么

1. Vercel 在 Linux 构建容器中执行 `npm install`
2. npm install 触发 `node-gyp rebuild`，调用 GCC 编译 `src/native/math_addon.cc` → 生成 `build/Release/math_addon.node`
3. 执行 `npm run build`（即 `tsc`），将 `api/*.ts` 和 `src/**/*.ts` 编译为 JS 到 `dist/`
4. Vercel 将 `api/` 目录下每个文件打包为独立的 Serverless Function
5. 部署完成，分配 `https://xxx.vercel.app` 域名

## 关键配置说明

### 为什么用 N-API 而不是直接用 V8 API？
- **N-API** 是 Node.js 官方稳定 ABI 接口，C++ 编译的 `.node` 文件可以跨 Node.js 大版本使用，无需为每个 Node 版本重新编译
- **node-addon-api** 是 N-API 的 C++ 封装，提供面向对象的 API（Napi::String、Napi::Number 等），开发体验更好

### C++ 模块适合做什么？
- ✅ CPU 密集型计算（图像处理、加密、数值计算、物理模拟）
- ✅ 复用已有的 C/C++ 库（音视频编解码、机器学习推理）
- ✅ 直接操作内存/硬件（零拷贝数据处理）
- ❌ I/O 密集型操作（数据库查询、网络请求）→ 直接用 JS 写即可
- ❌ 简单业务逻辑 → C++ 增加复杂度但无性能收益

### Vercel 上 C++ 模块的限制
- Serverless 函数冷启动会加载 `.node` 文件，二进制模块越大冷启动越慢（本示例约几十KB，影响可忽略）
- 函数最大执行时间：Hobby 版 10秒、Pro 版 60秒（CPU密集任务注意控制耗时）
- `/tmp` 是唯一可写目录（C++代码如需写临时文件请用 `/tmp`）
- 每次部署在干净 Linux 环境重新编译，不要提交本地编译的 `.node` 文件

## 性能对比参考

| 操作 | 纯 JavaScript | C++ N-API | 加速比 |
|---|---|---|---|
| 斐波那契(n=100000) | ~3ms | ~0.3ms | ~10x |
| 100万元素求和 | ~4ms | ~0.5ms | ~8x |
| 素数判断(n=10^7) | ~15ms | ~1.5ms | ~10x |

> 实际加速比取决于算法类型和数据规模，数值计算类通常能获得 5-20x 提升。

## 常见问题

**Q: npm install 时报 node-gyp 编译错误怎么办？**
A: 检查 Python 是否安装（3.8+）、C++ 编译器是否就位。Windows 用户需要安装 Visual Studio Build Tools 并重启终端。

**Q: Vercel 部署日志显示 "Cannot find module '../build/Release/math_addon.node'"？**
A: 确认 package.json 中 `"gypfile": true` 存在，且 vercel.json 的 buildCommand 包含 `npm run rebuild`。

**Q: 可以用 WebAssembly 代替 C++ Addon 吗？**
A: 可以。WASM 的优势是跨平台无需编译，但性能略低于原生 N-API 模块，且无法直接调用系统 API。如果不需要极致性能或系统调用，WASM + Emscripten 也是好选择。

**Q: 如何添加更多 C++ 函数？**
A: 1) 在 `math_addon.cc` 中编写 C++ 函数并用 Napi::包装；2) 在 `Init()` 函数中 `exports.Set()` 导出；3) 在 `types/math_addon.d.ts` 中添加类型声明；4) 在 `src/native/index.ts` 中导出；5) 运行 `npm run rebuild` 重新编译。
