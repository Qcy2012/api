#include <napi.h>
#include <vector>
#include <cmath>

// C++高性能计算示例1: 斐波那契数列（递归+备忘录，展示CPU密集计算）
int64_t Fibonacci(int n) {
    if (n <= 1) return n;
    int64_t a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        int64_t c = a + b;
        a = b;
        b = c;
    }
    return b;
}

Napi::Value FibonacciWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
        return env.Null();
    }
    int n = info[0].As<Napi::Number>().Int32Value();
    int64_t result = Fibonacci(n);
    return Napi::Number::New(env, static_cast<double>(result));
}

// C++示例2: 数组求和（展示批量数值计算性能）
Napi::Value SumArrayWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsTypedArray()) {
        Napi::TypeError::New(env, "Expected a Float64Array").ThrowAsJavaScriptException();
        return env.Null();
    }
    Napi::Float64Array arr = info[0].As<Napi::Float64Array>();
    double sum = 0.0;
    for (size_t i = 0; i < arr.ElementLength(); ++i) {
        sum += arr[i];
    }
    return Napi::Number::New(env, sum);
}

// C++示例3: 判断素数（展示CPU密集型逻辑）
bool IsPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int i = 3; i <= static_cast<int>(std::sqrt(n)); i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

Napi::Value IsPrimeWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
        return env.Null();
    }
    int n = info[0].As<Napi::Number>().Int32Value();
    return Napi::Boolean::New(env, IsPrime(n));
}

// 模块初始化：导出所有函数
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "fibonacci"), Napi::Function::New(env, FibonacciWrapped));
    exports.Set(Napi::String::New(env, "sumArray"), Napi::Function::New(env, SumArrayWrapped));
    exports.Set(Napi::String::New(env, "isPrime"), Napi::Function::New(env, IsPrimeWrapped));
    return exports;
}

NODE_API_MODULE(math_addon, Init)
