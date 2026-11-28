#include <cstring>
#include <cstdlib>

extern "C" {

// 计算 1 到 n 的和，支持超大数字，返回字符串指针
char* heavy_compute(const char* n_str) {
    // 1. 解析字符串为 __int128
    __int128 n = 0;
    int len = strlen(n_str);
    for (int i = 0; i < len; i++) {
        n = n * 10 + (n_str[i] - '0');
    }

    // 2. 公式求和 n*(n+1)/2
    __int128 result = n * (n + 1) / 2;

    // 3. 分配内存（最大 40 位，直接给 50 字节）
    char* out = (char*)malloc(50);
    int idx = 0;
    
    if (result == 0) {
        out[idx++] = '0';
    } else {
        char temp[50];
        int t_idx = 0;
        while (result > 0) {
            temp[t_idx++] = '0' + (result % 10);
            result /= 10;
        }
        while (t_idx > 0) {
            out[idx++] = temp[--t_idx];
        }
    }
    out[idx] = '\0'; 
    return out;
}

// 字符串偏移加密 (保持原样)
char* caesar_cipher(const char* input_str, int shift) {
    if (!input_str) return nullptr;
    int len = strlen(input_str);
    char* result = (char*)malloc(len + 1);
    for (int i = 0; i < len; ++i) {
        char c = input_str[i];
        if (c >= 'a' && c <= 'z') {
            result[i] = 'a' + (c - 'a' + shift) % 26;
        } else if (c >= 'A' && c <= 'Z') {
            result[i] = 'A' + (c - 'A' + shift) % 26;
        } else {
            result[i] = c;
        }
    }
    result[len] = '\0';
    return result;
}

}