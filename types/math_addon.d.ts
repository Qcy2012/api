// TypeScript类型声明，让TS代码可以安全地调用C++模块
declare module 'math_addon' {
  /** 计算斐波那契数列第n项，C++高性能实现 */
  export function fibonacci(n: number): number;
  /** 对Float64Array数组求和，C++高性能实现 */
  export function sumArray(arr: Float64Array): number;
  /** 判断一个数是否为素数，C++高性能实现 */
  export function isPrime(n: number): boolean;
}
