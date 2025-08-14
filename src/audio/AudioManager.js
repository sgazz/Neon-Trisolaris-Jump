export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.volume = 0.7;
        
        this.init();
    }

    init() {
        this.setupAudioContext();
        this.loadSounds();
    }

    setupAudioContext() {
        // Create audio context for better audio control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    loadSounds() {
        // Create simple synthesized sounds
        this.createJumpSound();
        this.createPlatformHitSound();
        this.createGameOverSound();
        this.createBackgroundMusic();
        this.createPowerUpSound();
        this.createLaserSound();
        this.createExplosionSound();
    }

    createJumpSound() {
        // Create a simple jump sound using Web Audio API
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            this.sounds.jump = { oscillator, gainNode, context: this.audioContext };
        }
    }

    createPlatformHitSound() {
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            this.sounds.platformHit = { oscillator, gainNode, context: this.audioContext };
        }
    }

    createGameOverSound() {
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            this.sounds.gameOver = { oscillator, gainNode, context: this.audioContext };
        }
    }

    createPowerUpSound() {
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            this.sounds.powerUp = { oscillator, gainNode, context: this.audioContext };
        }
    }
    
    createLaserSound() {
        if (this.audioContext) {
            this.sounds.laser = { context: this.audioContext };
        }
    }
    
    createExplosionSound() {
        if (this.audioContext) {
            this.sounds.explosion = { context: this.audioContext };
        }
    }

    createBackgroundMusic() {
        // Create ambient background music using multiple oscillators
        if (this.audioContext) {
            this.music = {
                oscillators: [],
                gainNodes: [],
                context: this.audioContext,
                isPlaying: false
            };
            
            // Create multiple layers for ambient music
            const frequencies = [220, 330, 440]; // A3, E4, A4
            const volumes = [0.05, 0.03, 0.02];
            
            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(volumes[index], this.audioContext.currentTime);
                
                this.music.oscillators.push(oscillator);
                this.music.gainNodes.push(gainNode);
            });
        }
    }

    playJump() {
        if (this.isMuted || !this.sounds.jump) return;
        
        try {
            const { context } = this.sounds.jump;
            
            // Resume audio context if suspended
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(400, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            console.warn('Could not play jump sound:', e);
        }
    }

    playPlatformHit() {
        if (this.isMuted || !this.sounds.platformHit) return;
        
        try {
            const { context } = this.sounds.platformHit;
            
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(200, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.2 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.05);
        } catch (e) {
            console.warn('Could not play platform hit sound:', e);
        }
    }

    playGameOver() {
        if (this.isMuted || !this.sounds.gameOver) return;
        
        try {
            const { context } = this.sounds.gameOver;
            
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(300, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) {
            console.warn('Could not play game over sound:', e);
        }
    }

    playPowerUp() {
        if (this.isMuted || !this.sounds.powerUp) return;
        
        try {
            const { context } = this.sounds.powerUp;
            
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(600, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.2);
        } catch (e) {
            console.warn('Could not play power-up sound:', e);
        }
    }
    
    playLaser() {
        if (this.isMuted || !this.sounds.laser) return;
        
        try {
            const { context } = this.sounds.laser;
            
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(800, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.2 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.05);
        } catch (e) {
            console.warn('Could not play laser sound:', e);
        }
    }
    
    playExplosion() {
        if (this.isMuted || !this.sounds.explosion) return;
        
        try {
            const { context } = this.sounds.explosion;
            
            if (context.state === 'suspended') {
                context.resume();
            }
            
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(150, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, context.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4 * this.volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) {
            console.warn('Could not play explosion sound:', e);
        }
    }

    startBackgroundMusic() {
        if (this.isMuted || !this.music || this.music.isPlaying) return;
        
        try {
            // Stop any existing music first
            this.stopBackgroundMusic();
            
            // Create new oscillators for each restart
            this.music.oscillators = [];
            this.music.gainNodes = [];
            
            const frequencies = [220, 330, 440]; // A3, E4, A4
            const volumes = [0.05, 0.03, 0.02];
            
            frequencies.forEach((freq, index) => {
                const oscillator = this.music.context.createOscillator();
                const gainNode = this.music.context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.music.context.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.music.context.currentTime);
                gainNode.gain.setValueAtTime(volumes[index] * this.volume, this.music.context.currentTime);
                
                this.music.oscillators.push(oscillator);
                this.music.gainNodes.push(gainNode);
                
                oscillator.start(this.music.context.currentTime);
            });
            
            this.music.isPlaying = true;
        } catch (e) {
            console.warn('Could not start background music:', e);
        }
    }

    stopBackgroundMusic() {
        if (!this.music || !this.music.isPlaying) return;
        
        try {
            this.music.oscillators.forEach(oscillator => {
                try {
                    oscillator.stop(this.music.context.currentTime);
                } catch (e) {
                    // Oscillator might already be stopped
                }
            });
            this.music.isPlaying = false;
            this.music.oscillators = [];
            this.music.gainNodes = [];
        } catch (e) {
            console.warn('Could not stop background music:', e);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update background music volume
        if (this.music && this.music.gainNodes) {
            const volumes = [0.05, 0.03, 0.02];
            this.music.gainNodes.forEach((gainNode, index) => {
                gainNode.gain.setValueAtTime(volumes[index] * this.volume, this.music.context.currentTime);
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
        
        return this.isMuted;
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
