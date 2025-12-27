// Generic function to get the first element of an array
function getFirst<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

// Example usage
const numbers = [1, 2, 3, 4, 5];
const strings = ["hello", "world"];
const empty: number[] = [];

console.log(getFirst(numbers));  // Output: 1
console.log(getFirst(strings));  // Output: "hello"
console.log(getFirst(empty));    // Output: undefined
