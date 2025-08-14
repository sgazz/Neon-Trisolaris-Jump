import { Platform } from './Platform.js';

export class PlatformManager {
    constructor() {
        this.platforms = [];
        this.scene = null;
        this.highestPlatform = 0;
        this.platformTypes = ['normal', 'moving', 'fragile', 'boost'];
        this.platformWeights = [0.6, 0.2, 0.15, 0.05]; // Probability weights
        
        this.init();
    }

    init() {
        // Create initial platforms
        this.createInitialPlatforms();
    }

    createInitialPlatforms() {
        // Start with a few platforms
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * 12;
            const y = i * 3;
            const type = this.getRandomPlatformType();
            const platform = new Platform(x, y, type);
            this.platforms.push(platform);
            this.highestPlatform = Math.max(this.highestPlatform, y);
        }
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
        
        // Remove platforms that are too low
        this.cleanupPlatforms(player);
    }

    generateNewPlatforms(player) {
        const playerY = player.mesh.position.y;
        const targetHeight = playerY + 15; // Generate platforms ahead of player
        
        while (this.highestPlatform < targetHeight) {
            const x = (Math.random() - 0.5) * 12;
            const y = this.highestPlatform + 2 + Math.random() * 2;
            const type = this.getRandomPlatformType();
            
            const platform = new Platform(x, y, type);
            this.platforms.push(platform);
            
            if (this.scene) {
                this.scene.add(platform.mesh);
            }
            
            this.highestPlatform = y;
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
