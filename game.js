const SETTINGS = {
    ballColor: "white",
    ballRadius: 12,
    ballSpeed: 400,
    centerLineColor: "black",
    centerLineGapLength: 34,
    centerLineSegmentLength: 68,
    courtBackgroundColor: "green",
    gameFPS: 60,
    gameHeight: 900,
    gameWidth: 1200,
    paddleBounceSound: "/Sounds/Paddle.wav",
    paddleColor: "white",
    paddleHeight: 120,
    paddleLeftRightMargin: 34,
    paddleWidth: 40,
    scoreBoardFontFamily: "retro",
    scoreBoardFontSize: 10,
    scoreSound: "/Sounds/Score.wav",
    scoreToWinMatch: 8,
    startButtonColor: "white",
    startButtonFontFamily: "retro",
    startButtonFontSize: 14,
    startButtonHeight: 80,
    startButtonTextColor: "black",
    startButtonWidth: 200,
    topBottomBorderBounceSound: "/Sounds/Wall.wav",
    topBottomBorderColor: "blue",
    topBottomBorderHeight: 25
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
        }, 1000 / SETTINGS.gameFPS);
    }
}

class Court {
    constructor(canvas) {
        this.canvas = canvas;
        this.paddle1 = new Paddle(SETTINGS.paddleLeftRightMargin, SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerOne, this);
        this.paddle2 = new Paddle(SETTINGS.gameWidth - SETTINGS.paddleWidth - SETTINGS.paddleLeftRightMargin, SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PLAYERS.playerTwo, this);
        this.ball = new Ball(SETTINGS.gameWidth / 2, SETTINGS.gameHeight / 2, SETTINGS.ballRadius, this);
        this.paddleController1 = new MousePaddleController(this.paddle1);
        this.paddleController2 = new MousePaddleController(this.paddle2);
        this.scoreBoard = new ScoreBoard(0, 0, 1, this);
        this.isMatchRunning = false;
        this.startButton = new Rectangle(SETTINGS.gameWidth / 2 - SETTINGS.startButtonWidth / 2, SETTINGS.gameHeight / 2 - SETTINGS.startButtonHeight / 2, SETTINGS.startButtonWidth, SETTINGS.startButtonHeight);
        this.canvas.addEventListener("click", (e) => {
            if (!this.isMatchRunning && this.startButton.contains(e.clientX, e.clientY)) {
                this.startMatch();
            }
        });
    }

    get bounds() {
        return {
            upper: SETTINGS.topBottomBorderHeight,
            lower: SETTINGS.gameHeight - SETTINGS.topBottomBorderHeight,
            left: 0,
            right: SETTINGS.gameWidth
        };
    }

    update(dT) {
        if (this.isMatchRunning) {
            this.ball.update(dT);
        }
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
        this.scoreBoard.draw();

        if (!this.isMatchRunning) {
            context.fillStyle = SETTINGS.startButtonColor;
            context.fillRect(this.startButton.x, this.startButton.y, this.startButton.width, this.startButton.height);
            context.fillStyle = SETTINGS.startButtonTextColor;
            context.font = SETTINGS.startButtonFontSize + "px " + SETTINGS.startButtonFontFamily;
            context.textAlign = "center";
            if (this.scoreBoard.winner == undefined) {
                context.fillText("Start Match", SETTINGS.gameWidth / 2, SETTINGS.gameHeight / 2 + SETTINGS.startButtonFontSize / 2);
            }
            else {
                context.fillText("Start Again", SETTINGS.gameWidth / 2, SETTINGS.gameHeight / 2 + SETTINGS.startButtonFontSize / 2);
            }
        }
    }

    startMatch() {
        this.scoreBoard = new ScoreBoard(-1, 0, 0, this);
        this.onPlayerScore(PLAYERS.playerOne);
        this.isMatchRunning = true;
    }

    onPlayerScore(player) {
        if (player == PLAYERS.playerOne) {
            ++this.scoreBoard.player1Score;
        }
        else {
            ++this.scoreBoard.player2Score;
        }
        if (this.scoreBoard.winner == undefined) {
            ++this.scoreBoard.roundNumber;
        }
        else {
            this.isMatchRunning = false; // ends game
        }

        // respawn the ball
        let angle = Math.random() < 0.5 ? (2 / 3 + 2 / 3 * Math.random()) * Math.PI : (5 / 3 + 2 / 3 * Math.random()) % 2 * Math.PI;
        this.ball.velocity.vy = Math.sin(angle) * SETTINGS.ballSpeed;
        this.ball.velocity.vx = Math.cos(angle) * SETTINGS.ballSpeed;
        this.ball.x = SETTINGS.gameWidth / 2;
        this.ball.y = SETTINGS.gameHeight / 2;

        // reset paddle position
        this.paddle1.y = SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2;
        this.paddle2.y = SETTINGS.gameHeight / 2 - SETTINGS.paddleHeight / 2;
    }
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

class MousePaddleController {
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

class AIPaddleController {

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
        };
    }

    get collisionBox() {
        return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    update(dT) {
        if (this.x < this.court.bounds.left) { // player 2 scores
            this.court.onPlayerScore(PLAYERS.playerTwo);
        }
        else if (this.x > this.court.bounds.right) { // player 1 scores
            this.court.onPlayerScore(PLAYERS.playerOne);
        }
        else if (this.collisionBox.overlaps(this.court.paddle1.collisionBox)) { // player 1 hits
            this.velocity.vx *= -1;
            this.x = this.court.paddle1.x + this.court.paddle1.width + this.radius;
        }
        else if (this.collisionBox.overlaps(this.court.paddle2.collisionBox)) { // player 2 hits
            this.velocity.vx *= -1;
            this.x = this.court.paddle2.x - this.radius;
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

class ScoreBoard {
    constructor(player1Score, player2Score, roundNumber, court) {
        this.player1Score = player1Score;
        this.player2Score = player2Score;
        this.roundNumber = roundNumber;
        this.court = court;
    }

    get winner() {
        if (this.player1Score >= SETTINGS.scoreToWinMatch) {
            return PLAYERS.playerOne;
        }
        else if (this.player2Score >= SETTINGS.scoreToWinMatch) {
            return PLAYERS.playerTwo;
        }
        else {
            return undefined;
        }
    }

    draw() {
        let context = this.court.canvas.getContext("2d");
        context.font = SETTINGS.scoreBoardFontSize + "px " + SETTINGS.scoreBoardFontFamily;
        context.textAlign = "start";
        context.fillText(" Score: " + this.player1Score, 0, SETTINGS.topBottomBorderHeight / 2 + SETTINGS.scoreBoardFontSize / 2);
        context.textAlign = "center";

        let centerText = "";
        if (this.court.isMatchRunning) {
            centerText = "Round " + this.roundNumber;
        }
        else if (this.winner == undefined) {
            centerText = "Score 8 to win!";
        }
        else {
            centerText = this.winner == PLAYERS.playerOne ? "Player one wins!" : "Player two wins!";
        }

        context.fillText(centerText, SETTINGS.gameWidth / 2, SETTINGS.topBottomBorderHeight / 2 + SETTINGS.scoreBoardFontSize / 2);
        context.textAlign = "end";
        context.fillText("Score: " + this.player2Score + " ", SETTINGS.gameWidth, SETTINGS.topBottomBorderHeight / 2 + SETTINGS.scoreBoardFontSize / 2);
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
let game = new Game(canvas);
game.start();
