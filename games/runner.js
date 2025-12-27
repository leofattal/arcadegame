// Endless Runner Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.8;
const GROUND = canvas.height - 60;
const JUMP_POWER = 16;

// Game state
let gameState = {
    score: 0,
    distance: 0,
    coins: 0,
    speed: 6,
    isPaused: false,
    isGameOver: false,
    animationId: null
};

// Player
let player = {
    x: 100,
    y: GROUND,
    width: 40,
    height: 50,
    velocityY: 0,
    isJumping: false,
    isDucking: false
};

// Arrays for game objects
let obstacles = [];
let coins = [];
let clouds = [];
let groundLines = [];

// Obstacle types
const OBSTACLE_TYPES = [
    { width: 30, height: 40, color: '#8b0000', type: 'cactus' },
    { width: 50, height: 30, color: '#654321', type: 'rock' },
    { width: 40, height: 60, color: '#2d5016', type: 'tree' }
];

// Initialize background elements
function initBackground() {
    // Create clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: 30 + Math.random() * 80,
            width: 60 + Math.random() * 40,
            height: 30,
            speed: 0.5 + Math.random()
        });
    }

    // Create ground lines for parallax effect
    groundLines = [];
    for (let i = 0; i < 20; i++) {
        groundLines.push({
            x: i * 60,
            width: 40,
            height: 3
        });
    }
}

// Spawn obstacle
function spawnObstacle() {
    if (obstacles.length > 0) {
        const lastObstacle = obstacles[obstacles.length - 1];
        if (lastObstacle.x > canvas.width - 400) return; // Increased spacing
    }

    const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

    obstacles.push({
        x: canvas.width + 50, // Start slightly off screen
        y: GROUND - obstacleType.height,
        width: obstacleType.width,
        height: obstacleType.height,
        color: obstacleType.color,
        type: obstacleType.type
    });
}

// Spawn coin
function spawnCoin() {
    if (Math.random() < 0.3) { // 30% chance to spawn coin
        const height = GROUND - 80 - Math.random() * 100;

        coins.push({
            x: canvas.width,
            y: height,
            width: 25,
            height: 25,
            collected: false
        });
    }
}

// Draw player
function drawPlayer() {
    ctx.save();

    const playerY = player.isDucking ? player.y + 20 : player.y;
    const playerHeight = player.isDucking ? player.height - 20 : player.height;

    // Player body
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff006e';
    ctx.fillRect(player.x, playerY, player.width, playerHeight);

    // Head
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, playerY - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // Arms (moving effect)
    const armSwing = Math.sin(Date.now() / 100) * 5;
    ctx.fillStyle = '#ff006e';
    ctx.fillRect(player.x - 5, playerY + 10 + armSwing, 10, 20);
    ctx.fillRect(player.x + player.width - 5, playerY + 10 - armSwing, 10, 20);

    // Legs (running animation)
    if (!player.isJumping) {
        const legSwing = Math.sin(Date.now() / 100) * 10;
        ctx.fillRect(player.x + 5, playerY + playerHeight, 10, 15 + legSwing);
        ctx.fillRect(player.x + 25, playerY + playerHeight, 10, 15 - legSwing);
    } else {
        ctx.fillRect(player.x + 5, playerY + playerHeight, 10, 15);
        ctx.fillRect(player.x + 25, playerY + playerHeight, 10, 15);
    }

    ctx.restore();
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.save();
        ctx.fillStyle = obstacle.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = obstacle.color;

        if (obstacle.type === 'cactus') {
            // Cactus shape
            ctx.fillRect(obstacle.x + 10, obstacle.y, 10, obstacle.height);
            ctx.fillRect(obstacle.x, obstacle.y + 10, obstacle.width, 10);
        } else if (obstacle.type === 'rock') {
            // Rock shape (rounded)
            ctx.beginPath();
            ctx.ellipse(obstacle.x + obstacle.width / 2,
                       obstacle.y + obstacle.height / 2,
                       obstacle.width / 2, obstacle.height / 2,
                       0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Tree shape
            ctx.fillRect(obstacle.x + 12, obstacle.y + 20, 15, obstacle.height - 20);
            ctx.fillStyle = '#2d8016';
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 20, obstacle.y);
            ctx.lineTo(obstacle.x, obstacle.y + 25);
            ctx.lineTo(obstacle.x + 40, obstacle.y + 25);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (coin.collected) return;

        ctx.save();
        ctx.fillStyle = '#ffd60a';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd60a';

        // Rotating coin effect
        const rotation = (Date.now() / 10) % 360;
        const scale = Math.abs(Math.cos(rotation * Math.PI / 180));

        ctx.beginPath();
        ctx.ellipse(coin.x + coin.width / 2,
                   coin.y + coin.height / 2,
                   coin.width / 2 * scale,
                   coin.height / 2,
                   0, 0, Math.PI * 2);
        ctx.fill();

        // Dollar sign
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', coin.x + coin.width / 2, coin.y + coin.height / 2 + 5);

        ctx.restore();
    });
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clouds
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + 30, cloud.y - 10, cloud.width / 3, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + 50, cloud.y, cloud.width / 2.5, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ground
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, GROUND + player.height, canvas.width, canvas.height);

    // Ground lines (road marks)
    ctx.fillStyle = '#6b5345';
    groundLines.forEach(line => {
        ctx.fillRect(line.x, GROUND + player.height + 10, line.width, line.height);
    });
}

