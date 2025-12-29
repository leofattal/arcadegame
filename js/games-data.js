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
    },
    {
        id: 'space-shooter',
        title: 'Space Shooter',
        description: 'Defend Earth from alien invaders!',
        icon: '🚀',
        url: 'games/space-shooter.html',
        category: 'shooter'
    },
    {
        id: 'memory-match',
        title: 'Memory Match',
        description: 'Find matching pairs of cards!',
        icon: '🎴',
        url: 'games/memory-match.html',
        category: 'puzzle'
    },
    {
        id: 'runner',
        title: 'Endless Runner',
        description: 'Jump over obstacles and collect coins!',
        icon: '🏃',
        url: 'games/runner.html',
        category: 'action'
    },
    {
        id: 'tetris',
        title: 'Tetris',
        description: 'Classic block-stacking puzzle game!',
        icon: '🎮',
        url: 'games/tetris.html',
        category: 'puzzle'
    },
    {
        id: 'pong',
        title: 'Pong',
        description: 'Classic arcade tennis against CPU!',
        icon: '🏓',
        url: 'games/pong.html',
        category: 'sports'
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
