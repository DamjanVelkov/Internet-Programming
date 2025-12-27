//const add = 
const add = (a: number) => (b: number): number => a + b;

// add(2)(3); //Error

const add2 = add(2);

console.log(add2(3)); // 5
console.log(add(2)(3)); // 5

const key = "very strong and secure key";

const encrypt = (key: string) => (plaintext: string): string => {
    // Simple Caesar cipher for demonstration
    const shift = key.length % 26;
    let encrypted = '';
    for (let i = 0; i < plaintext.length; i++) {
        const charCode = plaintext.charCodeAt(i);
        encrypted += String.fromCharCode(plaintext.charCodeAt(i) + key.length);
    }
    return encrypted;
};

const forOutsiders = encrypt(key);
