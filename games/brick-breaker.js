// Brick Breaker Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 90;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 35;

// Game state
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isPaused: false,
    isGameOver: false,
    animationId: null
};

// Paddle
let paddle = {
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
    dx: 0
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 4,
    dx: 4 * (Math.random() > 0.5 ? 1 : -1),
    dy: -4,
    launched: false
};

// Bricks
let bricks = [];
const brickColors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffd60a'];

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            bricks[row][col] = {
                x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
                status: 1,
                color: brickColors[row % brickColors.length]
            };
        }
    }
}

// Draw paddle
function drawPaddle() {
    ctx.fillStyle = '#06ffa5';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06ffa5';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff006e';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

// Draw bricks
function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.status === 1) {
                ctx.fillStyle = brick.color;
                ctx.shadowBlur = 5;
                ctx.shadowColor = brick.color;
                ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.shadowBlur = 0;

                // Add border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
            }
        });
    });
}

// Move paddle
function movePaddle() {
    paddle.x += paddle.dx;

    // Wall collision detection
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Move ball
function moveBall() {
    if (!ball.launched) {
        // Ball follows paddle until launched
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate hit position on paddle for angle change
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees

        const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
    }

    // Ball falls below paddle
    if (ball.y + ball.radius > canvas.height) {
        gameState.lives--;
        updateDisplay();

        if (gameState.lives <= 0) {
            endGame(false);
        } else {
            resetBall();
        }
    }
}

// Brick collision detection
function brickCollision() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + BRICK_WIDTH &&
                    ball.y > brick.y &&
                    ball.y < brick.y + BRICK_HEIGHT
                ) {
                    ball.dy *= -1;
                    brick.status = 0;
                    gameState.score += 10;
                    updateDisplay();

                    // Check if level complete
                    if (isLevelComplete()) {
                        nextLevel();
                    }
                }
            }
        });
    });
}

// Check if level is complete
function isLevelComplete() {
    return bricks.every(row => row.every(brick => brick.status === 0));
}

// Next level
function nextLevel() {
    gameState.level++;
    ball.speed += 0.5;
    initBricks();
    resetBall();
    updateDisplay();
}

// Reset ball
function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = (4 + gameState.level * 0.3) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -(4 + gameState.level * 0.3);
    ball.launched = false;
}

// Update display
function updateDisplay() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('livesDisplay').textContent = gameState.lives;
    document.getElementById('levelDisplay').textContent = gameState.level;

    const highScore = Storage.getHighScore('brick-breaker');
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) {
        return;
    }

    draw();
    movePaddle();
    moveBall();
    brickCollision();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

// End game
function endGame(won) {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId);

    // Update high score
    const isNewHigh = Storage.setHighScore('brick-breaker', gameState.score);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverTitle').textContent = won ? '🎉 You Win!' : '💥 Game Over!';

    if (isNewHigh) {
        document.getElementById('highScoreMessage').textContent = '🏆 New High Score!';
    } else {
        const highScore = Storage.getHighScore('brick-breaker');
        document.getElementById('highScoreMessage').textContent = `High Score: ${highScore}`;
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!ball.launched && !gameState.isPaused) {
            ball.launched = true;
        }
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = false;
    }
});

// Update paddle direction based on keys
setInterval(() => {
    if (rightPressed) {
        paddle.dx = paddle.speed;
    } else if (leftPressed) {
        paddle.dx = -paddle.speed;
    } else {
        paddle.dx = 0;
    }
}, 16);

// Mouse/Touch controls
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    paddle.x = touchX - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener('click', () => {
    if (!ball.launched && !gameState.isPaused) {
        ball.launched = true;
    }
});

// Button controls
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('quitBtn').addEventListener('click', quitGame);
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseScreen').style.display = gameState.isPaused ? 'flex' : 'none';

    if (!gameState.isPaused) {
        gameLoop();
    }
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseScreen').style.display = 'none';
    gameLoop();
}

function restartGame() {
    gameState = {
        score: 0,
        lives: 3,
        level: 1,
        isPaused: false,
        isGameOver: false,
        animationId: null
    };

    paddle.x = canvas.width / 2 - PADDLE_WIDTH / 2;
    initBricks();
    resetBall();
    updateDisplay();

    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    gameLoop();
}

function quitGame() {
    window.location.href = '../index.html';
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Initialize game
initBricks();
updateDisplay();
gameLoop();
