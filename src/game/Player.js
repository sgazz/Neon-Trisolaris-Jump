import * as THREE from 'three';

export class Player {
    constructor() {
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.position = new THREE.Vector3(0, 0, 0);
        this.size = { width: 0.5, height: 0.5 };
        
        this.jumpForce = 12; // Increased jump force
        this.gravity = -25; // Slightly stronger gravity
        this.moveSpeed = 5;
        
        this.isOnGround = false;
        this.glowIntensity = 1;
        
        // Laser system
        this.lasers = [];
        this.laserCooldown = 0;
        this.laserCooldownTime = 0.2; // 200ms between shots
        this.laserSpeed = 15;
        this.laserDamage = 1;
        this.frameCount = 0; // For debug logging
        
        this.createMesh();
    }

    createMesh() {
        // Create player geometry with neon glow effect
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, 0.2);
        
        // Main material with neon glow
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Add glow effect using a larger transparent mesh
        const glowGeometry = new THREE.BoxGeometry(this.size.width * 1.5, this.size.height * 1.5, 0.3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
        
        // Add some cyberpunk details
        this.addCyberpunkDetails();
    }

    addCyberpunkDetails() {
        // Add antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, this.size.height / 2 + 0.15, 0);
        this.mesh.add(antenna);
        
        // Add glowing eye
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0066,
            emissive: 0xff0066,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(0, 0, 0.15);
        this.mesh.add(eye);
    }

    update(deltaTime, inputManager) {
        // Handle horizontal movement
        const horizontalInput = inputManager.getHorizontalInput();
        this.velocity.x = horizontalInput * this.moveSpeed;
        
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Apply position to mesh
        this.mesh.position.copy(this.position);
        
        // Update glow effect
        this.updateGlow();
        
        // Update lasers
        this.updateLasers(deltaTime);
        
        // Keep player in bounds (wrap around)
        if (this.position.x > 8) {
            this.position.x = -8;
        } else if (this.position.x < -8) {
            this.position.x = 8;
        }
        
        // Update frame count for debug
        this.frameCount++;
    }

    updateGlow() {
        // Animate glow based on movement
        this.glowIntensity = 0.3 + Math.abs(this.velocity.x) * 0.1;
        this.glowMesh.material.opacity = this.glowIntensity;
        
        // Pulse effect when jumping
        if (!this.isOnGround) {
            this.glowIntensity += Math.sin(Date.now() * 0.01) * 0.1;
        }
    }

