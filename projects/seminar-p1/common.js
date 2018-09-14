window.onload = function() {
    const body = document.querySelector('body');
    const button = document.createElement('button');
    button.innerText = 'Start Test!';
    button.onclick = function() {
        startTest();
    }

    body.appendChild(button);
}

function jsFib(n) {
  if (n === 1) return 1;
  if (n === 2) return 1;
  return jsFib(n-1) + jsFib(n-2);
}

function getPrimeCount(n) {
    let count = 0;

    for(let i = 2; i <= n; i++) {
        let isPrime = true;

        for(let j = 2; j < i; j++) {
            if(i % j === 0) {
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

function factorial(n) {
    let result = 1;

    for(let i = 1; i <= n; i++) {
        result *= i;
    }

    return result;
}

function getExecutionTime(func, ...args) {
    // console.log(args);
    // console.log(...args);
    const startTime = Date.now();
    console.log('result is', func(...args));
    // console.log('result is', func(arg));
    const endTime = Date.now();
    return endTime - startTime;
}

var CURRENT_TEST = 10;