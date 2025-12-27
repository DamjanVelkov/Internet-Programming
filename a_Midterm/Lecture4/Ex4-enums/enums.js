var move = function (point, direction, distance) {
    switch (direction) {
        case "Up":
            return { x: point.x, y: point.y + distance };
        case "Down":
            return { x: point.x, y: point.y - distance };
        case "Left":
            return { x: point.x - distance, y: point.y };
        case "Right":
            return { x: point.x + distance, y: point.y };
    }
};
var point = { x: 0, y: 0 };
point = move(point, "Up", 10);
console.log(point);
point = move(point, "Left", 20);
console.log(point);
