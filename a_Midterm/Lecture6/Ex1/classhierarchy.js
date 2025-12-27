// Base Animal Class
class Animal {
    constructor(name, age, species) {
        this.name = name;
        this.age = age;
        this.species = species;
    }

    makeSound() {
        console.log("Some generic animal sound");
    }

    eat() {
        console.log(`${this.name} is eating`);
    }

    sleep() {
        console.log(`${this.name} is sleeping`);
    }

    getInfo() {
        return `${this.name} is a ${this.age} year old ${this.species}`;
    }
}

// Cat Class
class Cat extends Animal {
    constructor(name, age, breed, furColor) {
        super(name, age, "Cat");
        this.breed = breed;
        this.furColor = furColor;
    }

    makeSound() {
        console.log("Meow!");
    }

    purr() {
        console.log(`${this.name} is purring contentedly`);
    }

    scratch() {
        console.log(`${this.name} is scratching`);
    }
}

// Dog Class
class Dog extends Animal {
    constructor(name, age, breed, isGoodBoy) {
        super(name, age, "Dog");
        this.breed = breed;
        this.isGoodBoy = isGoodBoy;
    }

    makeSound() {
        console.log("Woof! Woof!");
    }

    fetch() {
        console.log(`${this.name} is fetching the ball`);
    }

    wagTail() {
        console.log(`${this.name} is wagging their tail happily`);
    }
}

// Bird Class
class Bird extends Animal {
    constructor(name, age, wingspan, canFly) {
        super(name, age, "Bird");
        this.wingspan = wingspan;
        this.canFly = canFly;
    }

    makeSound() {
        console.log("Tweet! Tweet!");
    }

    fly() {
        if (this.canFly) {
            console.log(`${this.name} is soaring through the air`);
        } else {
            console.log(`${this.name} cannot fly`);
        }
    }
}

// Fish Class
class Fish extends Animal {
    constructor(name, age, waterType, scaleColor) {
        super(name, age, "Fish");
        this.waterType = waterType;
        this.scaleColor = scaleColor;
    }

    makeSound() {
        console.log("Blub blub...");
    }

    swim() {
        console.log(`${this.name} is swimming in ${this.waterType}water`);
    }
}

// Example usage
console.log("=== Testing Cat ===");
const cat = new Cat("Whiskers", 3, "Persian", "White");
console.log(cat.getInfo());
cat.makeSound();
cat.purr();
cat.scratch();

console.log("\n=== Testing Dog ===");
const dog = new Dog("Max", 5, "Golden Retriever", true);
console.log(dog.getInfo());
dog.makeSound();
dog.fetch();
dog.wagTail();

console.log("\n=== Testing Bird ===");
const bird = new Bird("Tweety", 2, 20, true);
console.log(bird.getInfo());
bird.makeSound();
bird.fly();

console.log("\n=== Testing Fish ===");
const fish = new Fish("Nemo", 1, "salt", "Orange");
console.log(fish.getInfo());
fish.makeSound();
fish.swim();
