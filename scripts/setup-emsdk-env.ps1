# api/scripts/setup-emsdk.ps1

# 获取项目根目录（脚本的上一级目录）
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$emsdkPath = Join-Path $ProjectRoot "build-tools\emsdk"
$envScript = Join-Path $emsdkPath "emsdk_env.ps1"
$envBat = Join-Path $emsdkPath "emsdk_env.bat"

Write-Host "Configuring Emscripten environment from: $emsdkPath" -ForegroundColor Cyan

if (Test-Path $envScript) {
    # 如果存在 PowerShell 版本的脚本，直接调用
    & $envScript
} elseif (Test-Path $envBat) {
    # 如果只有 bat，运行它并抓取环境变量注入当前会话
    Write-Host "Detected .bat script. Injecting environment variables..." -ForegroundColor Yellow
    cmd /c "`"$envBat`" >nul 2>&1 && set" | ForEach-Object {
        if ($_ -match "^(.*?)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            # 跳过一些特殊的无关变量
            if ($name -notmatch "^(PROMPT|_|PWD|OLDPWD)$") {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
} else {
    Write-Host "Error: Cannot find emsdk_env script in $emsdkPath" -ForegroundColor Red
    return
}

# 确保 emcc 所在的目录在 PATH 中
$emscriptenDir = Join-Path $emsdkPath "upstream\emscripten"
if ($env:PATH -notmatch [regex]::Escape($emscriptenDir)) {
    $env:PATH = "$emscriptenDir;$env:PATH"
}

Write-Host "Environment configured successfully!" -ForegroundColor Green
Write-Host "Testing emcc..." -ForegroundColor Cyan
emcc --version