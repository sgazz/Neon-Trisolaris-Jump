export class InputManager {
    constructor() {
        this.keys = {};
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
}
