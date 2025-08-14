import * as THREE from 'three';

export class EnemyShip {
    constructor(x, y, type = 'basic') {
        this.mesh = null;
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.size = { width: 0.6, height: 0.6 };
        this.type = type;
        this.health = this.getHealthForType(type);
        this.maxHealth = this.health;
        this.speed = 2;
        this.movePattern = this.getMovePattern(type);
        this.patternTimer = 0;
        this.isDestroyed = false;
        this.frameCount = 0;
        
        this.createMesh();
    }

    getHealthForType(type) {
        switch (type) {
            case 'basic': return 3;
            case 'fast': return 2;
            case 'tank': return 5;
            default: return 3;
        }
    }

    getMovePattern(type) {
        switch (type) {
            case 'basic': return 'zigzag';
            case 'fast': return 'chase';
            case 'tank': return 'patrol';
            default: return 'zigzag';
        }
    }

    createMesh() {
        // Create enemy ship geometry
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, 0.2);
        
        // Enemy material - red/neon red
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0044,
            emissive: 0xff0044,
            emissiveIntensity: 0.4,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(this.size.width * 1.3, this.size.height * 1.3, 0.3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            transparent: true,
            opacity: 0.3
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
        
        // Add enemy details
        this.addEnemyDetails();
        
        // Add health bar
        this.createHealthBar();
    }

    addEnemyDetails() {
        // Add antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xff0044 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, this.size.height / 2 + 0.15, 0);
        this.mesh.add(antenna);
        
        // Add glowing eye
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0066,
            emissive: 0xff0066,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(0, 0, 0.15);
        this.mesh.add(eye);
        
        // Add weapon turret
        const turretGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1);
        const turretMaterial = new THREE.MeshPhongMaterial({ color: 0x880022 });
        const turret = new THREE.Mesh(turretGeometry, turretMaterial);
        turret.position.set(0, -this.size.height / 2 - 0.05, 0);
        this.mesh.add(turret);
    }

    createHealthBar() {
        // Health bar background
        const bgGeometry = new THREE.PlaneGeometry(0.8, 0.1);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.7
        });
        this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.healthBarBg.position.set(0, this.size.height / 2 + 0.3, 0.1);
        this.mesh.add(this.healthBarBg);
        
        // Health bar fill
        const fillGeometry = new THREE.PlaneGeometry(0.8, 0.08);
        const fillMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.healthBarFill = new THREE.Mesh(fillGeometry, fillMaterial);
        this.healthBarFill.position.set(0, this.size.height / 2 + 0.3, 0.11);
        this.mesh.add(this.healthBarFill);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFill.scale.x = healthPercent;
        
        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBarFill.material.color.setHex(0x00ff00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBarFill.material.color.setHex(0xffff00); // Yellow
        } else {
            this.healthBarFill.material.color.setHex(0xff0000); // Red
        }
    }

    update(deltaTime, player) {
        if (this.isDestroyed) return;
        
        this.patternTimer += deltaTime;
        
        // Update movement based on pattern
        this.updateMovement(deltaTime, player);
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);
        
        // Update glow effect
        this.updateGlow();
        
        // Update health bar
        this.updateHealthBar();
        
        // Keep enemy in bounds
        this.keepInBounds();
        
        // Debug logging
        if (this.frameCount % 60 === 0) {
            console.log(`👾 Enemy ${this.type} at (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) - Health: ${this.health}/${this.maxHealth}`);
        }
        this.frameCount++;
    }

    updateMovement(deltaTime, player) {
        switch (this.movePattern) {
            case 'zigzag':
                this.zigzagMovement(deltaTime);
                break;
            case 'chase':
                this.chasePlayer(deltaTime, player);
                break;
            case 'patrol':
                this.patrolMovement(deltaTime);
                break;
        }
    }

    zigzagMovement(deltaTime) {
        // Zigzag pattern
        const time = this.patternTimer * 2;
        this.velocity.x = Math.sin(time) * this.speed;
        this.velocity.y = Math.cos(time * 0.5) * this.speed * 0.5;
    }

    chasePlayer(deltaTime, player) {
        if (!player) return;
        
        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(player.mesh.position, this.position)
            .normalize();
        
        this.velocity.x = direction.x * this.speed * 1.5;
        this.velocity.y = direction.y * this.speed * 1.5;
    }

    patrolMovement(deltaTime) {
        // Slow patrol pattern
        const time = this.patternTimer * 0.5;
        this.velocity.x = Math.sin(time) * this.speed * 0.7;
        this.velocity.y = Math.cos(time * 0.3) * this.speed * 0.3;
    }

    updateGlow() {
        // Animate glow based on health
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.3;
        this.glowMesh.material.opacity = pulse;
        
        // Glow more when damaged
        if (this.health < this.maxHealth * 0.5) {
            this.glowMesh.material.opacity *= 1.5;
        }
    }

    keepInBounds() {
        // Keep enemy within screen bounds
        if (this.position.x > 8) {
            this.position.x = 8;
            this.velocity.x *= -0.5;
        } else if (this.position.x < -8) {
            this.position.x = -8;
            this.velocity.x *= -0.5;
        }
        
        if (this.position.y > 10) {
            this.position.y = 10;
            this.velocity.y *= -0.5;
        } else if (this.position.y < -10) {
            this.position.y = -10;
            this.velocity.y *= -0.5;
        }
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        console.log(`💥 Enemy ${this.type} took ${damage} damage! Health: ${this.health}/${this.maxHealth}`);
        
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.isDestroyed = true;
        console.log(`💀 Enemy ${this.type} destroyed!`);
        
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
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.04, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.95, 1, 0.5), // Red explosion
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(this.position);
            
            // Random velocity for explosion
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
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
                particle.userData.velocity.multiplyScalar(0.98);
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
        
        return bounds.left < otherBounds.right &&
               bounds.right > otherBounds.left &&
               bounds.bottom < otherBounds.top &&
               bounds.top > otherBounds.bottom;
    }
}
