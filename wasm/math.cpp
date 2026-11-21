// ============================================================
// C++ 业务模块 —— 编译为纯 .wasm，无需 node-gyp / VS Build Tools
// 导出约定：所有导出函数都是 C 链接（extern "C"），避免名称修饰
// ============================================================

// ---------- 1. 数学计算 ----------

// 斐波那契数列（迭代版，O(n)）
extern "C" unsigned long long fibonacci(unsigned int n) {
    if (n <= 1) return n;
    unsigned long long a = 0, b = 1;
    for (unsigned int i = 2; i <= n; ++i) {
        unsigned long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}

// 数组求和：接收 int 指针和长度
extern "C" long long sum_array(const int* arr, int len) {
    long long s = 0;
    for (int i = 0; i < len; ++i) s += arr[i];
    return s;
}

// 素数判定（试除法，O(√n)）
extern "C" int is_prime(unsigned int n) {
    if (n < 2) return 0;
    if (n < 4) return 1;
    if (n % 2 == 0 || n % 3 == 0) return 0;
    for (unsigned int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return 0;
    }
    return 1;
}

// ---------- 2. 字符串处理（演示 WASM 内存交互） ----------

// 统计字符串中英文字母的个数
// 参数 str 为 WASM 内存中字符串起始偏移，len 为字节长度
extern "C" int count_letters(const unsigned char* str, int len) {
    int cnt = 0;
    for (int i = 0; i < len; ++i) {
        unsigned char c = str[i];
        if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) ++cnt;
    }
    return cnt;
}

// ---------- 3. 简单数值计算 ----------

extern "C" double calc_hypot(double a, double b) {
    return __builtin_sqrt(a * a + b * b);
}

extern "C" unsigned long long factorial(unsigned int n) {
    unsigned long long r = 1;
    for (unsigned int i = 2; i <= n; ++i) r *= i;
    return r;
}
