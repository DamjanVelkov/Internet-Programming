// 10 random integers between 1 and 100
const numbers: number[] = [34, 7, 23, 32, 5, 67, 89, 12, 45, 90];

numbers.sort((a, b) => a - b);
console.log(numbers[0]);

const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

fruits.sort((a, b) => a.length - b.length);
console.log(fruits);

fruits.sort((a, b) => a.localeCompare(b));
console.log(fruits);

const fruits2 = [{
    name: 'apple',
    tastiness: 7
}, {
    name: 'banana',
    tastiness: 8
}, {
    name: 'cherry',
    tastiness: 9
}, {
    name: 'date',
    tastiness: 6
}, {
    name: 'elderberry',
    tastiness: 5    
}];

fruits2.sort((a, b) => b.tastiness - a.tastiness);
console.log(fruits2);