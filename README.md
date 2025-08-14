# Trisolaris Jump 🚀

A cyberpunk-themed Doodle Jump game built with Three.js, featuring CRT monitor aesthetics and neon glow effects.

## Features

- **Cyberpunk Visual Style**: CRT monitor effects with scanlines and neon glow
- **Multiple Platform Types**:
  - 🟢 Normal platforms (green)
  - 🟠 Moving platforms (orange)
  - 🔴 Fragile platforms (red) - break after being hit
  - 🔵 Boost platforms (blue) - give extra jump force
- **Responsive Design**: Works on both desktop and mobile devices
- **Particle Effects**: Neon particle effects on jumps and platform hits
- **Progressive Difficulty**: Game gets harder as you climb higher

## Controls

### Desktop
- **A/D** or **←/→**: Move left/right
- **SPACE**: Jump
- **SPACE**: Restart game (when game over)

### Mobile
- **Swipe left/right**: Move
- **Tap**: Jump

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Game Mechanics

- Jump from platform to platform to climb higher
- Avoid falling off the screen
- Different platform types add variety and challenge
- Score is based on height reached
- Game gets progressively more difficult

## Technology Stack

- **Three.js**: 3D graphics and rendering
- **Vite**: Build tool and development server
- **Vanilla JavaScript**: Game logic and mechanics

## Project Structure

```
src/
├── main.js              # Main entry point
├── input/
│   └── InputManager.js  # Input handling
└── game/
    ├── Game.js          # Main game logic
    ├── Player.js        # Player character
    ├── Platform.js      # Platform objects
    └── PlatformManager.js # Platform generation and management
```

## Future Enhancements

- [ ] Sound effects and background music
- [ ] Power-ups and collectibles
- [ ] Boss battles
- [ ] Multiple character skins
- [ ] Leaderboard system
- [ ] More platform types
- [ ] Background parallax effects

## Contributing

Feel free to contribute to this project by submitting issues or pull requests!

## License

MIT License - feel free to use this project for your own games!
