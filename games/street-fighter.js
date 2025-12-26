// Street Brawler Fighting Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.8;
const GROUND = canvas.height - 100;

// Game state
let gameState = {
    isPaused: false,
    isGameOver: false,
    hasStarted: false,
    animationId: null,
    timeLeft: 99,
    timerInterval: null
};

// Fighter class
class Fighter {
    constructor(x, color, keys, isPlayer = true) {
        this.x = x;
        this.y = GROUND;
        this.width = 60;
        this.height = 120;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.isJumping = false;
        this.isCrouching = false;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.facingRight = x < canvas.width / 2;

        // Combat
        this.maxHealth = 100;
        this.health = 100;
        this.damage = 10;
        this.specialEnergy = 0;
        this.maxSpecialEnergy = 100;

        // Animation
        this.attackFrame = 0;
        this.hurtFrame = 0;

        // Controls
        this.keys = keys;
        this.isPlayer = isPlayer;

        // AI properties
        if (!isPlayer) {
            this.aiTimer = 0;
            this.aiAction = 'idle';
            this.aiCooldown = 0;
        }
    }

    update(opponent) {
        if (this.isPlayer) {
            this.handleInput();
        } else {
            this.updateAI(opponent);
        }

        // Apply gravity
        if (this.y < GROUND) {
            this.velocityY += GRAVITY;
        } else {
            this.y = GROUND;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary check
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        // Face opponent
        this.facingRight = this.x < opponent.x;

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // Update attack animation
        if (this.attackFrame > 0) {
            this.attackFrame--;
        }

        // Update hurt animation
        if (this.hurtFrame > 0) {
            this.hurtFrame--;
        }

        // Regenerate special energy slowly
        if (this.specialEnergy < this.maxSpecialEnergy && !this.isAttacking) {
            this.specialEnergy += 0.2;
        }
    }

    handleInput() {
        this.velocityX = 0;

        if (keys[this.keys.left]) {
            this.velocityX = -this.speed;
        }
        if (keys[this.keys.right]) {
            this.velocityX = this.speed;
        }
        if (keys[this.keys.jump] && !this.isJumping && this.y === GROUND) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
        }

        this.isCrouching = keys[this.keys.down] && this.y === GROUND;
    }

    attack(type, opponent) {
        if (this.attackCooldown > 0) return;

        this.isAttacking = true;
        this.attackFrame = 15;
        this.attackCooldown = 30;

        let damage = this.damage;
        let range = 80;

        if (type === 'kick') {
            damage = this.damage * 1.5;
            range = 100;
        } else if (type === 'special' && this.specialEnergy >= this.maxSpecialEnergy) {
            damage = this.damage * 3;
            range = 150;
            this.specialEnergy = 0;
            this.createSpecialEffect();
        }

        // Check if attack hits
        const distance = Math.abs(this.x - opponent.x);
        if (distance < range) {
            opponent.takeDamage(damage);
        }

        setTimeout(() => {
            this.isAttacking = false;
        }, 200);
    }

    takeDamage(damage) {
        this.health -= damage;
        this.hurtFrame = 10;

        if (this.health < 0) {
            this.health = 0;
        }

        // Knockback
        this.velocityX = this.facingRight ? -5 : 5;
    }

    createSpecialEffect() {
        // Visual effect for special move
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.color;

        const effectX = this.facingRight ? this.x + this.width : this.x - 100;
        ctx.fillRect(effectX, this.y, 100, this.height);

        ctx.restore();
    }

    updateAI(opponent) {
        this.aiCooldown--;

        const distance = Math.abs(this.x - opponent.x);

        // Decision making
        if (this.aiCooldown <= 0) {
            const rand = Math.random();

            if (distance > 200) {
                // Move closer
                this.aiAction = 'approach';
                this.aiCooldown = 30;
            } else if (distance < 100) {
                if (rand < 0.4) {
                    this.aiAction = 'attack';
                    this.aiCooldown = 40;
                } else if (rand < 0.6) {
                    this.aiAction = 'retreat';
                    this.aiCooldown = 20;
                } else if (rand < 0.8 && !this.isJumping) {
                    this.aiAction = 'jump';
                    this.aiCooldown = 50;
                } else {
                    this.aiAction = 'special';
                    this.aiCooldown = 60;
                }
            } else {
                if (rand < 0.7) {
                    this.aiAction = 'approach';
                } else {
                    this.aiAction = 'jump';
                }
                this.aiCooldown = 25;
            }
        }

        // Execute action
        this.velocityX = 0;

        switch(this.aiAction) {
            case 'approach':
                this.velocityX = opponent.x > this.x ? this.speed : -this.speed;
                break;
            case 'retreat':
                this.velocityX = opponent.x > this.x ? -this.speed : this.speed;
                break;
            case 'jump':
                if (!this.isJumping && this.y === GROUND) {
                    this.velocityY = -this.jumpPower;
                    this.isJumping = true;
                }
                break;
            case 'attack':
                if (distance < 100) {
                    const attackType = Math.random() < 0.5 ? 'punch' : 'kick';
                    this.attack(attackType, opponent);
                }
                break;
            case 'special':
                if (this.specialEnergy >= this.maxSpecialEnergy && distance < 150) {
                    this.attack('special', opponent);
                }
                break;
        }
    }

