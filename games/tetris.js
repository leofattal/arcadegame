// Tetris Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes
const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Game state
let gameState = {
    score: 0,
    lines: 0,
    level: 1,
    isPaused: false,
    isGameOver: false,
    dropInterval: null,
    dropSpeed: 1000
};

// Game board
let board = [];

// Current piece
let currentPiece = null;
let nextPiece = null;

// Initialize board
function initBoard() {
    board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

// Create new piece
function createPiece() {
    const shapes = Object.keys(SHAPES);
    const type = shapes[Math.floor(Math.random() * shapes.length)];

    return {
        type: type,
        shape: SHAPES[type],
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0,
        color: COLORS[type]
    };
}

// Draw block
function drawBlock(x, y, color, context = ctx) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // Border
    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 2;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // Highlight
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE / 3, BLOCK_SIZE / 3);
}

// Draw board
function drawBoard() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }
}

// Draw next piece
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;

        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    drawBlock(offsetX + x, offsetY + y, nextPiece.color, nextCtx);
                }
            }
        }
    }
}

// Check collision
function checkCollision(piece, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;

                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return true;
                }

                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Move piece
function movePiece(dx, dy) {
    if (!currentPiece || gameState.isPaused || gameState.isGameOver) return false;

    if (!checkCollision(currentPiece, dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Rotate piece
function rotatePiece() {
    if (!currentPiece || gameState.isPaused || gameState.isGameOver) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );

    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;

    // Wall kick
    if (checkCollision(currentPiece, 0, 0)) {
        // Try shifting left/right
        if (!checkCollision(currentPiece, -1, 0)) {
            currentPiece.x--;
        } else if (!checkCollision(currentPiece, 1, 0)) {
            currentPiece.x++;
        } else if (!checkCollision(currentPiece, -2, 0)) {
            currentPiece.x -= 2;
        } else if (!checkCollision(currentPiece, 2, 0)) {
            currentPiece.x += 2;
        } else {
            currentPiece.shape = previousShape;
        }
    }
}

// Hard drop
function hardDrop() {
    if (!currentPiece || gameState.isPaused || gameState.isGameOver) return;

    while (movePiece(0, 1)) {
        gameState.score += 2;
    }
    lockPiece();
}

// Lock piece
function lockPiece() {
    if (!currentPiece) return;

    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;

                if (boardY < 0) {
                    endGame();
                    return;
                }

                board[boardY][boardX] = currentPiece.color;
            }
        }
    }

    clearLines();
    spawnNewPiece();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check same row again
        }
    }

    if (linesCleared > 0) {
        gameState.lines += linesCleared;

        // Scoring: 100, 300, 500, 800 for 1-4 lines
        const scores = [0, 100, 300, 500, 800];
        gameState.score += scores[linesCleared] * gameState.level;

        // Level up every 10 lines
        const newLevel = Math.floor(gameState.lines / 10) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            gameState.dropSpeed = Math.max(100, 1000 - (gameState.level - 1) * 100);
            restartDropInterval();
        }

        updateDisplay();
    }
}

// Spawn new piece
function spawnNewPiece() {
    currentPiece = nextPiece || createPiece();
    nextPiece = createPiece();

    if (checkCollision(currentPiece, 0, 0)) {
        endGame();
    }

    drawNextPiece();
}

// Drop piece automatically
function dropPiece() {
    if (gameState.isPaused || gameState.isGameOver) return;

    if (!movePiece(0, 1)) {
        lockPiece();
    }
    drawBoard();
}

// Start drop interval
function startDropInterval() {
    if (gameState.dropInterval) {
        clearInterval(gameState.dropInterval);
    }
    gameState.dropInterval = setInterval(dropPiece, gameState.dropSpeed);
}

// Restart drop interval
function restartDropInterval() {
    startDropInterval();
}

// Update display
function updateDisplay() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('linesDisplay').textContent = gameState.lines;
    document.getElementById('levelDisplay').textContent = gameState.level;

    const highScore = Storage.getHighScore('tetris');
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// End game
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.dropInterval);

    const isNewHigh = Storage.setHighScore('tetris', gameState.score);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('statsMessage').textContent = `Lines: ${gameState.lines} | Level: ${gameState.level}`;

    if (isNewHigh) {
        document.getElementById('highScoreMessage').textContent = '🏆 New High Score!';
    } else {
        const highScore = Storage.getHighScore('tetris');
        document.getElementById('highScoreMessage').textContent = `High Score: ${highScore}`;
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePiece(-1, 0);
        drawBoard();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePiece(1, 0);
        drawBoard();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (movePiece(0, 1)) {
            gameState.score += 1;
        }
        drawBoard();
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        rotatePiece();
        drawBoard();
    } else if (e.key === ' ') {
        e.preventDefault();
        hardDrop();
        drawBoard();
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

// Mobile controls
document.getElementById('mobileLeft').addEventListener('click', () => {
    movePiece(-1, 0);
    drawBoard();
});

document.getElementById('mobileRight').addEventListener('click', () => {
    movePiece(1, 0);
    drawBoard();
});

document.getElementById('mobileDown').addEventListener('click', () => {
    if (movePiece(0, 1)) {
        gameState.score += 1;
    }
    drawBoard();
});

document.getElementById('mobileRotate').addEventListener('click', () => {
    rotatePiece();
    drawBoard();
});

document.getElementById('mobileDrop').addEventListener('click', () => {
    hardDrop();
    drawBoard();
});

// Button controls
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('quitBtn').addEventListener('click', quitGame);
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

function togglePause() {
    if (gameState.isGameOver) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseScreen').style.display = gameState.isPaused ? 'flex' : 'none';
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseScreen').style.display = 'none';
}

function restartGame() {
    clearInterval(gameState.dropInterval);

    gameState = {
        score: 0,
        lines: 0,
        level: 1,
        isPaused: false,
        isGameOver: false,
        dropInterval: null,
        dropSpeed: 1000
    };

    initBoard();
    nextPiece = createPiece();
    spawnNewPiece();

    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    updateDisplay();
    startDropInterval();
    drawBoard();
    drawNextPiece();
}

function quitGame() {
    clearInterval(gameState.dropInterval);
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
initBoard();
nextPiece = createPiece();
spawnNewPiece();
updateDisplay();
startDropInterval();
drawBoard();
drawNextPiece();
