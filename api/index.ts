export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 返回 API 目录
  res.status(200).json({
    message: "欢迎使用 C++ (WASM) API 服务",
    endpoints: {
      "GET /api/health": "健康检查接口",
      "GET /api/compute?n={number}": "使用 C++ 计算 1 到 n 的累加和",
      "GET /api/cipher?text={string}&shift={number}": "使用 C++ 对字符串进行凯撒密码加密"
    },
    examples: [
      "https://api.qcyblog.dpdns.org/api/compute?n=10000",
      "https://api.qcyblog.dpdns.org/api/cipher?text=HelloWorld&shift=3"
    ]
  });
}