const fibonacci = (n: number): number => {
    count++; // Increment counter for each function call
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('\n')

let count = 0;
console.log(fibonacci(10)); // Output: 55
console.log('Count for n=10:', count);

count = 0;
console.log(fibonacci(20)); // Output: 6765
console.log('Count for n=20:', count);

count = 0;
console.log(fibonacci(30));
console.log('Count for n=30:', count);

count = 0;
console.log(fibonacci(40)); // Output: 102334155
console.log('Count for n=40:', count);

count = 0;
console.log(fibonacci(43)); // Output: 433494437
console.log('Count for n=43:', count);

//memoized version
const memoizedFibonacci = (() => {
    const cache: { [key: number]: number } = {
        0: 1,
        1: 1
    };
    const innerFunction = (n: number): number => {
        count++;
        if (n in cache) {
            return cache[n];
        }
        if (n <= 0) return 0;
        if (n === 1) return 1;
        const result = innerFunction(n - 1) + innerFunction(n - 2);
        cache[n] = result;
        return result;
    }
    return innerFunction;
}
)();

console.log('\n')

count = 0;
console.log(memoizedFibonacci(10)); // Output: 55
console.log('Count for n=10:', count);

count = 0;
console.log(memoizedFibonacci(20)); // Output: 6765
console.log('Count for n=20:', count);

count = 0;
console.log(memoizedFibonacci(30));
console.log('Count for n=30:', count);

count = 0;
console.log(memoizedFibonacci(40)); // Output: 102334155
console.log('Count for n=40:', count);

count = 0;
console.log(memoizedFibonacci(43)); // Output: 433494437
console.log('Count for n=43:', count);

count = 0;
console.log(memoizedFibonacci(43)); // Output: 433494437
console.log('Count for n=43:', count);
