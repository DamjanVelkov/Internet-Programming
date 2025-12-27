const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

const getLongFruits = (array: string[]) => {
    const result: string[] = [];
    for (const fruit of array) {
        if (fruit.length > 5) {
            result.push(fruit);
        }
    }
    return result;
}

console.log(getLongFruits(fruits));

const getAFruits = (array: string[]) => {
    const result: string[] = [];
    for (const fruit of array) {
        if (fruit.toLowerCase().includes('a')) {
            result.push(fruit);
        }
    }
    return result;
}

console.log(getAFruits(fruits));

// Generic higher-order function to filter an array based on a predicate
function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (const item of arr) {
        if (predicate(item)) {
            result.push(item);
        }
    }
    return result;
}

console.log(filterArray(fruits, fruit => fruit.length > 5));
console.log(filterArray(fruits, fruit => fruit.includes('a')));