// Pong Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const WINNING_SCORE = 5;

// Difficulty settings
const DIFFICULTIES = {
    easy: { cpuSpeed: 3, ballSpeed: 4 },
    medium: { cpuSpeed: 5, ballSpeed: 5 },
    hard: { cpuSpeed: 7, ballSpeed: 6 }
};

// Game state
let gameState = {
    playerScore: 0,
    cpuScore: 0,
    difficulty: 'easy',
    isPaused: false,
    isGameOver: false,
    hasStarted: false,
    animationId: null
};

// Player paddle
let player = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 6,
    dy: 0
};

// CPU paddle
let cpu = {
    x: canvas.width - 30,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 4
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: 4,
    dy: 4,
    speed: 4
};

// Initialize difficulty buttons
function setupDifficultyButtons() {
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
        });
    });
}

// Reset ball
function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const difficulty = DIFFICULTIES[gameState.difficulty];
    ball.speed = difficulty.ballSpeed;
    ball.dx = ball.speed * direction;
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
}

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw net
function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 2, i, 4, 10, 'rgba(6, 255, 165, 0.3)');
    }
}

// Draw paddles
function drawPaddles() {
    // Player paddle
    ctx.fillStyle = '#3a86ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3a86ff';
    drawRect(player.x, player.y, player.width, player.height, '#3a86ff');
    ctx.shadowBlur = 0;

    // CPU paddle
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff006e';
    drawRect(cpu.x, cpu.y, cpu.width, cpu.height, '#ff006e');
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#06ffa5';
    drawCircle(ball.x, ball.y, ball.size / 2, '#06ffa5');
    ctx.shadowBlur = 0;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawNet();
    drawPaddles();
    drawBall();
}

// Update game state
function update() {
    // Move player paddle
    player.y += player.dy;

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // CPU AI
    const difficulty = DIFFICULTIES[gameState.difficulty];
    const cpuCenter = cpu.y + cpu.height / 2;
    const ballCenter = ball.y;

    if (cpuCenter < ballCenter - 35) {
        cpu.y += difficulty.cpuSpeed;
    } else if (cpuCenter > ballCenter + 35) {
        cpu.y -= difficulty.cpuSpeed;
    }

    // Keep CPU paddle in bounds
    if (cpu.y < 0) cpu.y = 0;
    if (cpu.y + cpu.height > canvas.height) {
        cpu.y = canvas.height - cpu.height;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top/bottom
    if (ball.y - ball.size / 2 < 0 || ball.y + ball.size / 2 > canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with player paddle
    if (ball.x - ball.size / 2 < player.x + player.width &&
        ball.x + ball.size / 2 > player.x &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {

        // Calculate angle based on where ball hit paddle
        const hitPos = (ball.y - player.y) / player.height;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees

        ball.dx = Math.abs(ball.dx);
        ball.dy = ball.speed * Math.sin(angle) * 2;

        // Increase speed slightly
        ball.speed *= 1.05;
        ball.dx = ball.speed;
    }

    // Ball collision with CPU paddle
    if (ball.x + ball.size / 2 > cpu.x &&
        ball.x - ball.size / 2 < cpu.x + cpu.width &&
        ball.y > cpu.y &&
        ball.y < cpu.y + cpu.height) {

        const hitPos = (ball.y - cpu.y) / cpu.height;
        const angle = (hitPos - 0.5) * Math.PI / 3;

        ball.dx = -Math.abs(ball.dx);
        ball.dy = ball.speed * Math.sin(angle) * 2;

        ball.speed *= 1.05;
        ball.dx = -ball.speed;
    }

    // Score points
    if (ball.x - ball.size / 2 < 0) {
        gameState.cpuScore++;
        updateScore();
        resetBall(1);
        checkWin();
    } else if (ball.x + ball.size / 2 > canvas.width) {
        gameState.playerScore++;
        updateScore();
        resetBall(-1);
        checkWin();
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('cpuScore').textContent = gameState.cpuScore;
}

// Check for winner
function checkWin() {
    if (gameState.playerScore >= WINNING_SCORE) {
        endGame(true);
    } else if (gameState.cpuScore >= WINNING_SCORE) {
        endGame(false);
    }
}

// Game loop
function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) {
        return;
    }

    update();
    draw();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    gameState.hasStarted = true;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.playerScore = 0;
    gameState.cpuScore = 0;

    cpu.speed = DIFFICULTIES[gameState.difficulty].cpuSpeed;
    resetBall();

    document.getElementById('startScreen').style.display = 'none';

    updateScore();
    gameLoop();
}

// End game
function endGame(playerWon) {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId);

    if (playerWon) {
        document.getElementById('winnerTitle').textContent = '🏆 You Win!';
        document.getElementById('winnerMessage').textContent = 'Great job! You beat the CPU!';

        // Save win
        const wins = Storage.get('pongWins') || 0;
        Storage.set('pongWins', wins + 1);
    } else {
        document.getElementById('winnerTitle').textContent = '💀 You Lose!';
        document.getElementById('winnerMessage').textContent = 'Better luck next time!';
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }

    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update paddle movement
setInterval(() => {
    player.dy = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = player.speed;
}, 16);

// Mobile controls
document.getElementById('mobileUp').addEventListener('touchstart', () => keys['w'] = true);
document.getElementById('mobileUp').addEventListener('touchend', () => keys['w'] = false);
document.getElementById('mobileUp').addEventListener('mousedown', () => keys['w'] = true);
document.getElementById('mobileUp').addEventListener('mouseup', () => keys['w'] = false);

document.getElementById('mobileDown').addEventListener('touchstart', () => keys['s'] = true);
document.getElementById('mobileDown').addEventListener('touchend', () => keys['s'] = false);
document.getElementById('mobileDown').addEventListener('mousedown', () => keys['s'] = true);
document.getElementById('mobileDown').addEventListener('mouseup', () => keys['s'] = false);

// Button controls
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('quitBtn').addEventListener('click', quitGame);
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

function togglePause() {
    if (!gameState.hasStarted || gameState.isGameOver) return;

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
    cancelAnimationFrame(gameState.animationId);
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    gameState.hasStarted = false;
}

function quitGame() {
    cancelAnimationFrame(gameState.animationId);
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

// Initialize
setupDifficultyButtons();
draw();
