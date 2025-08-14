import * as THREE from 'three';
import { EnemyShip } from './EnemyShip.js';

export class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // Spawn enemy every 2 seconds
        this.minSpawnX = -8;
        this.maxSpawnX = 8;
        this.spawnY = -12; // Spawn enemies below screen
        this.maxEnemies = 2; // Maximum enemies on screen at once
        this.difficulty = 1.0;
        this.isActive = false; // Whether enemies are currently active
    }

    update(deltaTime, player, scene) {
        // Check if game is already over
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.gameOver) {
            return;
        }
        
        // Only spawn enemies if active
        if (this.isActive) {
            // Update spawn timer
            this.spawnTimer += deltaTime;
            
            // Spawn new enemies
            if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
                this.spawnEnemy(scene);
                this.spawnTimer = 0;
                
                // Increase difficulty over time
                this.spawnInterval = Math.max(1.0, 2.0 - this.difficulty * 0.1);
                
                console.log(`👾 Enemy spawned! Total enemies: ${this.enemies.length}, Next spawn in: ${this.spawnInterval.toFixed(1)}s`);
            }
        }
        
        // Update existing enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player);
            
            // Remove destroyed enemies
            if (enemy.isDestroyed) {
                this.enemies.splice(i, 1);
                console.log(`👾 Enemy removed. Remaining: ${this.enemies.length}`);
                
                // If no more enemies, deactivate enemy mode
                if (this.enemies.length === 0) {
                    this.deactivate();
                }
            }
            
            // Check collision with player
            if (enemy.checkCollision(player)) {
                console.log('💥 ENEMY HIT PLAYER! Game Over!');
                this.handlePlayerHit(player, enemy);
                break; // Exit loop after first collision
            }
        }
        
        // Check laser collisions
        this.checkLaserCollisions(player);
    }

    spawnEnemy(scene) {
        const x = this.minSpawnX + Math.random() * (this.maxSpawnX - this.minSpawnX);
        const type = this.getRandomEnemyType();
        const enemy = new EnemyShip(x, this.spawnY, type, this.difficulty);
        
        console.log(`👾 Enemy ${type} spawned at (${x.toFixed(1)}, ${this.spawnY})`);
        
        this.enemies.push(enemy);
        scene.add(enemy.mesh);
    }

    getRandomEnemyType() {
        const types = ['basic', 'fast', 'tank'];
        const weights = [0.6, 0.3, 0.1]; // Basic most common, tank rarest
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return types[i];
            }
        }
        
        return 'basic';
    }

    checkLaserCollisions(player) {
        const lasers = player.getLasers();
        
        for (let i = lasers.length - 1; i >= 0; i--) {
            const laser = lasers[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (enemy.checkCollision(laser)) {
                    console.log('🎯 LASER HIT ENEMY!');
                    
                    // Damage enemy
                    enemy.takeDamage(laser.damage || 1);
                    
                    // Remove laser
                    if (laser.mesh && laser.mesh.parent) {
                        laser.mesh.parent.remove(laser.mesh);
                    }
                    lasers.splice(i, 1);
                    
                    // Add score (more for enemies than bombs)
                    if (window.gameInstance && window.gameInstance.game) {
                        window.gameInstance.game.addScore(200);
                    }
                    
                    break; // Laser can only hit one enemy
                }
            }
        }
    }

    handlePlayerHit(player, enemy) {
        // Game over
        if (window.gameInstance && window.gameInstance.game) {
            console.log('💀 Calling game over from enemy hit...');
            window.gameInstance.game.endGame();
        } else {
            console.error('❌ Game instance not found!');
        }
    }

    activate() {
        this.isActive = true;
        console.log('👾 Enemy mode activated!');
    }

    deactivate() {
        this.isActive = false;
        console.log('👾 Enemy mode deactivated!');
    }

    reset() {
        // Remove all enemies from scene
        this.enemies.forEach(enemy => {
            if (enemy.mesh && enemy.mesh.parent) {
                enemy.mesh.parent.remove(enemy.mesh);
            }
        });
        
        this.enemies = [];
        this.spawnTimer = 0;
        this.difficulty = 1.0;
        this.spawnInterval = 5.0;
        this.isActive = false;
        
        console.log('🔄 EnemyManager reset complete');
    }

    increaseDifficulty() {
        this.difficulty += 0.1;
        this.maxEnemies = Math.min(3, 2 + Math.floor(this.difficulty));
        console.log(`👾 Enemy difficulty increased to ${this.difficulty.toFixed(1)}`);
    }

    getEnemies() {
        return this.enemies;
    }

    isEnemyModeActive() {
        return this.isActive;
    }
}
