export class InputManager {
    constructor() {
        this.keys = {};
        this.mousePosition = { x: 0, y: 0 };
        this.mousePressed = false;
        console.log('InputManager constructor called');
        this.setupEventListeners();
        console.log('InputManager setup complete');
    }

    setupEventListeners() {
        console.log('Setting up input event listeners...');
        
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        });

        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touchX = event.touches[0].clientX;
            const touchY = event.touches[0].clientY;
            
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;

            // Horizontal movement
            if (Math.abs(deltaX) > 10) {
                this.keys['ArrowLeft'] = deltaX < 0;
                this.keys['ArrowRight'] = deltaX > 0;
            }

            // Jump on tap
            if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10) {
                this.keys['Space'] = true;
                setTimeout(() => { this.keys['Space'] = false; }, 100);
            }
        });

        document.addEventListener('touchend', (event) => {
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });
        
        // Mouse controls
        document.addEventListener('mousemove', (event) => {
            // Get canvas element
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) return;
            
            // Convert screen coordinates to world coordinates
            const rect = canvas.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Convert to world coordinates (assuming camera is at z=10)
            this.mousePosition.x = x * 10;
            this.mousePosition.y = y * 5;
            

        });
        
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left click
                this.mousePressed = true;
            }
        });
        
        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left click
                this.mousePressed = false;
            }
        });
        
        console.log('Input event listeners setup complete');
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    getHorizontalInput() {
        let input = 0;
        if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) {
            input -= 1;
        }
        if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) {
            input += 1;
        }
        return input;
    }

    isJumpPressed() {
        return this.isKeyPressed('Space') || this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW');
    }
    
    getMousePosition() {
        return this.mousePosition;
    }
    
    isMousePressed() {
        return this.mousePressed;
    }
}
