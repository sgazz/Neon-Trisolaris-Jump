import * as THREE from 'three';
import { Bomb } from './Bomb.js';

export class BombManager {
    constructor() {
        this.bombs = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // Spawn bomb every 2 seconds
        this.minSpawnX = -8;
        this.maxSpawnX = 8;
        this.spawnY = 12; // Spawn bombs above the screen
        this.maxBombs = 5; // Maximum bombs on screen at once
        this.difficulty = 1.0;
    }

    update(deltaTime, player, scene) {
        // Check if game is already over
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.gameOver) {
            return;
        }
        
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new bombs
        if (this.spawnTimer >= this.spawnInterval && this.bombs.length < this.maxBombs) {
            this.spawnBomb(scene);
            this.spawnTimer = 0;
            
            // Increase difficulty over time
            this.spawnInterval = Math.max(0.5, 2.0 - this.difficulty * 0.1);
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
        const speed = 2 + Math.random() * 2 * this.difficulty;
        const bomb = new Bomb(x, this.spawnY, speed);
        

        
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
