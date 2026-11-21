#include <napi.h>
#include <chrono>
#include <thread>

// 模拟耗时计算（实际替换为你的 C/C++ 库调用）
int HeavyCompute(int n) {
    std::this_thread::sleep_for(std::chrono::seconds(2)); // 模拟 2 秒计算
    int sum = 0;
    for (int i = 0; i < n; ++i) sum += i;
    return sum;
}

// 继承 AsyncWorker，将计算放到后台线程
class HeavyWorker : public Napi::AsyncWorker {
public:
    HeavyWorker(Napi::Function& callback, int n)
        : Napi::AsyncWorker(callback), n_(n), result_(0) {}

    // 在 worker 线程执行，不能访问 JS
    void Execute() override {
        result_ = HeavyCompute(n_);
    }

    // 回到主线程，将结果传给 Promise
    void OnOK() override {
        Napi::HandleScope scope(Env());
        Callback().Call({Env().Null(), Napi::Number::New(Env(), result_)});
    }

private:
    int n_;
    int result_;
};

// JS 调用入口，返回 Promise
Napi::Value ComputeAsync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int n = info[0].As<Napi::Number>().Int32Value();

    // 创建 Promise 并返回
    auto deferred = Napi::Promise::Deferred::New(env);

    // 创建 worker，回调中 resolve/reject Promise
    auto* worker = new HeavyWorker(
        Napi::Function::New(env, [deferred](const Napi::CallbackInfo& cbInfo) mutable {
            if (cbInfo[0].IsNull()) {
                deferred.Resolve(cbInfo[1]);
            } else {
                deferred.Reject(cbInfo[0]);
            }
        }),
        n
    );
    worker->Queue();

    return deferred.Promise();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("computeAsync", Napi::Function::New(env, ComputeAsync));
    return exports;
}

NODE_API_MODULE(heavy_calc, Init)