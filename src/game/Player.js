import * as THREE from 'three';

export class Player {
    constructor() {
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.position = new THREE.Vector3(0, 0, 0);
        this.size = { width: 0.5, height: 0.5 };
        
        this.jumpForce = 8;
        this.gravity = -20;
        this.moveSpeed = 5;
        
        this.isOnGround = false;
        this.glowIntensity = 1;
        
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
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0066,
            emissive: 0xff0066,
            emissiveIntensity: 0.5
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
        
        // Keep player in bounds (wrap around)
        if (this.position.x > 8) {
            this.position.x = -8;
        } else if (this.position.x < -8) {
            this.position.x = 8;
        }
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
        
        // Check if player is falling and above platform
        if (this.velocity.y <= 0 && 
            playerBounds.bottom <= platformBounds.top &&
            playerBounds.bottom >= platformBounds.top - 0.5 &&
            playerBounds.left < platformBounds.right &&
            playerBounds.right > platformBounds.left) {
            
            this.position.y = platformBounds.top + this.size.height / 2;
            this.velocity.y = 0;
            this.isOnGround = true;
            return true;
        }
        
        return false;
    }

    reset() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.isOnGround = false;
        this.mesh.position.copy(this.position);
    }
}
