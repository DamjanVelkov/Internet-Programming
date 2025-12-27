interface Vehicle {
    maker: string;
    model: string;
    year: number;
}

interface Car extends Vehicle {
    numberOfDoors: number;
    fuelType: string;
}

class Sedan implements Car {

    constructor(public maker: string, public model: string, public year: number, public numberOfDoors: number, public fuelType: string) {
    }

    getDescription(): string {
        return `${this.year} ${this.maker} ${this.model} - ${this.numberOfDoors} doors, ${this.fuelType}`;
    }
}

// Example usage:
const myCar = new Sedan("Toyota", "Camry", 2022, 4, "Petrol");
const myCar2 = new Sedan("Mercedes", "GLE", 2025, 4, "Diesel");
const myCar3 = new Sedan("Porsche", "Panamera", 2021, 3, "Petrol");
console.log(myCar.getDescription());
console.log(myCar2.getDescription());
console.log(myCar3.getDescription());
