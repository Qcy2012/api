import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 针对 /api/eval 沙箱的严格限制：每 10 秒最多 5 次
export const evalRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  prefix: "ratelimit:eval",
});

// 针对普通 API（compute/cipher/encode）的宽松限制：每 10 秒 30 次
export const apiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  prefix: "ratelimit:api",
});