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

    fps: 60,
    courtBackgroundColor: "gray",
    courtHeight: 900,
    courtWidth: 1200,
    courtBorderColor: "blue",
    courtBorderHeight: 25,
    courtCenterLineColor: "black",
    courtCenterLineSegmentLength: 68,
    courtCenterLineGapLength: 34,
    paddleColor: "white",
    paddleLeftRightMargin: 34,
    paddleWidth: 40,
    paddleHeight: 120,
    ballColor: "white",
    ballRadius: 12,
}

const PLAYERS = {
    playerOne: 1,
    playerTwo: 2
}

class Game {
    constructor(canvas) {
        this.court = new Court(canvas);
    }

    start() {
        let game = this;
        let prevTime = Date.now();

        setInterval(function () {
            let currTime = Date.now();
            let dT = (currTime - prevTime) / 1000;
            game.draw(); // update
            prevTime = currTime;
        }, 1000 / SETTINGS.fps);
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.clearRect(0, 0, SETTINGS.courtWidth, SETTINGS.courtHeight);
        this.court.draw();
    }
}

class ScoreBoard {

}

class Paddle {
    constructor(x, y, width, height, playerNumber, court) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.playerNumber = playerNumber;
        this.court = court;
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.fillStyle = SETTINGS.paddleColor;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class PaddleController {

}

class AIController {

}

class Court {
    constructor(canvas) {
        this.canvas = canvas;
        this.paddle1 = new Paddle(SETTINGS.paddleLeftRightMargin, SETTINGS.courtHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerOne, this);
        this.paddle2 = new Paddle(SETTINGS.courtWidth - SETTINGS.paddleWidth - SETTINGS.paddleLeftRightMargin, SETTINGS.courtHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerTwo, this);
        this.ball = new Ball(SETTINGS.courtWidth / 2, SETTINGS.courtHeight / 2, SETTINGS.ballRadius, this);
    }

    draw() {
        let context = this.canvas.getContext("2d");
        context.fillStyle = SETTINGS.courtBackgroundColor;
        context.fillRect(0, 0, SETTINGS.courtWidth, SETTINGS.courtHeight);

        context.fillStyle = SETTINGS.courtBorderColor;
        context.fillRect(0, 0, SETTINGS.courtWidth, SETTINGS.courtBorderHeight);
        context.fillRect(0, SETTINGS.courtHeight - SETTINGS.courtBorderHeight, SETTINGS.courtWidth, SETTINGS.courtBorderHeight);

        context.strokeStyle = SETTINGS.courtCenterLineColor;
        context.beginPath();
        context.setLineDash([SETTINGS.courtCenterLineSegmentLength, SETTINGS.courtCenterLineGapLength]);
        context.moveTo(SETTINGS.courtWidth / 2, SETTINGS.courtBorderHeight + SETTINGS.courtCenterLineGapLength);
        context.lineTo(SETTINGS.courtWidth / 2, SETTINGS.courtHeight - SETTINGS.courtBorderHeight);
        context.stroke();

        this.paddle1.draw();
        this.paddle2.draw();
        this.ball.draw();
    }
}

class Ball {
    constructor(x, y, radius, court) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.court = court;
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.fillStyle = SETTINGS.ballColor;
        context.beginPath();
        context.arc(this.x, this.y, SETTINGS.ballRadius, 0, 2 * Math.PI);
        context.fill();
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get left() { return this.x }
    get right() { return this.x + this.width }
    get top() { return this.y }
    get bottom() { return this.y + this.height }

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
canvas.width = SETTINGS.courtWidth;
canvas.height = SETTINGS.courtHeight;
new Game(canvas).start();