    jump() {
        if (this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
            
            console.log(`🦘 Jump! Force: ${this.jumpForce}, Velocity: ${this.velocity.y}`);
            
            // Add jump effect
            this.addJumpEffect();
            
            // Play jump sound
            if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.audioManager) {
                window.gameInstance.game.audioManager.playJump();
            }
        }
    }

    addJumpEffect() {
        // Create particle effect for jump
        const particleCount = 10;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            particles.add(particle);
        }
        
        this.mesh.add(particles);
        
        // Animate particles
        const animate = () => {
            particles.children.forEach(particle => {
                particle.position.y -= 0.1;
                particle.material.opacity -= 0.02;
            });
            
            if (particles.children[0].material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.mesh.remove(particles);
            }
        };
        
        animate();
    }

    checkPlatformCollision(platform) {
        const playerBounds = {
            left: this.position.x - this.size.width / 2,
            right: this.position.x + this.size.width / 2,
            bottom: this.position.y - this.size.height / 2,
            top: this.position.y + this.size.height / 2
        };
        
        const platformBounds = platform.getBounds();
        
        // Debug collision detection
        if (this.frameCount % 60 === 0) {
            console.log(`🔍 Checking collision: Player bottom=${playerBounds.bottom.toFixed(1)}, Platform top=${platformBounds.top.toFixed(1)}, velocity.y=${this.velocity.y.toFixed(1)}, distance=${(platformBounds.top - playerBounds.bottom).toFixed(1)}`);
        }
        
        // Check if player is falling and above platform
        if (this.velocity.y <= 0 && 
            playerBounds.bottom <= platformBounds.top &&
            playerBounds.bottom >= platformBounds.top - 0.8 && // Increased collision range
            playerBounds.left < platformBounds.right &&
            playerBounds.right > platformBounds.left) {
            
            console.log(`✅ Platform collision detected! Player at y=${this.position.y.toFixed(1)}, Platform at y=${platformBounds.top.toFixed(1)}`);
            this.position.y = platformBounds.top + this.size.height / 2;
            this.velocity.y = 0;
            this.isOnGround = true;
            return true;
        }
        
        return false;
    }

    reset() {
        // Start player on the first platform (y = 0)
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.isOnGround = true; // Start on ground
        this.mesh.position.copy(this.position);
        
        // Clear all lasers
        this.lasers.forEach(laser => {
            if (laser.mesh && laser.mesh.parent) {
                laser.mesh.parent.remove(laser.mesh);
            }
        });
        this.lasers = [];
        
        // Reset frame count
        this.frameCount = 0;
        
        console.log(`🔄 Player reset complete - positioned at (${this.position.x}, ${this.position.y})`);
    }
    
    // Laser system methods
    shootLaser(mousePosition, scene) {
        if (this.laserCooldown > 0) return;
        
        // Calculate direction from player to mouse
        const direction = new THREE.Vector3(
            mousePosition.x - this.position.x,
            mousePosition.y - this.position.y,
            0
        ).normalize();
        
        // Create laser
        const laser = this.createLaser(direction);
        this.lasers.push(laser);
        
        // Add to scene
        scene.add(laser.mesh);
        
        console.log('🔫 Laser fired! Total lasers:', this.lasers.length);
        
        // Set cooldown
        this.laserCooldown = this.laserCooldownTime;
        
        // Play laser sound
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.audioManager) {
            window.gameInstance.game.audioManager.playLaser();
        }
    }
    
    createLaser(direction) {
        // Create laser geometry - make it thicker and longer
        const laserGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
        const laserMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff, // Pure white
            emissive: 0xffffff, // White glow
            emissiveIntensity: 2.0, // Much stronger intensity
            transparent: true,
            opacity: 1.0, // Fully opaque
            shininess: 200 // Very shiny
        });
        
        const laserMesh = new THREE.Mesh(laserGeometry, laserMaterial);
        
        // Position laser at player's tail (back)
        laserMesh.position.copy(this.position);
        laserMesh.position.x -= direction.x * 0.3;
        laserMesh.position.y -= direction.y * 0.3;
        
        // Rotate laser to point in direction
        laserMesh.lookAt(
            laserMesh.position.clone().add(direction.clone().multiplyScalar(10))
        );
        
        // Add bright white glow effect
        const glowGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White glow
            transparent: true,
            opacity: 0.6 // More visible
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        laserMesh.add(glowMesh);
        
        // Add outer glow for extra visibility
        const outerGlowGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan outer glow
            transparent: true,
            opacity: 0.3
        });
        
        const outerGlowMesh = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        laserMesh.add(outerGlowMesh);
        
        // Add trail effect
        const trailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        
        const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
        trailMesh.position.z = -0.1; // Slightly behind the main laser
        laserMesh.add(trailMesh);
        
        return {
            mesh: laserMesh,
            direction: direction,
            speed: this.laserSpeed,
            damage: this.laserDamage,
            life: 2.0, // Laser disappears after 2 seconds
            glowMesh: glowMesh,
            outerGlowMesh: outerGlowMesh,
            trailMesh: trailMesh,
            getBounds: () => ({
                left: laserMesh.position.x - 0.1,
                right: laserMesh.position.x + 0.1,
                bottom: laserMesh.position.y - 0.1,
                top: laserMesh.position.y + 0.1
            })
        };
    }
    
    updateLasers(deltaTime) {
        // Update cooldown
        if (this.laserCooldown > 0) {
            this.laserCooldown -= deltaTime;
        }
        
        // Update existing lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            // Move laser
            laser.mesh.position.add(
                laser.direction.clone().multiplyScalar(laser.speed * deltaTime)
            );
            
            // Animate glow effects
            if (laser.glowMesh && laser.outerGlowMesh) {
                const pulse = Math.sin(Date.now() * 0.02) * 0.2 + 0.8; // Pulsing effect
                laser.glowMesh.material.opacity = 0.6 * pulse;
                laser.outerGlowMesh.material.opacity = 0.3 * pulse;
                
                // Rotate glow effects for dynamic look
                laser.glowMesh.rotation.z += deltaTime * 2;
                laser.outerGlowMesh.rotation.z -= deltaTime * 1.5;
            }
            
            // Animate trail effect
            if (laser.trailMesh) {
                const trailPulse = Math.sin(Date.now() * 0.03) * 0.1 + 0.4;
                laser.trailMesh.material.opacity = trailPulse;
            }
            
            // Reduce life
            laser.life -= deltaTime;
            
            // Remove laser if it's out of bounds or expired
            if (laser.life <= 0 || 
                Math.abs(laser.mesh.position.x) > 15 || 
                Math.abs(laser.mesh.position.y) > 15) {
                
                if (laser.mesh.parent) {
                    laser.mesh.parent.remove(laser.mesh);
                }
                this.lasers.splice(i, 1);
            }
        }
    }
    
    getLasers() {
        return this.lasers;
    }
    
    getBounds() {
        return {
            left: this.position.x - this.size.width / 2,
            right: this.position.x + this.size.width / 2,
            bottom: this.position.y - this.size.height / 2,
            top: this.position.y + this.size.height / 2
        };
    }
}
