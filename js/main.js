// Main Application Logic

// DOM Elements
const gamesGrid = document.getElementById('gamesGrid');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const soundToggle = document.getElementById('soundToggle');
const musicToggle = document.getElementById('musicToggle');
const clearDataBtn = document.getElementById('clearDataBtn');
const randomGameBtn = document.getElementById('randomGameBtn');

// Initialize app
function init() {
    renderGames();
    loadSettings();
    setupEventListeners();
}

// Render game cards
function renderGames() {
    gamesGrid.innerHTML = '';

    GAMES.forEach(game => {
        const highScore = Storage.getHighScore(game.id);
        const timesPlayed = Storage.getGameStats(game.id);

        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.setAttribute('role', 'button');
        gameCard.setAttribute('tabindex', '0');
        gameCard.setAttribute('aria-label', `Play ${game.title}`);

        gameCard.innerHTML = `
            <div class="game-thumbnail">
                <span style="z-index: 1;">${game.icon}</span>
            </div>
            <div class="game-info">
                <h4 class="game-title">${game.title}</h4>
                <p class="game-description">${game.description}</p>
                <div class="game-meta">
                    <span class="high-score">
                        ${highScore > 0 ? `🏆 High: ${highScore}` : '🎮 Not played yet'}
                    </span>
                </div>
                <button class="btn btn-primary" onclick="playGame('${game.id}')">
                    ▶️ Play Now
                </button>
            </div>
        `;

        // Add click handler for card (but not for the button)
        gameCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
                playGame(game.id);
            }
        });

        // Add keyboard support
        gameCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playGame(game.id);
            }
        });

        gamesGrid.appendChild(gameCard);
    });
}

// Play game
function playGame(gameId) {
    const game = getGameById(gameId);
    if (game) {
        // Increment play count
        Storage.incrementGamePlayed(gameId);

        // Navigate to game
        window.location.href = game.url;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });

    closeSettingsBtn.addEventListener('click', closeSettings);

    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.style.display === 'flex') {
            closeSettings();
        }
    });

    // Settings toggles
    soundToggle.addEventListener('change', () => {
        Storage.updateSettings({ soundEnabled: soundToggle.checked });
    });

    musicToggle.addEventListener('change', () => {
        Storage.updateSettings({ musicEnabled: musicToggle.checked });
    });

    // Clear data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all high scores and settings? This cannot be undone.')) {
            Storage.clearAll();
            loadSettings();
            renderGames();
            alert('All data has been cleared!');
        }
    });

    // Random game button
    randomGameBtn.addEventListener('click', () => {
        const game = getRandomGame();
        playGame(game.id);
    });
}

// Load settings from storage
function loadSettings() {
    const settings = Storage.getSettings();
    soundToggle.checked = settings.soundEnabled;
    musicToggle.checked = settings.musicEnabled;
}

// Close settings modal
function closeSettings() {
    settingsModal.style.display = 'none';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
