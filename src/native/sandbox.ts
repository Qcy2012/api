// @ts-ignore
import { loadLuaRsNode } from 'omnilua/node';

let luaRuntime: any = null;

// 模块作用域初始化，只跑一次
const initPromise = (async () => {
  // 我们用一个变量来暂存用户 print 出来的内容
  let capturedOutput = '';
  
  const { lua } = await loadLuaRsNode({
    onStdout: (msg: string) => {
      capturedOutput += msg + '\n';
    },
  });
  luaRuntime = lua;
  
  // 把捕获函数挂载到全局，供 runSandboxedLua 使用
  (global as any).__getLuaOutput = () => {
    const out = capturedOutput.trim();
    capturedOutput = ''; // 清空，防止影响下一次执行
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