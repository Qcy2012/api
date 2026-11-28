#include <cstdint>
#include <cstdlib>
#include <cstring>

extern "C" {

    long long heavy_compute(long long n) {
        long long sum = n * (n + 1) / 2;
        return sum;
    }

    // 新增：凯撒密码加密（将字符串中的英文字母向后偏移 shift 位）
    char* caesar_cipher(const char* input_str, int shift) {
        if (!input_str) return nullptr;
        
        int len = strlen(input_str);
        // 分配新的内存块给结果字符串（+1 是为了留给结束符 '\0'）
        char* result = (char*)malloc(len + 1);
        
        for (int i = 0; i < len; ++i) {
            char c = input_str[i];
            if (c >= 'a' && c <= 'z') {
                result[i] = 'a' + (c - 'a' + shift) % 26;
            } else if (c >= 'A' && c <= 'Z') {
                result[i] = 'A' + (c - 'A' + shift) % 26;
            } else {
                result[i] = c; // 非字母字符不变
            }
        }
        result[len] = '\0';
        return result;
    }
}