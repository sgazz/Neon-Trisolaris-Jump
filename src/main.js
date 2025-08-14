import * as THREE from 'three';
import { Game } from './game/Game.js';
import { InputManager } from './input/InputManager.js';

class TrisolarisJump {
    constructor() {
        this.game = null;
        this.inputManager = null;
        this.isGameRunning = false;
        
        this.init();
    }

    init() {
        // Initialize input manager
        this.inputManager = new InputManager();
        
        // Initialize game
        this.game = new Game(this.inputManager);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start the game loop
        this.gameLoop();
    }

    setupEventListeners() {
        const startButton = document.getElementById('startButton');
        const startScreen = document.getElementById('startScreen');
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
                startScreen.style.display = 'none';
            });
        }

        // Resume audio context on any click
        document.addEventListener('click', () => {
            if (this.game && this.game.audioManager) {
                this.game.audioManager.resumeAudioContext();
            }
        });

        // Resume audio context on touch
        document.addEventListener('touchstart', () => {
            if (this.game && this.game.audioManager) {
                this.game.audioManager.resumeAudioContext();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !this.isGameRunning) {
                this.startGame();
                startScreen.style.display = 'none';
            }
            
            // Resume audio context on any key press
            if (this.game && this.game.audioManager) {
                this.game.audioManager.resumeAudioContext();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.resize();
            }
        });

        // Audio controls
        const muteButton = document.getElementById('muteButton');
        const volumeSlider = document.getElementById('volumeSlider');
        
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                if (this.game && this.game.audioManager) {
                    const isMuted = this.game.audioManager.toggleMute();
                    muteButton.textContent = isMuted ? '🔇' : '🔊';
                }
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (event) => {
                if (this.game && this.game.audioManager) {
                    const volume = event.target.value / 100;
                    this.game.audioManager.setVolume(volume);
                }
            });
        }
    }

    startGame() {
        this.isGameRunning = true;
        this.game.start();
        
        // Resume audio context on first user interaction
        if (this.game && this.game.audioManager) {
            this.game.audioManager.resumeAudioContext();
        }
        
        console.log('🎮 Game started from main.js');
    }

    gameLoop() {
        if (this.isGameRunning) {
            this.game.update();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    stopGame() {
        this.isGameRunning = false;
        console.log('⏹️ Game stopped from main.js');
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.gameInstance = new TrisolarisJump();
});
