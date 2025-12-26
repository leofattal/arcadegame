// Games Data Configuration
// Central registry of all available games

const GAMES = [
    {
        id: 'brick-breaker',
        title: 'Brick Breaker',
        description: 'Classic paddle and ball game. Break all the bricks!',
        icon: '🧱',
        url: 'games/brick-breaker.html',
        category: 'arcade'
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Eat food, grow longer, don\'t hit yourself!',
        icon: '🐍',
        url: 'games/snake.html',
        category: 'arcade'
    },
    {
        id: 'street-fighter',
        title: 'Street Brawler',
        description: 'Fight against CPU in this action-packed brawler!',
        icon: '👊',
        url: 'games/street-fighter.html',
        category: 'fighting'
    }
];

// Get game by ID
function getGameById(gameId) {
    return GAMES.find(game => game.id === gameId);
}

// Get random game
function getRandomGame() {
    return GAMES[Math.floor(Math.random() * GAMES.length)];
}

// Get games by category
function getGamesByCategory(category) {
    return GAMES.filter(game => game.category === category);
}
