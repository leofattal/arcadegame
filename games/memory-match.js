// Memory Match Game Logic

// Card symbols - using emojis for visual appeal
const SYMBOLS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🍍',
                 '🥝', '🥑', '🍆', '🌽', '🥕', '🥒', '🌶️', '🍄'];

// Game state
let gameState = {
    pairs: 6,
    moves: 0,
    matches: 0,
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    isPaused: false,
    isGameOver: false,
    hasStarted: false,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null
};

let cards = [];

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
            gameState.pairs = parseInt(btn.dataset.pairs);
        });
    });
}

// Create and shuffle cards
function createCards() {
    const symbols = SYMBOLS.slice(0, gameState.pairs);
    const cardSymbols = [...symbols, ...symbols]; // Duplicate for pairs

    // Shuffle using Fisher-Yates algorithm
    for (let i = cardSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
    }

    cards = cardSymbols.map((symbol, index) => ({
        id: index,
        symbol: symbol,
        flipped: false,
        matched: false
    }));
}

// Render cards to DOM
function renderCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    // Adjust grid columns based on number of pairs
    const columns = gameState.pairs <= 6 ? 4 : gameState.pairs <= 8 ? 4 : 4;
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;

        cardElement.innerHTML = `
            <div class="card-back">🎴</div>
            <div class="card-front">${card.symbol}</div>
        `;

        cardElement.addEventListener('click', () => flipCard(card.id));

        gameBoard.appendChild(cardElement);
    });
}

// Flip card
function flipCard(cardId) {
    if (gameState.lockBoard) return;
    if (gameState.isPaused || gameState.isGameOver) return;

    const card = cards[cardId];
    if (card.flipped || card.matched) return;

    // Flip the card
    card.flipped = true;
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    cardElement.classList.add('flipped');

    if (!gameState.firstCard) {
        // First card flipped
        gameState.firstCard = card;
    } else {
        // Second card flipped
        gameState.secondCard = card;
        gameState.lockBoard = true;

        // Increment moves
        gameState.moves++;
        updateDisplay();

        // Check for match
        checkMatch();
    }
}

// Check if cards match
function checkMatch() {
    const isMatch = gameState.firstCard.symbol === gameState.secondCard.symbol;

    if (isMatch) {
        // Match found!
        handleMatch();
    } else {
        // No match
        handleMismatch();
    }
}

// Handle matching cards
function handleMatch() {
    gameState.firstCard.matched = true;
    gameState.secondCard.matched = true;
    gameState.matches++;

    const card1Element = document.querySelector(`[data-id="${gameState.firstCard.id}"]`);
    const card2Element = document.querySelector(`[data-id="${gameState.secondCard.id}"]`);

    card1Element.classList.add('matched');
    card2Element.classList.add('matched');

    updateDisplay();
    resetTurn();

    // Check if game is complete
    if (gameState.matches === gameState.pairs) {
        setTimeout(endGame, 500);
    }
}

// Handle non-matching cards
function handleMismatch() {
    const card1Element = document.querySelector(`[data-id="${gameState.firstCard.id}"]`);
    const card2Element = document.querySelector(`[data-id="${gameState.secondCard.id}"]`);

    card1Element.classList.add('wrong');
    card2Element.classList.add('wrong');

    setTimeout(() => {
        // Flip cards back
        gameState.firstCard.flipped = false;
        gameState.secondCard.flipped = false;

        card1Element.classList.remove('flipped', 'wrong');
        card2Element.classList.remove('flipped', 'wrong');

        resetTurn();
    }, 1000);
}

// Reset turn
function resetTurn() {
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.lockBoard = false;
}

// Start game
function startGame() {
    gameState.hasStarted = true;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.lockBoard = false;
    gameState.elapsedTime = 0;

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('difficultySelector').style.display = 'none';

    createCards();
    renderCards();
    updateDisplay();
    startTimer();
}

// Start timer
function startTimer() {
    gameState.startTime = Date.now();

    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && !gameState.isGameOver) {
            gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateTimerDisplay();
        }
    }, 100);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.elapsedTime / 60);
    const seconds = gameState.elapsedTime % 60;
    document.getElementById('timerDisplay').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update display
function updateDisplay() {
    document.getElementById('movesDisplay').textContent = gameState.moves;
    document.getElementById('matchesDisplay').textContent =
        `${gameState.matches} / ${gameState.pairs}`;

    // Display best time
    const bestTime = Storage.get(`memoryMatch_best_${gameState.pairs}`);
    if (bestTime) {
        const minutes = Math.floor(bestTime / 60);
        const seconds = bestTime % 60;
        document.getElementById('bestTimeDisplay').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('bestTimeDisplay').textContent = '--';
    }
}

// End game
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.timerInterval);

    // Check for new best time
    const bestTime = Storage.get(`memoryMatch_best_${gameState.pairs}`);
    const isNewBest = !bestTime || gameState.elapsedTime < bestTime;

    if (isNewBest) {
        Storage.set(`memoryMatch_best_${gameState.pairs}`, gameState.elapsedTime);
    }

    // Display results
    const minutes = Math.floor(gameState.elapsedTime / 60);
    const seconds = gameState.elapsedTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('completionMessage').textContent = 'All pairs found!';
    document.getElementById('statsMessage').textContent =
        `Time: ${timeStr} | Moves: ${gameState.moves}`;

    if (isNewBest) {
        document.getElementById('bestTimeMessage').textContent = '🏆 New Best Time!';
        document.getElementById('bestTimeMessage').style.color = '#06ffa5';
    } else {
        document.getElementById('bestTimeMessage').textContent = 'Try to beat your best time!';
        document.getElementById('bestTimeMessage').style.color = '#b8c1ec';
    }

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Button controls
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('quitBtn').addEventListener('click', quitGame);
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

function togglePause() {
    if (!gameState.hasStarted || gameState.isGameOver) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseScreen').style.display = gameState.isPaused ? 'flex' : 'none';

    if (gameState.isPaused) {
        // Pause timer
        clearInterval(gameState.timerInterval);
    } else {
        // Resume timer
        gameState.startTime = Date.now() - (gameState.elapsedTime * 1000);
        startTimer();
    }
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseScreen').style.display = 'none';
    gameState.startTime = Date.now() - (gameState.elapsedTime * 1000);
    startTimer();
}

function restartGame() {
    clearInterval(gameState.timerInterval);
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('difficultySelector').style.display = 'block';
    gameState.hasStarted = false;
}

function quitGame() {
    clearInterval(gameState.timerInterval);
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

// Keyboard support for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState.hasStarted && !gameState.isGameOver) {
            togglePause();
        }
    }
});

// Initialize
init();
