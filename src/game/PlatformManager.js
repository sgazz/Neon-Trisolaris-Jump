import { Platform } from './Platform.js';

export class PlatformManager {
    constructor() {
        this.platforms = [];
        this.scene = null;
        this.highestPlatform = 0;
        this.platformTypes = ['normal', 'moving', 'fragile', 'boost'];
        this.platformWeights = [0.6, 0.2, 0.15, 0.05]; // Probability weights
        this.frameCount = 0; // For debug logging
        
        this.init();
    }

    init() {
        // Create initial platforms
        this.createInitialPlatforms();
    }

    createInitialPlatforms() {
        // Start with a few platforms - much closer together
        for (let i = 0; i < 8; i++) { // More initial platforms
            let x;
            if (i === 0) {
                // First platform at x=0 for player to start on
                x = 0;
            } else {
                // Other platforms at random positions
                x = (Math.random() - 0.5) * 8; // Reduced range
            }
            const y = i * 1.2; // Much closer - only 1.2 units apart
            const type = this.getRandomPlatformType();
            const platform = new Platform(x, y, type);
            this.platforms.push(platform);
            this.highestPlatform = Math.max(this.highestPlatform, y);
            console.log(`🏗️ Created platform ${i} at (${x.toFixed(1)}, ${y})`);
        }
        console.log(`📊 Total platforms created: ${this.platforms.length}`);
    }

