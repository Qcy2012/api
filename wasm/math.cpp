#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#ifdef __cplusplus
extern "C" {
#endif

// Fibonacci: iterative, O(n)
EMSCRIPTEN_KEEPALIVE
uint64_t fibonacci(int n) {
    if (n <= 0) return 0;
    if (n <= 2) return 1;
    uint64_t a = 1, b = 1;
    for (int i = 3; i <= n; i++) {
        uint64_t c = a + b;
        a = b;
        b = c;
    }
    return b;
}

// Sum array: takes pointer to double array and length, returns sum
EMSCRIPTEN_KEEPALIVE
double sum_array(double* arr, int len) {
    double s = 0;
    for (int i = 0; i < len; i++) {
        s += arr[i];
    }
    return s;
}

// Primality test: naive, O(sqrt(n))
EMSCRIPTEN_KEEPALIVE
int is_prime(int n) {
    if (n < 2) return 0;
    if (n < 4) return 1;
    if (n % 2 == 0 || n % 3 == 0) return 0;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return 0;
    }
    return 1;
}

// Factorial
EMSCRIPTEN_KEEPALIVE
uint64_t factorial(int n) {
    if (n <= 1) return 1;
    uint64_t r = 1;
    for (int i = 2; i <= n; i++) {
        r *= (uint64_t)i;
    }
    return r;
}

// Hypotenuse
EMSCRIPTEN_KEEPALIVE
double calc_hypot(double a, double b) {
    return sqrt(a * a + b * b);
}

// Count letters in a string (passed as pointer + length)
// Returns pointer to a 26-element array of counts
EMSCRIPTEN_KEEPALIVE
uint8_t* count_letters(const char* str, int len) {
    static uint8_t counts[26];
    memset(counts, 0, 26);
    for (int i = 0; i < len; i++) {
        char c = str[i];
        if (c >= 'A' && c <= 'Z') {
            counts[c - 'A']++;
        } else if (c >= 'a' && c <= 'z') {
            counts[c - 'a']++;
        }
    }
    return counts;
}

#ifdef __cplusplus
}
#endif
