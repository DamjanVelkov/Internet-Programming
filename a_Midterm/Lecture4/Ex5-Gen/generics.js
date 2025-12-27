// Generic function to get the first element of an array
function getFirst(arr) {
    return arr.length > 0 ? arr[0] : undefined;
}
// Example usage
var numbers = [1, 2, 3, 4, 5];
var strings = ["hello", "world"];
var empty = [];
console.log(getFirst(numbers)); // Output: 1
console.log(getFirst(strings)); // Output: "hello"
console.log(getFirst(empty)); // Output: undefined
