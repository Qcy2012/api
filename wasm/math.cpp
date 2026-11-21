// math.cpp — C++ logic compiled to WebAssembly
// Exports: _fibonacci, _sum_array, _is_prime, _factorial, _calc_hypot, _count_letters, _malloc, _free

#include <cmath>
#include <cstring>
#include <cstdint>

extern "C" {

// Fibonacci (iterative, O(n)) — returns int64 to avoid overflow for n up to ~90
int64_t fibonacci(int n) {
    if (n < 0) return -1;
    if (n < 2) return n;
    int64_t a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        int64_t c = a + b;
        a = b; b = c;
    }
    return b;
}

// Sum of f64 array — JS passes pointer + length via shared memory
double sum_array(const double* arr, int len) {
    double s = 0;
    for (int i = 0; i < len; ++i) s += arr[i];
    return s;
}

// Primality test — simple trial division, fine for moderate inputs
int is_prime(int n) {
    if (n < 2) return 0;
    if (n < 4) return 1;
    if (n % 2 == 0 || n % 3 == 0) return 0;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return 0;
    }
    return 1;
}

int64_t factorial(int n) {
    if (n < 0) return -1;
    if (n <= 1) return 1;
    int64_t r = 1;
    for (int i = 2; i <= n; ++i) r *= i;
    return r;
}

double calc_hypot(double a, double b) {
    return std::sqrt(a * a + b * b);
}

// Count A-Z and a-z letters in a string passed by pointer+len, returns 32-bit int
int count_letters(const char* s, int len) {
    int c = 0;
    for (int i = 0; i < len; ++i) {
        char ch = s[i];
        if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) ++c;
    }
    return c;
}

} // extern "C"
