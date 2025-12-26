# 🕹️ Arcade Games Website

A web-based arcade gaming platform with **no sign-in required**. Play classic arcade games instantly in your browser!

## ✨ Features

- **🚀 Instant Play** - No accounts, no signup, just click and play
- **💾 Local Storage** - High scores and settings saved on your device
- **📱 Responsive Design** - Works on mobile, tablet, and desktop
- **🎮 Multiple Games** - Growing collection of arcade classics
- **⚡ Fast & Lightweight** - Pure HTML, CSS, and JavaScript
- **🎨 Arcade-Inspired UI** - Vibrant, retro-modern aesthetics

## 🎯 Current Games

1. **🧱 Brick Breaker** - Classic paddle and ball game with multiple levels
2. **🐍 Snake** - Eat, grow, and don't hit yourself! Three difficulty levels.
3. **👊 Street Brawler** - Fight against CPU in an action-packed fighting game!

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arcadegame.git
cd arcadegame
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000`

## 📁 Project Structure

```
arcadegame/
├── index.html              # Homepage with game grid
├── css/
│   └── styles.css          # Global styles
├── js/
│   ├── main.js            # Homepage logic
│   ├── storage.js         # LocalStorage manager
│   └── games-data.js      # Games configuration
├── games/
│   ├── brick-breaker.html # Brick Breaker game
│   ├── brick-breaker.js   # Game logic
│   └── ...                # Other games
├── prd.md                 # Product Requirements Document
└── README.md              # This file
```

## 🎮 How to Play

### Brick Breaker

**Objective:** Break all bricks by bouncing the ball with your paddle

**Controls:**
- **Desktop:**
  - Arrow Keys or A/D to move paddle
  - Space/Enter to launch ball
  - P or Escape to pause
- **Mobile/Tablet:**
  - Touch and drag to move paddle
  - Tap to launch ball

**Game Features:**
- Multiple levels with increasing difficulty
- Lives system (3 lives per game)
- High score tracking
- Pause, restart, and fullscreen options

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`:

- **High scores** - Best score for each game
- **Settings** - Sound and music preferences
- **Game stats** - Number of times played

⚠️ **Note:** Clearing your browser data will reset all progress!

## 🛠️ Technical Details

### Built With

- **HTML5** - Canvas for game rendering
- **CSS3** - Modern styling and animations
- **Vanilla JavaScript** - No frameworks or dependencies

### Browser Compatibility

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- Target: 60 FPS gameplay
- Initial load: <2 seconds
- Game load: <3 seconds
- Works on devices from 2020+

## 🚀 Deployment

### Static Hosting Options

This is a static website and can be deployed to:

1. **GitHub Pages**
```bash
# Enable GitHub Pages in repository settings
# Select main branch
# Your site will be at: https://username.github.io/arcadegame
```

2. **Netlify**
```bash
# Drag and drop the folder to Netlify
# Or connect your GitHub repository
```

3. **Vercel**
```bash
npm i -g vercel
vercel
```

4. **Cloudflare Pages**, **Firebase Hosting**, etc.

## 🎨 Customization

### Adding a New Game

1. Create game files in `/games/`:
```
games/
├── your-game.html
└── your-game.js
```

2. Add game to `js/games-data.js`:
```javascript
{
    id: 'your-game',
    title: 'Your Game',
    description: 'Game description',
    icon: '🎮',
    url: 'games/your-game.html',
    category: 'arcade'
}
```

3. Implement game logic with:
   - Pause/Resume functionality
   - Restart option
   - Quit to main menu
   - High score integration with `Storage.setHighScore()`

### Color Scheme

Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-bg: #1a1a2e;
    --accent-1: #ff006e;
    --accent-2: #8338ec;
    /* ... etc */
}
```

## 📋 Roadmap

- [x] Homepage with game grid
- [x] Brick Breaker game
- [x] Snake game with 3 difficulty levels
- [x] Street Brawler fighting game
- [x] Local storage for high scores
- [x] Settings modal
- [x] Responsive design
- [x] Mobile controls for touch devices
- [ ] Space Shooter game
- [ ] Memory Match game
- [ ] Endless Runner game
- [ ] Sound effects and music
- [ ] Daily challenges (local)
- [ ] Shareable score screenshots
- [ ] Service worker for offline play

## 🤝 Contributing

Contributions are welcome! To add a new game or feature:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-game`)
3. Commit your changes (`git commit -m 'Add new game'`)
4. Push to the branch (`git push origin feature/new-game`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Ensure games work on mobile and desktop
- Test in multiple browsers
- Keep dependencies minimal (prefer vanilla JS)
- Update README and games-data.js for new games

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by classic arcade games
- Built with modern web technologies
- No user accounts by design - privacy first!

## 📞 Contact

Have questions or feedback? Open an issue on GitHub!

---

**Built with ❤️ for instant, frictionless gaming**

Play free, play fair, play instantly! 🎮