    getRandomPlatformType() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < this.platformWeights.length; i++) {
            cumulativeWeight += this.platformWeights[i];
            if (random <= cumulativeWeight) {
                return this.platformTypes[i];
            }
        }
        
        return 'normal';
    }

    addToScene(scene) {
        this.scene = scene;
        this.platforms.forEach(platform => {
            scene.add(platform.mesh);
        });
    }

    update(deltaTime, player) {
        // Update all platforms
        this.platforms.forEach(platform => {
            platform.update(deltaTime);
        });
        
        // Generate new platforms as player goes higher
        this.generateNewPlatforms(player);
        
        // Emergency platform creation if player has no reachable platforms
        this.ensurePlayerHasPlatforms(player);
        
        // Debug: Log platform availability
        if (this.frameCount % 120 === 0) { // Every 2 seconds
            const reachablePlatforms = this.platforms.filter(platform => {
                const distanceY = platform.position.y - player.mesh.position.y;
                const distanceX = Math.abs(platform.position.x - player.mesh.position.x);
                return distanceY > 0 && distanceY <= 2.5 && distanceX <= 4;
            });
            console.log(`📊 Player has ${reachablePlatforms.length} reachable platforms`);
        }
        this.frameCount = (this.frameCount || 0) + 1;
        
        // Remove platforms that are too low
        this.cleanupPlatforms(player);
    }

    generateNewPlatforms(player) {
        const playerY = player.mesh.position.y;
        const targetHeight = playerY + 15; // Generate platforms ahead of player
        const maxJumpHeight = 4; // Maximum height player can jump
        
        while (this.highestPlatform < targetHeight) {
            // Calculate safe distance for next platform - much closer
            const minDistance = 0.8; // Much smaller minimum distance
            const maxDistance = 1.8; // Much smaller maximum distance
            
            // Generate platform with guaranteed reachable distance
            const y = this.highestPlatform + minDistance + Math.random() * (maxDistance - minDistance);
            
            // Smart X positioning - ensure platform is reachable
            let x;
            const attempts = 10; // Try multiple positions to find a good one
            let foundGoodPosition = false;
            
            for (let attempt = 0; attempt < attempts; attempt++) {
                x = (Math.random() - 0.5) * 6; // Much smaller range
                
                // Check if this position is reachable from nearby platforms
                const isReachable = this.isPositionReachable(x, y);
                if (isReachable) {
                    foundGoodPosition = true;
                    break;
                }
            }
            
            // If no good position found, create a backup platform above player
            if (!foundGoodPosition) {
                x = player.mesh.position.x + (Math.random() - 0.5) * 2; // Very near player
                console.log(`🆘 Backup platform created near player at (${x.toFixed(1)}, ${y.toFixed(1)})`);
            }
            
            const type = this.getRandomPlatformType();
            const platform = new Platform(x, y, type);
            this.platforms.push(platform);
            
            if (this.scene) {
                this.scene.add(platform.mesh);
            }
            
            this.highestPlatform = y;
            console.log(`🏗️ Smart platform at (${x.toFixed(1)}, ${y.toFixed(1)}) - distance: ${(y - this.highestPlatform + (y - this.highestPlatform)).toFixed(1)}`);
        }
    }
    
    isPositionReachable(x, y) {
        // Check if position is reachable from nearby platforms
        const nearbyPlatforms = this.platforms.filter(platform => {
            const distanceY = y - platform.position.y;
            const distanceX = Math.abs(x - platform.position.x);
            
            // Platform should be within jump range - much more realistic
            return distanceY > 0 && distanceY <= 2.5 && distanceX <= 4;
        });
        
        return nearbyPlatforms.length > 0;
    }
    
    ensurePlayerHasPlatforms(player) {
        const playerY = player.mesh.position.y;
        const playerX = player.mesh.position.x;
        
        // Check if player has any reachable platforms above them
        const reachablePlatforms = this.platforms.filter(platform => {
            const distanceY = platform.position.y - playerY;
            const distanceX = Math.abs(platform.position.x - playerX);
            
            // Platform should be within jump range and not too far horizontally
            return distanceY > 0 && distanceY <= 4 && distanceX <= 6;
        });
        
        // If no reachable platforms, create emergency platform
        if (reachablePlatforms.length === 0) {
            console.log(`🚨 No reachable platforms! Creating emergency platform for player at y=${playerY.toFixed(1)}`);
            
            const emergencyY = playerY + 1.5; // Much closer to player
            const emergencyX = playerX + (Math.random() - 0.5) * 1; // Very near player
            
            const emergencyPlatform = new Platform(emergencyX, emergencyY, 'normal');
            this.platforms.push(emergencyPlatform);
            
            if (this.scene) {
                this.scene.add(emergencyPlatform.mesh);
            }
            
            console.log(`🚨 Emergency platform created at (${emergencyX.toFixed(1)}, ${emergencyY.toFixed(1)})`);
        }
    }

    cleanupPlatforms(player) {
        const playerY = player.mesh.position.y;
        const cleanupThreshold = playerY - 10; // Remove platforms below player
        
        this.platforms = this.platforms.filter(platform => {
            if (platform.position.y < cleanupThreshold) {
                if (this.scene) {
                    this.scene.remove(platform.mesh);
                }
                return false;
            }
            return true;
        });
    }

    getPlatforms() {
        return this.platforms;
    }

    reset() {
        // Remove all platforms from scene
        if (this.scene) {
            this.platforms.forEach(platform => {
                this.scene.remove(platform.mesh);
            });
        }
        
        // Clear platforms array
        this.platforms = [];
        this.highestPlatform = 0;
        
        // Recreate initial platforms
        this.createInitialPlatforms();
        
        // Add back to scene
        if (this.scene) {
            this.platforms.forEach(platform => {
                this.scene.add(platform.mesh);
            });
        }
        
        console.log('🔄 PlatformManager reset complete');
    }

    // Method to adjust difficulty based on height
    adjustDifficulty(height) {
        // Increase difficulty as player goes higher
        const difficulty = Math.min(height / 100, 1);
        
        // Adjust platform weights based on difficulty
        this.platformWeights = [
            Math.max(0.3, 0.6 - difficulty * 0.3), // Normal platforms become less common
            Math.min(0.4, 0.2 + difficulty * 0.2), // Moving platforms become more common
            Math.min(0.3, 0.15 + difficulty * 0.15), // Fragile platforms become more common
            Math.min(0.1, 0.05 + difficulty * 0.05) // Boost platforms become slightly more common
        ];
    }
}
