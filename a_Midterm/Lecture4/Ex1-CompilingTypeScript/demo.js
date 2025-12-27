function titleCase(value) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
var value = "hello, world";
console.log(titleCase(value));
