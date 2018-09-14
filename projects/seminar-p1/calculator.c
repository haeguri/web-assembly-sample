#include <stdio.h>
#include "emscripten.h"

// #define FALSE 0
// #define TRUE 1

typedef enum {false, true} boolean;

EMSCRIPTEN_KEEPALIVE
int fib(int n) {
  if (n == 1) return 1;
  if (n == 2) return 1;
  return fib(n-1) + fib(n-2);
}

EMSCRIPTEN_KEEPALIVE
int get_prime_count(int n) {
    int count = 0;

    for(int i = 2; i <= n; i++) {
        boolean isPrime = true;

        for(int j = 2; j < i; j++) {
            if(i % j == 0) {
                isPrime = false;
                break;
            }
        }

        if(isPrime) {
            count += 1;
        }
    }

    return count;
}

EMSCRIPTEN_KEEPALIVE
long factorial(int n) {
    long result = 1;

    for(int i = 1; i <= n; i++) {
        // result *= i;
        result = result * i;
    }

    return result;
}

EMSCRIPTEN_KEEPALIVE
int multiply(int a, int b) {
    return a * b;
}

EMSCRIPTEN_KEEPALIVE
int sum(int a, int b) {
    return a + b;
}