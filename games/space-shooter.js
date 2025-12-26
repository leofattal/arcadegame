// Space Shooter Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isPaused: false,
    isGameOver: false,
    animationId: null
};

// Player ship
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 6,
    dx: 0,
    dy: 0
};

// Arrays for game objects
let bullets = [];
let enemies = [];
let explosions = [];
let stars = [];

// Game constants
const BULLET_SPEED = 7;
const ENEMY_SPEED_BASE = 1;
const FIRE_RATE = 250; // milliseconds
let lastFireTime = 0;

// Initialize stars for background
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: 0.5 + Math.random() * 1.5
        });
    }
}

// Create enemies in formation
function createEnemies() {
    enemies = [];
    const rows = 3 + gameState.level;
    const cols = 5 + gameState.level;
    const enemyWidth = 40;
    const enemyHeight = 40;
    const spacing = 60;
    const offsetX = (canvas.width - (cols * spacing)) / 2;
    const offsetY = 50;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: offsetX + col * spacing,
                y: offsetY + row * spacing,
                width: enemyWidth,
                height: enemyHeight,
                speed: ENEMY_SPEED_BASE + (gameState.level * 0.2),
                direction: 1,
                type: row % 3 // Different enemy types
            });
        }
    }
}

// Draw player ship
function drawPlayer() {
    ctx.save();

    // Ship body
    ctx.fillStyle = '#3a86ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3a86ff';

    // Main triangle
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#06ffa5';
    ctx.fillRect(player.x - 10, player.y + player.height - 20, 15, 20);
    ctx.fillRect(player.x + player.width - 5, player.y + player.height - 20, 15, 20);

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 20, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();

        let color;
        switch(enemy.type) {
            case 0: color = '#ff006e'; break;
            case 1: color = '#ffd60a'; break;
            case 2: color = '#8338ec'; break;
        }

        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        // Alien body
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(enemy.x + 12, enemy.y + 15, 4, 0, Math.PI * 2);
        ctx.arc(enemy.x + 28, enemy.y + 15, 4, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 10, enemy.y + 5);
        ctx.lineTo(enemy.x + 5, enemy.y - 5);
        ctx.moveTo(enemy.x + 30, enemy.y + 5);
        ctx.lineTo(enemy.x + 35, enemy.y - 5);
        ctx.stroke();

        ctx.restore();
    });
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = '#06ffa5';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06ffa5';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.globalAlpha = 0.5 + (star.size / 4);
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// Draw explosions
function drawExplosions() {
    explosions.forEach(explosion => {
        ctx.save();
        ctx.globalAlpha = explosion.alpha;
        ctx.fillStyle = explosion.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = explosion.color;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Create explosion effect
function createExplosion(x, y, color) {
    explosions.push({
        x: x,
        y: y,
        radius: 5,
        alpha: 1,
        color: color,
        maxRadius: 30
    });
}

// Update game state
function update() {
    // Move player
    player.x += player.dx;
    player.y += player.dy;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Move stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Move bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        return bullet.y > 0;
    });

    // Move enemies
    let changeDirection = false;
    enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            changeDirection = true;
        }
    });

    if (changeDirection) {
        enemies.forEach(enemy => {
            enemy.direction *= -1;
            enemy.y += 20;
        });
    }

    // Check bullet-enemy collisions
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                // Remove bullet and enemy
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);

                // Add score
                gameState.score += 10 * gameState.level;

                // Create explosion
                createExplosion(enemy.x + enemy.width / 2,
                              enemy.y + enemy.height / 2,
                              ['#ff006e', '#ffd60a', '#8338ec'][enemy.type]);

                updateDisplay();
            }
        });
    });

    // Update explosions
    explosions = explosions.filter(explosion => {
        explosion.radius += 2;
        explosion.alpha -= 0.05;
        return explosion.alpha > 0;
    });

    // Check if all enemies destroyed
    if (enemies.length === 0) {
        nextLevel();
    }

    // Check if enemies reached bottom
    enemies.forEach(enemy => {
        if (enemy.y + enemy.height >= canvas.height - 100) {
            loseLife();
        }
    });

    // Check player-enemy collision
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            loseLife();
        }
    });
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawExplosions();
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

// Fire bullet
function fireBullet() {
    const now = Date.now();
    if (now - lastFireTime < FIRE_RATE) return;

    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15
    });

    lastFireTime = now;
}

// Lose life
function loseLife() {
    gameState.lives--;
    updateDisplay();

    createExplosion(player.x + player.width / 2,
                   player.y + player.height / 2,
                   '#3a86ff');

    if (gameState.lives <= 0) {
        endGame();
    } else {
        // Reset player position
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 80;

        // Clear enemies near player
        enemies = enemies.filter(enemy =>
            Math.abs(enemy.y - player.y) > 100
        );
    }
}

// Next level
function nextLevel() {
    gameState.level++;
    gameState.score += 100 * gameState.level;
    updateDisplay();
    createEnemies();
}

// Update display
function updateDisplay() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('livesDisplay').textContent = gameState.lives;
    document.getElementById('levelDisplay').textContent = gameState.level;

    const highScore = Storage.getHighScore('space-shooter');
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// End game
function endGame() {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationId);

    const isNewHigh = Storage.setHighScore('space-shooter', gameState.score);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverTitle').textContent =
        gameState.level > 5 ? '🏆 Great Job!' : '💥 Game Over!';

    if (isNewHigh) {
        document.getElementById('highScoreMessage').textContent = '🏆 New High Score!';
    } else {
        const highScore = Storage.getHighScore('space-shooter');
        document.getElementById('highScoreMessage').textContent = `High Score: ${highScore}`;
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        fireBullet();
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update player movement
setInterval(() => {
    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.dx = player.speed;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = player.speed;
}, 16);

// Mobile controls
document.getElementById('mobileLeft').addEventListener('touchstart', () => keys['a'] = true);
document.getElementById('mobileLeft').addEventListener('touchend', () => keys['a'] = false);

document.getElementById('mobileRight').addEventListener('touchstart', () => keys['d'] = true);
document.getElementById('mobileRight').addEventListener('touchend', () => keys['d'] = false);

document.getElementById('mobileUp').addEventListener('touchstart', () => keys['w'] = true);
document.getElementById('mobileUp').addEventListener('touchend', () => keys['w'] = false);

document.getElementById('mobileDown').addEventListener('touchstart', () => keys['s'] = true);
document.getElementById('mobileDown').addEventListener('touchend', () => keys['s'] = false);

document.getElementById('mobileFire').addEventListener('click', fireBullet);

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

    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    bullets = [];
    explosions = [];

    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    initStars();
    createEnemies();
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
initStars();
createEnemies();
updateDisplay();
gameLoop();
