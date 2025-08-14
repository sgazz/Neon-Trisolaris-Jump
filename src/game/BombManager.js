import * as THREE from 'three';
import { Bomb } from './Bomb.js';

export class BombManager {
    constructor() {
        this.bombs = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.0; // Spawn bomb every 1 second
        this.minSpawnX = -8;
        this.maxSpawnX = 8;
        this.spawnY = -15; // Spawn bombs below the screen
        this.maxBombs = 5; // Maximum bombs on screen at once
        this.difficulty = 1.0;
        this.frameCount = 0; // For debug logging
    }

    update(deltaTime, player, scene) {
        // Check if game is already over
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.gameOver) {
            return;
        }
        
        // Debug: Log bomb manager update
        if (this.frameCount % 60 === 0) {
            console.log(`💣 BombManager UPDATE - Timer: ${this.spawnTimer.toFixed(1)}s, Interval: ${this.spawnInterval.toFixed(1)}s, Bombs: ${this.bombs.length}/${this.maxBombs}`);
        }
        this.frameCount = (this.frameCount || 0) + 1;
        
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new bombs
        if (this.spawnTimer >= this.spawnInterval && this.bombs.length < this.maxBombs) {
            this.spawnBomb(scene);
            this.spawnTimer = 0;
            
            // Increase difficulty over time
            this.spawnInterval = Math.max(0.3, 1.0 - this.difficulty * 0.05);
            
            console.log(`💣 Bomb spawned! Total bombs: ${this.bombs.length}, Next spawn in: ${this.spawnInterval.toFixed(1)}s`);
        } else if (this.spawnTimer >= this.spawnInterval && this.bombs.length >= this.maxBombs) {
            console.log(`💣 Max bombs reached (${this.bombs.length}/${this.maxBombs}), waiting...`);
            this.spawnTimer = 0;
        }
        

        
        // Update existing bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.update(deltaTime);
            
            // Remove destroyed bombs
            if (bomb.isDestroyed) {
                this.bombs.splice(i, 1);
            }
            
            // Check collision with player
            if (bomb.checkCollision(player)) {
                console.log('💥 BOMB HIT PLAYER! Game Over!');
                this.handlePlayerHit(player, bomb);
                break; // Exit loop after first collision
            }
        }
        
        // Check laser collisions
        this.checkLaserCollisions(player);
    }

    spawnBomb(scene) {
        const x = this.minSpawnX + Math.random() * (this.maxSpawnX - this.minSpawnX);
        const speed = 6 + Math.random() * 4 * this.difficulty; // Much faster bombs
        
        // Get player position and spawn bombs below player
        const playerY = window.gameInstance && window.gameInstance.game && window.gameInstance.game.player ? 
            window.gameInstance.game.player.mesh.position.y : 0;
        const spawnY = Math.min(this.spawnY, playerY - 10); // Spawn below player or at default position
        
        const bomb = new Bomb(x, spawnY, speed);
        
        console.log(`💣 Bomb spawned at (${x.toFixed(1)}, ${spawnY.toFixed(1)}) with speed ${speed.toFixed(1)} - Player at y=${playerY.toFixed(1)}`);
        
        this.bombs.push(bomb);
        scene.add(bomb.mesh);
    }

    checkLaserCollisions(player) {
        const lasers = player.getLasers();
        
        for (let i = lasers.length - 1; i >= 0; i--) {
            const laser = lasers[i];
            
            for (let j = this.bombs.length - 1; j >= 0; j--) {
                const bomb = this.bombs[j];
                
                if (bomb.checkCollision(laser)) {
                    console.log('🎯 LASER HIT BOMB! Score +100');
                    
                    // Destroy bomb
                    bomb.destroy();
                    this.bombs.splice(j, 1);
                    
                    // Remove laser
                    if (laser.mesh && laser.mesh.parent) {
                        laser.mesh.parent.remove(laser.mesh);
                    }
                    lasers.splice(i, 1);
                    
                    // Add score
                    if (window.gameInstance && window.gameInstance.game) {
                        window.gameInstance.game.addScore(100);
                    }
                    
                    break; // Laser can only hit one bomb
                }
            }
        }
    }

    handlePlayerHit(player, bomb) {
        // Destroy bomb
        bomb.destroy();
        this.bombs.splice(this.bombs.indexOf(bomb), 1);
        
        // Game over
        if (window.gameInstance && window.gameInstance.game) {
            console.log('💀 Calling game over...');
            window.gameInstance.game.endGame();
        } else {
            console.error('❌ Game instance not found!');
        }
    }

    reset() {
        // Remove all bombs from scene
        this.bombs.forEach(bomb => {
            if (bomb.mesh && bomb.mesh.parent) {
                bomb.mesh.parent.remove(bomb.mesh);
            }
        });
        
        this.bombs = [];
        this.spawnTimer = 0;
        this.difficulty = 1.0;
        this.spawnInterval = 2.0;
        this.frameCount = 0;
        
        console.log('🔄 BombManager reset complete');
    }

    increaseDifficulty() {
        this.difficulty += 0.1;
        this.maxBombs = Math.min(8, 5 + Math.floor(this.difficulty));
    }

    getBombs() {
        return this.bombs;
    }
}
