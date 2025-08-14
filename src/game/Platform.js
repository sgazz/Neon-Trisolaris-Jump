import * as THREE from 'three';

export class Platform {
    constructor(x, y, type = 'normal') {
        this.mesh = null;
        this.position = new THREE.Vector3(x, y, 0);
        this.type = type;
        this.width = 2;
        this.height = 0.3;
        this.isHit = false;
        this.hitTime = 0;
        
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, 0.2);
        
        // Different materials based on platform type
        let material;
        switch (this.type) {
            case 'normal':
                material = new THREE.MeshPhongMaterial({
                    color: 0x00ff88,
                    emissive: 0x00ff88,
                    emissiveIntensity: 0.2,
                    shininess: 50
                });
                break;
            case 'moving':
                material = new THREE.MeshPhongMaterial({
                    color: 0xff8800,
                    emissive: 0xff8800,
                    emissiveIntensity: 0.3,
                    shininess: 50
                });
                this.addMovingEffect();
                break;
            case 'fragile':
                material = new THREE.MeshPhongMaterial({
                    color: 0xff0066,
                    emissive: 0xff0066,
                    emissiveIntensity: 0.4,
                    shininess: 50
                });
                this.addFragileEffect();
                break;
            case 'boost':
                material = new THREE.MeshPhongMaterial({
                    color: 0x0088ff,
                    emissive: 0x0088ff,
                    emissiveIntensity: 0.5,
                    shininess: 50
                });
                this.addBoostEffect();
                break;
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add glow effect
        this.addGlowEffect();
        
        // Add cyberpunk details
        this.addCyberpunkDetails();
    }

    addGlowEffect() {
        const glowGeometry = new THREE.BoxGeometry(this.width * 1.2, this.height * 1.2, 0.3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.mesh.material.color,
            transparent: true,
            opacity: 0.2
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
    }

    addCyberpunkDetails() {
        // Add circuit-like lines
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        
        const points = [];
        const segments = 8;
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments - 0.5) * this.width;
            points.push(new THREE.Vector3(x, -this.height / 2, 0.1));
            points.push(new THREE.Vector3(x, this.height / 2, 0.1));
        }
        
        lineGeometry.setFromPoints(points);
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.mesh.add(lines);
    }

    addMovingEffect() {
        this.moveSpeed = 2;
        this.moveRange = 3;
        this.startX = this.position.x;
        this.moveDirection = 1;
    }

    addFragileEffect() {
        this.fragile = true;
        this.breakTime = 0.5; // Time before breaking after being hit
    }

    addBoostEffect() {
        this.boostForce = 12; // Extra jump force
    }

    update(deltaTime) {
        // Update moving platforms
        if (this.type === 'moving') {
            this.position.x += this.moveSpeed * this.moveDirection * deltaTime;
            
            if (this.position.x > this.startX + this.moveRange || 
                this.position.x < this.startX - this.moveRange) {
                this.moveDirection *= -1;
            }
            
            this.mesh.position.x = this.position.x;
        }
        
        // Update fragile platforms
        if (this.type === 'fragile' && this.isHit) {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.breakTime) {
                this.break();
            } else {
                // Shake effect
                this.mesh.position.x = this.position.x + (Math.random() - 0.5) * 0.1;
                this.mesh.material.opacity = 1 - (this.hitTime / this.breakTime) * 0.5;
            }
        }
        
        // Update glow animation
        this.updateGlow();
    }

    updateGlow() {
        if (this.glowMesh) {
            const time = Date.now() * 0.001;
            this.glowMesh.material.opacity = 0.2 + Math.sin(time * 3) * 0.1;
        }
    }

    hit() {
        this.isHit = true;
        
        // Add hit effect
        this.addHitEffect();
        
        // Play platform hit sound
        if (window.gameInstance && window.gameInstance.game && window.gameInstance.game.audioManager) {
            window.gameInstance.game.audioManager.playPlatformHit();
        }
        
        // Handle different platform types
        if (this.type === 'fragile') {
            this.hitTime = 0;
        }
    }

    addHitEffect() {
        // Create impact particles
        const particleCount = 8;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.mesh.material.color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * this.width,
                this.height / 2 + Math.random() * 0.5,
                (Math.random() - 0.5) * 0.2
            );
            
            particles.add(particle);
        }
        
        this.mesh.add(particles);
        
        // Animate particles
        const animate = () => {
            particles.children.forEach(particle => {
                particle.position.y += 0.05;
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

    break() {
        // Create breaking effect
        const fragmentCount = 6;
        const fragments = new THREE.Group();
        
        for (let i = 0; i < fragmentCount; i++) {
            const fragmentGeometry = new THREE.BoxGeometry(
                this.width / fragmentCount,
                this.height,
                0.2
            );
            const fragmentMaterial = new THREE.MeshPhongMaterial({
                color: this.mesh.material.color,
                transparent: true,
                opacity: 0.8
            });
            
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            fragment.position.set(
                (i - fragmentCount / 2) * (this.width / fragmentCount),
                0,
                0
            );
            
            fragments.add(fragment);
        }
        
        this.mesh.add(fragments);
        
        // Animate fragments falling
        const animate = () => {
            fragments.children.forEach((fragment, index) => {
                fragment.position.y -= 0.1;
                fragment.rotation.z += 0.1;
                fragment.material.opacity -= 0.01;
            });
            
            if (fragments.children[0].material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.mesh.remove(fragments);
            }
        };
        
        animate();
        
        // Hide the platform
        this.mesh.visible = false;
    }

    getBounds() {
        return {
            left: this.position.x - this.width / 2,
            right: this.position.x + this.width / 2,
            top: this.position.y + this.height / 2,
            bottom: this.position.y - this.height / 2
        };
    }

    getJumpForce() {
        if (this.type === 'boost') {
            return this.boostForce;
        }
        return 8; // Default jump force
    }
}
