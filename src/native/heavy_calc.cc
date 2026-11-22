#include <napi.h>
#include <chrono>
#include <thread>

long long HeavyCompute(long long n) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    long long sum = 0;
    for (long long i = 0; i < n; i++) sum += i;
    return sum;
}

class HeavyWorker : public Napi::AsyncWorker {
public:
    HeavyWorker(Napi::Function callback, long long n)   // 改为按值传递
        : Napi::AsyncWorker(callback), n_(n), result_(0) {}

    void Execute() override { result_ = HeavyCompute(n_); }

    void OnOK() override {
        Napi::HandleScope scope(Env());
        Callback().Call({Env().Null(), Napi::BigInt::New(Env(), result_)});
    }

private:
    long long n_;
    long long result_;
};

Napi::Value ComputeAsync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    long long n = info[0].As<Napi::Number>().Int64Value();
    auto deferred = Napi::Promise::Deferred::New(env);
    auto* worker = new HeavyWorker(
        Napi::Function::New(env, [deferred](const Napi::CallbackInfo& cbInfo) mutable {
            if (cbInfo[0].IsNull()) deferred.Resolve(cbInfo[1]);
            else deferred.Reject(cbInfo[0]);
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