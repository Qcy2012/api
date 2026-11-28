#include <cstdint>

extern "C" {

    // 计算 0 到 n-1 的累加和
    long long heavy_compute(int n) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += i;
        }
        return sum;
    }

}