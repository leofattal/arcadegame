// Local Storage Manager for Arcade Games
// Handles all localStorage operations with proper error handling

const Storage = {
    // Namespace for all arcade game data
    PREFIX: 'arcadeGame_',

    // Initialize storage with default settings
    init() {
        if (!this.isSupported()) {
            console.warn('LocalStorage is not supported');
            return false;
        }

        // Initialize default settings if not exists
        if (!this.get('settings')) {
            this.set('settings', {
                soundEnabled: true,
                musicEnabled: true
            });
        }

        // Initialize high scores object if not exists
        if (!this.get('highScores')) {
            this.set('highScores', {});
        }

        return true;
    },

    // Check if localStorage is supported
    isSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Get item from storage
    get(key) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    },

    // Set item in storage
    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to storage:', e);
            // Handle quota exceeded error
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some data.');
            }
            return false;
        }
    },

    // Remove item from storage
    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (e) {
            console.error('Error removing from storage:', e);
            return false;
        }
    },

    // Clear all arcade game data
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            // Reinitialize with defaults
            this.init();
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    },

    // High Score Management
    getHighScore(gameId) {
        const highScores = this.get('highScores') || {};
        return highScores[gameId] || 0;
    },

    setHighScore(gameId, score) {
        const highScores = this.get('highScores') || {};
        const currentHigh = highScores[gameId] || 0;

        if (score > currentHigh) {
            highScores[gameId] = score;
            this.set('highScores', highScores);
            return true; // New high score!
        }
        return false;
    },

    getAllHighScores() {
        return this.get('highScores') || {};
    },

    // Settings Management
    getSettings() {
        return this.get('settings') || {
            soundEnabled: true,
            musicEnabled: true
        };
    },

    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        return this.set('settings', updatedSettings);
    },

    // Statistics (optional)
    incrementGamePlayed(gameId) {
        const stats = this.get('stats') || {};
        stats[gameId] = (stats[gameId] || 0) + 1;
        this.set('stats', stats);
    },

    getGameStats(gameId) {
        const stats = this.get('stats') || {};
        return stats[gameId] || 0;
    }
};

// Initialize storage when script loads
Storage.init();
