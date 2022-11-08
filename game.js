const SETTINGS = {
    scoreToWinMatch: 7,
    smallFont: "10px retro",
    largeFont: "14px retro",
    scoreboardColor: "black",
    buttonColor: "white",
    buttonTextColor: "black",
    paddleSound: "/Sounds/Paddle.wav",
    wallSound: "/Sounds/Wall.wav",
    scoreSound: "/Sounds/Score.wav",

    fps: 60,
    courtBackgroundColor: "green",
    gameHeight: 900,
    gameWidth: 1200,
    topBottomBorderColor: "blue",
    topBottomBorderHeight: 25,
    centerLineColor: "black",
    centerLineSegmentLength: 68,
    centerLineGapLength: 34,
    paddleColor: "white",
    paddleLeftRightMargin: 34,
    paddleWidth: 40,
    paddleHeight: 120,
    ballColor: "white",
    ballRadius: 12,
    ballSpeed: 300,
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
            game.court.update((currTime - prevTime) / 1000);

            let context = game.court.canvas.getContext("2d");
            context.clearRect(0, 0, SETTINGS.gameWidth, SETTINGS.gameHeight);
            game.court.draw();

            prevTime = currTime;
        }, 1000 / SETTINGS.fps);
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

    get collisionBox() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.fillStyle = SETTINGS.paddleColor;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class PaddleController {
    constructor(paddle) {
        this.paddle = paddle;
        this.paddle.court.canvas.addEventListener("mousemove", (e) => {
            if (e.clientY <= SETTINGS.topBottomBorderHeight + this.paddle.height / 2) {
                this.paddle.y = SETTINGS.topBottomBorderHeight;
            }
            else if (e.clientY >= SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight - this.paddle.height / 2) {
                this.paddle.y = SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight - this.paddle.height;
            }
            else {
                this.paddle.y = e.clientY - this.paddle.height / 2;
            }
        });
    }
}

class AIController {

}

class Court {
    constructor(canvas) {
        this.canvas = canvas;
        this.paddle1 = new Paddle(SETTINGS.paddleLeftRightMargin, SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerOne, this);
        this.paddle2 = new Paddle(SETTINGS.gameWidth - SETTINGS.paddleWidth - SETTINGS.paddleLeftRightMargin, SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerTwo, this);
        this.ball = new Ball(SETTINGS.gameWidth / 2, SETTINGS.gameHeight / 2, SETTINGS.ballRadius, this);
        this.paddleController1 = new PaddleController(this.paddle1);
        this.paddleController2 = new PaddleController(this.paddle2);
    }

    get bounds() {
        return {
            upper: SETTINGS.topBottomBorderHeight,
            lower: SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight,
            left: 0,
            right: SETTINGS.gameWidth
        }
    }

    update(dT) {
        this.ball.update(dT);
    }

    draw() {
        let context = this.canvas.getContext("2d");
        context.fillStyle = SETTINGS.courtBackgroundColor;
        context.fillRect(0, 0, SETTINGS.gameWidth, SETTINGS.gameHeight);

        context.fillStyle = SETTINGS.topBottomBorderColor;
        context.fillRect(0, 0, SETTINGS.gameWidth, SETTINGS.topBottomBorderHeight);
        context.fillRect(0, SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight, SETTINGS.gameWidth, SETTINGS.topBottomBorderHeight);

        context.strokeStyle = SETTINGS.centerLineColor;
        context.beginPath();
        context.setLineDash([SETTINGS.centerLineSegmentLength, SETTINGS.centerLineGapLength]);
        context.moveTo(SETTINGS.gameWidth / 2, SETTINGS.topBottomBorderHeight + SETTINGS.centerLineGapLength);
        context.lineTo(SETTINGS.gameWidth / 2, SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight);
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
        this.velocity = {
            vx: SETTINGS.ballSpeed,
            vy: SETTINGS.ballSpeed
        }
    }

    get collisionBox() {
        return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    update(dT) {
        let paddle1 = this.court.paddle1, paddle2 = this.court.paddle2
        if (this.collisionBox.overlaps(paddle1.collisionBox)) { // player 1 hits
            this.velocity.vx *= -1;
            this.x = paddle1.x + paddle1.width + this.radius;
        }
        else if (this.collisionBox.overlaps(paddle2.collisionBox)) { // player 2 hits
            this.velocity.vx *= -1;
            this.x = paddle2.x - this.radius;
        }

        if (this.y < this.court.bounds.upper + this.radius) {
            this.velocity.vy *= -1;
            this.y = this.court.bounds.upper + this.radius;
        }
        else if (this.y > this.court.bounds.lower - this.radius) {
            this.velocity.vy *= -1;
            this.y = this.court.bounds.lower - this.radius;
        }

        //if (this.x < this.court.bounds.left + this.radius) {
        //    this.velocity.vx *= -1;
        //    this.x = this.court.bounds.left + this.radius;
        //}
        //else if (this.x > this.court.bounds.right - this.radius) {
        //    this.velocity.vx *= -1;
        //    this.x = this.court.bounds.right - this.radius;
        //}

        this.x += this.velocity.vx * dT;
        this.y += this.velocity.vy * dT;
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.fillStyle = SETTINGS.ballColor;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get top() { return this.y; }
    get bottom() { return this.y + this.height; }

    overlaps(other) {
        return other.left < this.right && this.left < other.right && other.top < this.bottom && this.top < other.bottom;
    }

    contains(x, y) {
        return this.left < x && this.right > x && this.top < y && this.bottom > y;
    }
}

const canvas = document.getElementById("game");
canvas.width = SETTINGS.gameWidth;
canvas.height = SETTINGS.gameHeight;
new Game(canvas).start();
