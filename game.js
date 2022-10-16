const SETTINGS = {
    winScore: 7,

    smallFont: "10px retro",
    largeFont: "14px retro",
    scoreboardColour: "black",

    buttonColour: "white",
    buttonTextColour: "black",

    paddleSound: '/Sounds/Paddle.wav',
    wallSound: '/Sounds/Wall.wav',
    scoreSound: '/Sounds/Score.wav',
}

const PLAYERS = {
    playerOne: 1,
    playerTwo: 2
}

class Game {
    
}

class ScoreBoard {

}

class Paddle {
    
}

class PaddleController {
    
}

class AIController {
    
}

class Court {
    
}

class Ball {
    
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get left() {return this.x}
    get right() {return this.x + this.width}
    get top() {return this.y}
    get bottom() {return this.y + this.height}

    overlaps(other) {
        return other.left < this.right &&
        this.left < other.right &&
        other.top < this.bottom &&
        this.top < other.bottom
    }

    contains(x, y) {
        return this.left < x && this.right > x && this.top < y && this.bottom > y
    }

}


const canvas = document.getElementById("game")
canvas.width = SETTINGS.width;
canvas.height = SETTINGS.height;
let game = new Game(canvas)