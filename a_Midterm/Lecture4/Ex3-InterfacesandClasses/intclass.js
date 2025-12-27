var Sedan = /** @class */ (function () {
    function Sedan(maker, model, year, numberOfDoors, fuelType) {
        this.maker = maker;
        this.model = model;
        this.year = year;
        this.numberOfDoors = numberOfDoors;
        this.fuelType = fuelType;
    }
    Sedan.prototype.getDescription = function () {
        return "".concat(this.year, " ").concat(this.maker, " ").concat(this.model, " - ").concat(this.numberOfDoors, " doors, ").concat(this.fuelType);
    };
    return Sedan;
}());
// Example usage:
var myCar = new Sedan("Toyota", "Camry", 2022, 4, "Petrol");
var myCar2 = new Sedan("Mercedes", "GLE", 2025, 4, "Diesel");
var myCar3 = new Sedan("Porsche", "Panamera", 2021, 3, "Petrol");
console.log(myCar.getDescription());
console.log(myCar2.getDescription());
console.log(myCar3.getDescription());
