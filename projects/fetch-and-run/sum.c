#include <stdio.h>
#include "emscripten.h"

EMSCRIPTEN_KEEPALIVE
int sum(int n) {
    int res = 0;

    for(i = 0; i < n; i++) {
        res += 1;
    }

    return sum;
}