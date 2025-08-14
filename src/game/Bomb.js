import * as THREE from 'three';

export class Bomb {
    constructor(x, y, speed = 3, damage = 1) {
        this.mesh = null;
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3(0, speed, 0); // Move upward towards player
        this.size = { width: 0.4, height: 0.4 };
        this.damage = damage;
        this.speed = speed;
        this.life = 1;
        this.isDestroyed = false;
        this.frameCount = 0; // For debug logging
        
        this.createMesh();
    }

    createMesh() {
        // Create bomb geometry
        const geometry = new THREE.SphereGeometry(this.size.width / 2, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 0.3,
            shininess: 50
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(this.size.width / 2 + 0.1, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.4
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
        
        // Add fuse
        this.addFuse();
        
        // Add particle trail
        this.addTrail();
    }

    addFuse() {
        const fuseGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        const fuseMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.set(0, this.size.height / 2 + 0.1, 0);
        this.mesh.add(fuse);
        
        // Add sparkle effect to fuse
        const sparkleGeometry = new THREE.SphereGeometry(0.01, 4, 4);
        const sparkleMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        
        this.sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        this.sparkle.position.set(0, this.size.height / 2 + 0.25, 0);
        this.mesh.add(this.sparkle);
    }

    addTrail() {
        this.trailParticles = [];
        for (let i = 0; i < 5; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.6
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 0.2,
                this.size.height / 2 + 0.1 + i * 0.1,
                (Math.random() - 0.5) * 0.2
            );
            
            this.mesh.add(particle);
            this.trailParticles.push(particle);
        }
    }

    update(deltaTime) {
        if (this.isDestroyed) return;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);
        
        // Debug: Log bomb position every 60 frames
        if (this.frameCount % 60 === 0) {
            console.log(`💣 Bomb at y=${this.position.y.toFixed(1)}, velocity.y=${this.velocity.y.toFixed(1)}`);
        }
        this.frameCount = (this.frameCount || 0) + 1;
        
        // Update sparkle animation
        if (this.sparkle) {
            this.sparkle.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.02) * 0.5;
        }
        
        // Update trail particles
        this.trailParticles.forEach((particle, index) => {
            particle.position.y = this.size.height / 2 + 0.1 + index * 0.1;
            particle.material.opacity = 0.6 - index * 0.1;
        });
        

        
        // Check if bomb is out of bounds (above screen)
        if (this.position.y > 20) {
            // Get player position for debug
            const playerY = window.gameInstance && window.gameInstance.game && window.gameInstance.game.player ? 
                window.gameInstance.game.player.mesh.position.y : 0;
            console.log(`💣 Bomb destroyed at y=${this.position.y.toFixed(1)} - out of bounds (Player at y=${playerY.toFixed(1)})`);
            this.destroy();
        }
    }

    destroy() {
        this.isDestroyed = true;
        
        // Create explosion effect
        this.createExplosion();
        
        // Remove from scene
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        
        // Play explosion sound
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.audioManager) {
            window.gameInstance.game.audioManager.playExplosion();
        }
    }

    createExplosion() {
        const explosionParticles = new THREE.Group();
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5),
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(this.position);
            
            // Random velocity for explosion
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            
            particle.userData = { velocity };
            explosionParticles.add(particle);
        }
        
        // Add explosion to scene
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.add(explosionParticles);
        }
        
        // Animate explosion
        const animate = () => {
            explosionParticles.children.forEach(particle => {
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                particle.material.opacity -= 0.02;
                particle.userData.velocity.multiplyScalar(0.98); // Slow down
            });
            
            if (explosionParticles.children[0].material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                if (explosionParticles.parent) {
                    explosionParticles.parent.remove(explosionParticles);
                }
            }
        };
        
        animate();
    }

    getBounds() {
        return {
            left: this.position.x - this.size.width / 2,
            right: this.position.x + this.size.width / 2,
            bottom: this.position.y - this.size.height / 2,
            top: this.position.y + this.size.height / 2
        };
    }

    checkCollision(other) {
        const bounds = this.getBounds();
        
        if (!other.getBounds) {
            console.warn('Object does not have getBounds method:', other);
            return false;
        }
        
        const otherBounds = other.getBounds();
        
        const collision = bounds.left < otherBounds.right &&
               bounds.right > otherBounds.left &&
               bounds.bottom < otherBounds.top &&
               bounds.top > otherBounds.bottom;
        
        if (collision) {
            console.log('⚡ Collision detected between bomb and object');
        }
        
        return collision;
    }
}
