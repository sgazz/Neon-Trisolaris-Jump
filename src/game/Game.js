import * as THREE from 'three';
import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { PlatformManager } from './PlatformManager.js';
import { BombManager } from './BombManager.js';
import { InputManager } from '../input/InputManager.js';
import { AudioManager } from '../audio/AudioManager.js';

export class Game {
    constructor(inputManager) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.platformManager = null;
        this.bombManager = null;
        this.inputManager = inputManager;
        this.audioManager = null;
        
        this.score = 0;
        this.height = 0;
        this.gameOver = true; // Start with game over state until player clicks start
        this.debugMode = true; // Enable debug mode for collision visualization
        this.restartHandler = null; // Store restart handler reference
        this.frameCount = 0; // For debug logging
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        
        this.player = new Player();
        this.platformManager = new PlatformManager();
        this.bombManager = new BombManager();
        this.audioManager = new AudioManager();
        
        this.scene.add(this.player.mesh);
        this.platformManager.addToScene(this.scene);
        
        this.setupUI();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Add some ambient stars
        this.addStars();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 10);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Add CRT-like post-processing effects
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Point light for neon glow effect
        const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
    }

    addStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0x00ff88,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    setupUI() {
        this.scoreElement = document.getElementById('score');
        this.heightElement = document.getElementById('height');
        this.gameOverElement = document.getElementById('gameOver');
    }

    start() {
        // Remove restart handler if exists
        if (this.restartHandler) {
            document.removeEventListener('keydown', this.restartHandler);
            this.restartHandler = null;
        }
        
        this.gameOver = false;
        this.score = 0;
        this.height = 0;
        this.frameCount = 0;
        
        // Reset managers first
        this.platformManager.reset();
        this.bombManager.reset();
        
        // Reset player after platforms are created
        this.player.reset();
        
        this.updateUI();
        
        // Start background music
        if (this.audioManager) {
            this.audioManager.startBackgroundMusic();
        }
        
        console.log('🚀 Game started! Player positioned on platform');
    }

    update() {
        const deltaTime = 1/60; // Fixed timestep for now
        
        if (!this.gameOver) {
            // Update player
            if (this.inputManager) {
                this.player.update(deltaTime, this.inputManager);
                
                // Handle laser shooting
                if (this.inputManager.isMousePressed()) {
                    const mousePos = this.inputManager.getMousePosition();
                    this.player.shootLaser(mousePos, this.scene);
                }
            }
            
            // Update platforms
            this.platformManager.update(deltaTime, this.player);
            
            // Update bombs
            this.bombManager.update(deltaTime, this.player, this.scene);
            
            // Check collisions
            this.checkCollisions();
            
            // Update camera
            this.updateCamera();
            
            // Update score and height
            this.updateScore();
            
            // Increase difficulty over time
            if (this.score > 0 && this.score % 1000 === 0) {
                this.bombManager.increaseDifficulty();
            }
            
            // Debug: Log player position every 60 frames (1 second)
            if (this.frameCount % 60 === 0) {
                console.log(`🎮 Player at y=${this.player.mesh.position.y.toFixed(1)}, Camera at y=${this.camera.position.y.toFixed(1)}`);
            }
            this.frameCount = (this.frameCount || 0) + 1;
        }
        
        // Always render (even when game is not running)
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    checkCollisions() {
        const platforms = this.platformManager.getPlatforms();
        
        // Debug: Log platform count every 60 frames
        if (this.frameCount % 60 === 0) {
            console.log(`🏗️ Checking collisions with ${platforms.length} platforms`);
        }
        
        for (let platform of platforms) {
            if (this.player.checkPlatformCollision(platform)) {
                this.player.jump();
                platform.hit();
                break;
            }
        }
        
        // Check if player fell off screen (but give some grace period)
        if (this.player.mesh.position.y < this.camera.position.y - 15) {
            console.log(`💀 Player fell off screen - Game Over! Player at y=${this.player.mesh.position.y.toFixed(1)}, Camera at y=${this.camera.position.y.toFixed(1)}`);
            this.endGame();
        }
    }

    updateCamera() {
        // Follow player with some lag for smooth movement
        const targetY = this.player.mesh.position.y;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
        
        // Ensure camera doesn't go below player
        if (this.camera.position.y < this.player.mesh.position.y - 2) {
            this.camera.position.y = this.player.mesh.position.y - 2;
        }
    }

    updateScore() {
        this.height = Math.max(this.height, this.player.mesh.position.y);
        this.score = Math.floor(this.height * 10);
        this.updateUI();
    }

    updateUI() {
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.heightElement.textContent = `Height: ${Math.floor(this.height)}m`;
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    gameOver() {
        this.endGame();
    }

    endGame() {
        // Prevent multiple calls
        if (this.gameOver) {
            console.log('⚠️ Game already over, ignoring endGame call');
            return;
        }
        
        console.log('🏁 Ending game...');
        this.gameOver = true;
        this.gameOverElement.style.display = 'block';
        
        // Stop the game loop
        if (window.gameInstance) {
            window.gameInstance.stopGame();
        }
        
        // Play game over sound
        if (this.audioManager) {
            this.audioManager.playGameOver();
            this.audioManager.stopBackgroundMusic();
        }
        
        // Remove previous restart handler if exists
        if (this.restartHandler) {
            document.removeEventListener('keydown', this.restartHandler);
        }
        
        // Listen for restart
        this.restartHandler = (event) => {
            if (event.code === 'Space') {
                console.log('🔄 Restarting game...');
                this.gameOverElement.style.display = 'none';
                this.start();
                document.removeEventListener('keydown', this.restartHandler);
                this.restartHandler = null;
                
                // Restart the game loop
                if (window.gameInstance) {
                    window.gameInstance.startGame();
                }
            }
        };
        document.addEventListener('keydown', this.restartHandler);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
