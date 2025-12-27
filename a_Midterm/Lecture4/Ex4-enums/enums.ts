interface Point{
    x: number;
    y: number; 
}

type Direction = "Up" | "Down" | "Left" | "Right";

const move = (point: Point, direction: Direction, distance: number): Point => {
    switch(direction){
        case "Up":
            return {x: point.x, y: point.y + distance};
        case "Down":
            return {x: point.x, y: point.y - distance};
        case "Left":
            return {x: point.x - distance, y: point.y};
        case "Right":
            return {x: point.x + distance, y: point.y};
    }
}

let point: Point = {x: 0, y: 0};
point = move(point, "Up", 10);
console.log(point);
point = move(point, "Left", 20);
console.log(point);