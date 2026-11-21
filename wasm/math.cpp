// math.cpp - Compile to math.wasm with Emscripten
// C functions callable from JS via WebAssembly exports

#include <stdint.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>

extern "C" {

// Fibonacci (iterative for speed)
uint64_t fibonacci(int32_t n) {
  if (n <= 0) return 0;
  if (n == 1) return 1;
  uint64_t a = 0, b = 1;
  for (int32_t i = 2; i <= n; i++) {
    uint64_t c = a + b;
    a = b; b = c;
  }
  return b;
}

// Sum array - takes pointer to float64 array and length
double sum_array(const double* arr, int32_t len) {
  double s = 0;
  for (int32_t i = 0; i < len; i++) s += arr[i];
  return s;
}

// Primality test
int32_t is_prime(int32_t n) {
  if (n <= 1) return 0;
  if (n <= 3) return 1;
  if (n % 2 == 0) return 0;
  for (int32_t i = 3; i * i <= n; i += 2) {
    if (n % i == 0) return 0;
  }
  return 1;
}

// Factorial
uint64_t factorial(int32_t n) {
  if (n < 0) return 0;
  uint64_t r = 1;
  for (int32_t i = 2; i <= n; i++) r *= i;
  return r;
}

// Hypotenuse
double calc_hypot(double a, double b) {
  return sqrt(a*a + b*b);
}

// Count letters in a UTF-8 string (pointer + length)
int32_t count_letters(const char* s, int32_t len) {
  int32_t count = 0;
  for (int32_t i = 0; i < len; i++) {
    unsigned char c = (unsigned char)s[i];
    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) count++;
  }
  return count;
}

}