// Update game state
function update() {
    // Update distance and score
    gameState.distance += gameState.speed / 10;
    gameState.score = Math.floor(gameState.distance) + (gameState.coins * 10);

    // Increase speed over time
    gameState.speed = 6 + Math.floor(gameState.distance / 500) * 0.5;

    // Update player
    if (player.y < GROUND) {
        player.velocityY += GRAVITY;
    } else {
        player.y = GROUND;
        player.velocityY = 0;
        player.isJumping = false;
    }
    player.y += player.velocityY;

    // Update clouds
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = 30 + Math.random() * 80;
        }
    });

    // Update ground lines
    groundLines.forEach(line => {
        line.x -= gameState.speed;
        if (line.x + line.width < 0) {
            line.x = canvas.width;
        }
    });

    // Update and spawn obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    obstacles.forEach(obstacle => {
        obstacle.x -= gameState.speed;
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 400) {
        if (Math.random() < 0.015) { // Reduced spawn rate
            spawnObstacle();
        }
    }

    // Update coins
    coins = coins.filter(coin => !coin.collected && coin.x + coin.width > 0);
    coins.forEach(coin => {
        coin.x -= gameState.speed;
    });

    if (Math.random() < 0.01) {
        spawnCoin();
    }

    // Check collisions with obstacles
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            endGame();
        }
    });

    // Check coin collection
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            gameState.coins++;
        }
    });

    updateDisplay();
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    // Adjust player hitbox when ducking
    const playerY = player.isDucking ? rect1.y + 20 : rect1.y;
    const playerHeight = player.isDucking ? rect1.height - 20 : rect1.height;

    // Add small margin to make collision feel fair
    const margin = 5;

    return rect1.x + margin < rect2.x + rect2.width - margin &&
           rect1.x + rect1.width - margin > rect2.x + margin &&
           playerY + margin < rect2.y + rect2.height - margin &&
           playerY + playerHeight - margin > rect2.y + margin;
}

// Draw everything
function draw() {
    drawBackground();
    drawObstacles();
    drawCoins();
    drawPlayer();
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

// Jump
function jump() {
    if (!player.isJumping && player.y === GROUND) {
        player.velocityY = -JUMP_POWER;
        player.isJumping = true;
    }
}

// Update display
function updateDisplay() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('distanceDisplay').textContent = Math.floor(gameState.distance) + 'm';
    document.getElementById('coinsDisplay').textContent = gameState.coins;

    const highScore = Storage.getHighScore('runner');
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// End game
function endGame() {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId);

    const isNewHigh = Storage.setHighScore('runner', gameState.score);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('statsMessage').textContent =
        `Distance: ${Math.floor(gameState.distance)}m | Coins: ${gameState.coins}`;

    if (isNewHigh) {
        document.getElementById('highScoreMessage').textContent = '🏆 New High Score!';
    } else {
        const highScore = Storage.getHighScore('runner');
        document.getElementById('highScoreMessage').textContent = `High Score: ${highScore}`;
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.isDucking = true;
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.isDucking = false;
    }
});

// Mobile controls
document.getElementById('mobileJump').addEventListener('click', jump);

// Allow tapping anywhere on canvas to jump
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
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
        distance: 0,
        coins: 0,
        speed: 6,
        isPaused: false,
        isGameOver: false,
        animationId: null
    };

    player.y = GROUND;
    player.velocityY = 0;
    player.isJumping = false;
    player.isDucking = false;

    obstacles = [];
    coins = [];

    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    initBackground();
    updateDisplay();
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
initBackground();
updateDisplay();
gameLoop();
