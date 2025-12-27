function titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const value = "hello, world";
console.log(titleCase(value));