    draw() {
        ctx.save();

        // Hurt flash effect
        if (this.hurtFrame > 0 && this.hurtFrame % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, GROUND + this.height + 5,
                    this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.isAttacking ? 20 : 0;
        ctx.shadowColor = this.color;

        const bodyHeight = this.isCrouching ? this.height / 2 : this.height;
        const bodyY = this.isCrouching ? this.y + this.height / 2 : this.y;

        ctx.fillRect(this.x + 10, bodyY, this.width - 20, bodyHeight);

        // Head
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        if (this.attackFrame > 0) {
            // Extended arm (punching/kicking)
            const armX = this.facingRight ? this.x + this.width : this.x - 30;
            ctx.fillRect(armX, bodyY + 20, 30, 10);
        } else {
            // Normal arms
            ctx.fillRect(this.x + 5, bodyY + 20, 10, 40);
            ctx.fillRect(this.x + this.width - 15, bodyY + 20, 10, 40);
        }

        // Legs
        const legY = bodyY + bodyHeight - 40;
        ctx.fillRect(this.x + 15, legY, 12, 40);
        ctx.fillRect(this.x + this.width - 27, legY, 12, 40);

        // Eyes (direction indicator)
        ctx.fillStyle = 'white';
        const eyeX = this.facingRight ? this.x + this.width / 2 + 5 : this.x + this.width / 2 - 8;
        ctx.fillRect(eyeX, this.y - 12, 6, 4);

        ctx.restore();
    }
}

// Players
let player1, player2;

// Keyboard state
const keys = {};

// Initialize game
function init() {
    player1 = new Fighter(100, '#3a86ff', {
        left: 'a',
        right: 'd',
        jump: 'w',
        down: 's',
        punch: 'f',
        kick: 'g',
        special: 'h'
    }, true);

    player2 = new Fighter(canvas.width - 160, '#ff006e', {}, false);

    updateHUD();
}

// Start game
function startGame() {
    gameState.hasStarted = true;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.timeLeft = 99;

    init();

    document.getElementById('startScreen').style.display = 'none';

    // Start timer
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && !gameState.isGameOver) {
            gameState.timeLeft--;
            document.getElementById('timer').textContent = gameState.timeLeft;

            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);

    gameLoop();
}

// Game loop
function gameLoop() {
    if (gameState.isGameOver) {
        return;
    }

    if (!gameState.isPaused) {
        update();
        draw();

        // Check win condition
        if (player1.health <= 0 || player2.health <= 0) {
            endGame();
            return;
        }
    }

    gameState.animationId = requestAnimationFrame(gameLoop);
}

// Update
function update() {
    player1.update(player2);
    player2.update(player1);
    updateHUD();
}

// Draw
function draw() {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a0e4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, GROUND + player1.height, canvas.width, canvas.height);

    // Ground line
    ctx.strokeStyle = '#06ffa5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + player1.height);
    ctx.lineTo(canvas.width, GROUND + player1.height);
    ctx.stroke();

    // Draw fighters
    player1.draw();
    player2.draw();
}

// Update HUD
function updateHUD() {
    const p1HealthPercent = (player1.health / player1.maxHealth) * 100;
    const p2HealthPercent = (player2.health / player2.maxHealth) * 100;

    document.getElementById('player1Health').style.width = p1HealthPercent + '%';
    document.getElementById('player2Health').style.width = p2HealthPercent + '%';
}

// End game
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.timerInterval);
    cancelAnimationFrame(gameState.animationId);

    let winner;
    if (player1.health > player2.health) {
        winner = 'Player 1';
        document.getElementById('winnerTitle').textContent = '🏆 Victory!';
        document.getElementById('winnerMessage').textContent = 'You defeated the opponent!';

        // Save win
        const wins = Storage.get('streetFighterWins') || 0;
        Storage.set('streetFighterWins', wins + 1);
    } else if (player2.health > player1.health) {
        winner = 'Player 2';
        document.getElementById('winnerTitle').textContent = '💀 Defeat!';
        document.getElementById('winnerMessage').textContent = 'The CPU wins this round...';
    } else {
        winner = 'Draw';
        document.getElementById('winnerTitle').textContent = '🤝 Draw!';
        document.getElementById('winnerMessage').textContent = 'Both fighters are equally matched!';
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.hasStarted) return;

    keys[e.key.toLowerCase()] = true;

    // Attack keys
    if (e.key.toLowerCase() === 'f') {
        player1.attack('punch', player2);
    } else if (e.key.toLowerCase() === 'g') {
        player1.attack('kick', player2);
    } else if (e.key.toLowerCase() === 'h') {
        player1.attack('special', player2);
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        togglePause();
    }

    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mobile controls
document.getElementById('mobileLeft').addEventListener('touchstart', () => keys['a'] = true);
document.getElementById('mobileLeft').addEventListener('touchend', () => keys['a'] = false);

document.getElementById('mobileRight').addEventListener('touchstart', () => keys['d'] = true);
document.getElementById('mobileRight').addEventListener('touchend', () => keys['d'] = false);

document.getElementById('mobileJump').addEventListener('touchstart', () => {
    keys['w'] = true;
    setTimeout(() => keys['w'] = false, 100);
});

document.getElementById('mobileDown').addEventListener('touchstart', () => keys['s'] = true);
document.getElementById('mobileDown').addEventListener('touchend', () => keys['s'] = false);

document.getElementById('mobilePunch').addEventListener('click', () => {
    if (player1) player1.attack('punch', player2);
});

document.getElementById('mobileKick').addEventListener('click', () => {
    if (player1) player1.attack('kick', player2);
});

document.getElementById('mobileSpecial').addEventListener('click', () => {
    if (player1) player1.attack('special', player2);
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
    clearInterval(gameState.timerInterval);
    cancelAnimationFrame(gameState.animationId);

    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';

    gameState.hasStarted = false;
}

function quitGame() {
    clearInterval(gameState.timerInterval);
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

// Initialize display
init();
