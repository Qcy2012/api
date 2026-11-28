#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include "emscripten.h"
#include "src/webp/encode.h"

EMSCRIPTEN_KEEPALIVE
uint8_t* encode_webp(const uint8_t* rgba, int width, int height, int stride, float quality, size_t* out_size) {
    uint8_t* output = NULL;
    size_t size = WebPEncodeRGBA(rgba, width, height, stride, quality, &output);
    if (size == 0) {
        *out_size = 0;
        return NULL;
    }
    *out_size = size;
    return output;
}

EMSCRIPTEN_KEEPALIVE
void free_webp_output(uint8_t* ptr) {
    WebPFree(ptr);
}