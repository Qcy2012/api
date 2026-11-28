let luaRuntime: any = null;

const initPromise = (async () => {
  let capturedOutput = '';
  
  // 动态 import，绕过 CommonJS 的 require 限制
  const { loadLuaRsNode } = await import('omnilua/node');
  
  const { lua } = await loadLuaRsNode({
    onStdout: (msg: string) => {
      capturedOutput += msg + '\n';
    },
  });
  luaRuntime = lua;
  
  (global as any).__getLuaOutput = () => {
    const out = capturedOutput.trim();
    capturedOutput = '';
    return out;
  };
  
  return lua;
})();

export async function runSandboxedLua(code: string): Promise<{ ok: boolean; result?: any; error?: string }> {
  // 1. 等待初始化
  const lua = await initPromise;

  // 2. 超时控制 (1.5 秒)
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Execution timeout (1.5s)')), 1500);
  });

  // 3. 执行逻辑
  const execPromise = (async () => {
    lua.sandboxReset();
    (global as any).__getLuaOutput(); // 清空以前的输出
    lua.setLimits({ maxInstructions: 1_000_000, maxMemory: 16 * 1024 * 1024, strict: true });
    
    const result = lua.tryExec(code);
    if (!result.ok) throw new Error(String(result.error));
    
    return (global as any).__getLuaOutput() || '(no output)';
  })();

  try {
    // 竞速：要么执行成功，要么超时
    const rawOutput = await Promise.race([execPromise, timeoutPromise]);
    clearTimeout(timer!); // 成功执行后清理定时器

    // 4. 自动解析 JSON
    if (rawOutput && (rawOutput.startsWith('{') || rawOutput.startsWith('['))) {
      try {
        const parsed = JSON.parse(rawOutput);
        return { ok: true, result: parsed };
      } catch (e) {
        // 解析失败就当普通字符串返回
        return { ok: true, result: rawOutput };
      }
    }

    return { ok: true, result: rawOutput };

  } catch (err: any) {
    clearTimeout(timer!); // 发生错误或超时后清理定时器
    return { ok: false, error: err.message };
  }
}