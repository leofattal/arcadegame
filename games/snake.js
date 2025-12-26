// Snake Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

// Difficulty settings
const DIFFICULTIES = {
    easy: { speed: 150, scoreMultiplier: 1 },
    medium: { speed: 100, scoreMultiplier: 2 },
    hard: { speed: 60, scoreMultiplier: 3 }
};

// Game state
let gameState = {
    score: 0,
    length: 3,
    difficulty: 'easy',
    isPaused: false,
    isGameOver: false,
    hasStarted: false,
    gameInterval: null
};

// Snake
let snake = {
    body: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 }
};

// Food
let food = {
    x: 15,
    y: 15
};

// Colors
const COLORS = {
    snake: '#06ffa5',
    snakeHead: '#3a86ff',
    food: '#ff006e',
    grid: 'rgba(255, 255, 255, 0.05)'
};

// Initialize game
function init() {
    setupDifficultyButtons();
    updateDisplay();
}

// Setup difficulty buttons
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

// Start game
function startGame() {
    gameState.hasStarted = true;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.length = 3;

    // Reset snake
    snake.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snake.direction = { x: 1, y: 0 };
    snake.nextDirection = { x: 1, y: 0 };

    // Place food
    placeFood();

    // Hide start screen
    document.getElementById('startScreen').style.display = 'none';

    // Update display
    updateDisplay();

    // Start game loop
    const speed = DIFFICULTIES[gameState.difficulty].speed;
    gameState.gameInterval = setInterval(gameLoop, speed);
}

// Game loop
function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) {
        return;
    }

    update();
    draw();
}

// Update game state
function update() {
    // Update direction
    snake.direction = { ...snake.nextDirection };

    // Move snake
    const head = { ...snake.body[0] };
    head.x += snake.direction.x;
    head.y += snake.direction.y;

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.body.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.body.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        const multiplier = DIFFICULTIES[gameState.difficulty].scoreMultiplier;
        gameState.score += 10 * multiplier;
        gameState.length++;
        placeFood();
        updateDisplay();
    } else {
        // Remove tail if no food eaten
        snake.body.pop();
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw food
    drawFood();

    // Draw snake
    drawSnake();
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    snake.body.forEach((segment, index) => {
        const isHead = index === 0;

        ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;
        ctx.shadowBlur = 10;
        ctx.shadowColor = isHead ? COLORS.snakeHead : COLORS.snake;

        const x = segment.x * TILE_SIZE;
        const y = segment.y * TILE_SIZE;

        // Draw rounded rectangle for segments
        roundRect(ctx, x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 4);

        // Draw eyes on head
        if (isHead) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0f3460';
            const eyeSize = 3;
            const eyeOffset = TILE_SIZE / 3;

            if (snake.direction.x === 1) { // Right
                ctx.fillRect(x + eyeOffset + 5, y + 8, eyeSize, eyeSize);
                ctx.fillRect(x + eyeOffset + 5, y + TILE_SIZE - 11, eyeSize, eyeSize);
            } else if (snake.direction.x === -1) { // Left
                ctx.fillRect(x + 8, y + 8, eyeSize, eyeSize);
                ctx.fillRect(x + 8, y + TILE_SIZE - 11, eyeSize, eyeSize);
            } else if (snake.direction.y === 1) { // Down
                ctx.fillRect(x + 8, y + eyeOffset + 5, eyeSize, eyeSize);
                ctx.fillRect(x + TILE_SIZE - 11, y + eyeOffset + 5, eyeSize, eyeSize);
            } else { // Up
                ctx.fillRect(x + 8, y + 8, eyeSize, eyeSize);
                ctx.fillRect(x + TILE_SIZE - 11, y + 8, eyeSize, eyeSize);
            }
        }
    });

    ctx.shadowBlur = 0;
}

// Draw food
function drawFood() {
    ctx.fillStyle = COLORS.food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.food;

    const x = food.x * TILE_SIZE;
    const y = food.y * TILE_SIZE;

    // Draw pulsing food
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.beginPath();
    ctx.arc(
        x + TILE_SIZE / 2,
        y + TILE_SIZE / 2,
        TILE_SIZE / 2 - 4 + pulse,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
}

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Place food
function placeFood() {
    let validPosition = false;

    while (!validPosition) {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);

        // Check if food is on snake
        validPosition = !snake.body.some(
            segment => segment.x === food.x && segment.y === food.y
        );
    }
}

// Update display
function updateDisplay() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('lengthDisplay').textContent = gameState.length;

    const highScore = Storage.getHighScore('snake');
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// End game
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameInterval);

    // Update high score
    const isNewHigh = Storage.setHighScore('snake', gameState.score);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('lengthMessage').textContent = `Length: ${gameState.length}`;

    if (isNewHigh) {
        document.getElementById('highScoreMessage').textContent = '🏆 New High Score!';
    } else {
        const highScore = Storage.getHighScore('snake');
        document.getElementById('highScoreMessage').textContent = `High Score: ${highScore}`;
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Change direction
function changeDirection(newDirection) {
    // Prevent reversing direction
    if (
        (newDirection.x === 1 && snake.direction.x !== -1) ||
        (newDirection.x === -1 && snake.direction.x !== 1) ||
        (newDirection.y === 1 && snake.direction.y !== -1) ||
        (newDirection.y === -1 && snake.direction.y !== 1)
    ) {
        snake.nextDirection = newDirection;
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.hasStarted) return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        changeDirection({ x: 0, y: -1 });
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        changeDirection({ x: 0, y: 1 });
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeDirection({ x: -1, y: 0 });
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeDirection({ x: 1, y: 0 });
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

// Mobile controls
document.getElementById('upBtn').addEventListener('click', () => {
    changeDirection({ x: 0, y: -1 });
});

document.getElementById('downBtn').addEventListener('click', () => {
    changeDirection({ x: 0, y: 1 });
});

document.getElementById('leftBtn').addEventListener('click', () => {
    changeDirection({ x: -1, y: 0 });
});

document.getElementById('rightBtn').addEventListener('click', () => {
    changeDirection({ x: 1, y: 0 });
});

// Button controls
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('quitBtn').addEventListener('click', quitGame);
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

function togglePause() {
    if (!gameState.hasStarted || gameState.isGameOver) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseScreen').style.display = gameState.isPaused ? 'flex' : 'none';
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseScreen').style.display = 'none';
}

function restartGame() {
    clearInterval(gameState.gameInterval);
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    gameState.hasStarted = false;
}

function quitGame() {
    clearInterval(gameState.gameInterval);
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

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                changeDirection({ x: 1, y: 0 }); // Right
            } else {
                changeDirection({ x: -1, y: 0 }); // Left
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                changeDirection({ x: 0, y: 1 }); // Down
            } else {
                changeDirection({ x: 0, y: -1 }); // Up
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Initialize
init();
