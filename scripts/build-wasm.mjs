import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = process.cwd();
const wasmDir = path.join(rootDir, 'wasm');

if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
}

// 检查是否传入 --webp 参数
const isWebp = process.argv.includes('--webp');

try {
  if (isWebp) {
    console.log('📦 Building libwebp WASM...');
    
    const libwebpDir = path.join(rootDir, 'build-tools', 'libwebp');
    if (!fs.existsSync(libwebpDir)) {
      console.error('❌ libwebp not found at build-tools/libwebp');
      process.exit(1);
    }

    // 1. 自动收集所有需要的 C 文件
    function getCFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getCFiles(filePath));
        } else if (file.endsWith('.c')) {
          results.push(filePath);
        }
      }
      return results;
    }

    const cFiles = [
      path.join(rootDir, 'src', 'native', 'webp.c'),
      ...getCFiles(path.join(libwebpDir, 'src', 'dec')),
      ...getCFiles(path.join(libwebpDir, 'src', 'dsp')),
      ...getCFiles(path.join(libwebpDir, 'src', 'demux')),
      ...getCFiles(path.join(libwebpDir, 'src', 'enc')),
      ...getCFiles(path.join(libwebpDir, 'src', 'mux')),
      ...getCFiles(path.join(libwebpDir, 'src', 'utils')),
      ...getCFiles(path.join(libwebpDir, 'sharpyuv'))
    ];

    // 2. 把所有路径写进一个临时的 txt 文件（每个路径用双引号包起来防空格）
    const responseFilePath = path.join(rootDir, 'emcc_sources.txt');
    const fileContent = cFiles.map(f => `"${f}"`).join('\n');
    fs.writeFileSync(responseFilePath, fileContent, 'utf-8');

    // 3. 构造最终命令，使用 @文件 语法
    const emccArgs = [
      '-O3',
      '--no-entry',
      '-s', 'WASM=1',
      '-s', 'STANDALONE_WASM=1',
      '-s', 'ALLOW_MEMORY_GROWTH=1',
      '-s', 'EXPORTED_FUNCTIONS=["_encode_webp","_free_webp_output","_malloc","_free"]',
      '-I', `"${libwebpDir}"`,
      '-I', `"${path.join(libwebpDir, 'src')}"`,
      `@${responseFilePath}`,
      '-o', '"wasm/webp.wasm"'
    ];

    const command = `emcc ${emccArgs.join(' ')}`;
    console.log('Executing build (using response file to bypass command length limits)...');
    
    try {
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Build success: wasm/webp.wasm');
    } finally {
      // 编译完后清理临时文件
      if (fs.existsSync(responseFilePath)) {
        fs.unlinkSync(responseFilePath);
      }
    }
  } else {
    console.log('📦 Building math WASM (default)...');
    const cppFile = path.join(rootDir, 'src', 'native', 'math.cpp');
    
    execSync(
      `em++ "${cppFile}" -o "${path.join(wasmDir, 'math.wasm')}" ` +
      `--no-entry ` +
      `-s WASM=1 -s STANDALONE_WASM=1 ` +
      `-s ALLOW_MEMORY_GROWTH=1 ` +
      `-s EXPORT_ALL=1 ` +
      `-s "EXPORTED_FUNCTIONS=['_heavy_compute', '_caesar_cipher', '_malloc', '_free']" ` +
      `-O3`,
      { stdio: 'inherit' }
    );
    console.log('✅ Build success: wasm/math.wasm');
  }
} catch (error) {
  console.error('❌ Build failed. Please check the error messages above.');
  process.exit(1);
}