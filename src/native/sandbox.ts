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

export async function runSandboxedLua(code: string): Promise<{ ok: boolean; result?: string; error?: string }> {
  const lua = await initPromise;

  // 每次执行前重置沙箱
  lua.sandboxReset();
  (global as any).__getLuaOutput(); // 清空之前的输出缓存

  // 设置严格限制
  try {
    lua.setLimits({
      maxInstructions: 1_000_000,
      maxMemory: 16 * 1024 * 1024,
      strict: true,
    });
  } catch (e) {
    // 某些版本可能不需要 setLimits 或者在 sandboxReset 后自带限制，忽略错误
  }

  try {
    const result = lua.tryExec(code);

    if (!result.ok) {
      return { ok: false, error: String(result.error) };
    }

    // 获取用户 print 出来的结果
    const output = (global as any).__getLuaOutput();

    return { ok: true, result: output || '(no output)' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}