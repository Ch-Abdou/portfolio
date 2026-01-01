class ShootingGame {
    constructor(soundManager) {
        this.sounds = soundManager;
        this.container = document.getElementById('game-container');
        this.scoreDisplay = document.getElementById('score');
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('portfolio-highscore')) || 0;
        this.isPlaying = false;
        this.spawnInterval = null;

        this.init();
    }

    init() {
        this.updateScoreUI();
        // Create UI controls if they don't exist
        this.createControls();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'game-controls';
        controls.innerHTML = `
            <div class="score-panel">
                <div class="current-score"><i data-lucide="crosshair"></i> <span id="score-val">0</span></div>
                <div class="high-score"><i data-lucide="trophy"></i> <span id="highscore-val">${this.highScore}</span></div>
            </div>
            <button id="game-toggle" class="game-btn" data-sound="click">
                <i data-lucide="play"></i>
            </button>
        `;
        document.body.appendChild(controls);

        // Re-bind score display to new element
        this.scoreDisplay = document.getElementById('score-val');
        this.highScoreDisplay = document.getElementById('highscore-val');

        // Hide original floating score if present
        const oldScore = document.querySelector('.score-board');
        if (oldScore) oldScore.style.display = 'none';

        // Event Listeners
        document.getElementById('game-toggle').addEventListener('click', () => this.toggleGame());

        // Refresh icons
        if (window.lucide) window.lucide.createIcons();
    }

    toggleGame() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('game-toggle');
        const icon = btn.querySelector('i');

        if (this.isPlaying) {
            btn.classList.add('active');
            // Change icon to pause (manually or via lucide)
            btn.innerHTML = '<i data-lucide="pause"></i>';
            this.startGame();
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i data-lucide="play"></i>';
            this.stopGame();
        }
        if (window.lucide) window.lucide.createIcons();
        if (this.sounds) this.sounds.play('toggle');
    }

    startGame() {
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        this.spawnInterval = setInterval(() => this.spawnTarget(), 2000);
        this.container.style.display = 'block';
        this.showGameMessage("Shoot the Target!");
    }

    showGameMessage(text) {
        // Remove existing message if any
        const existing = document.querySelector('.game-message');
        if (existing) existing.remove();

        const msg = document.createElement('div');
        msg.className = 'game-message';
        msg.textContent = text;
        document.body.appendChild(msg);

        // Auto remove
        setTimeout(() => msg.remove(), 2500);
    }

    stopGame() {
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        this.container.innerHTML = ''; // Clear existing targets
    }

    spawnTarget() {
        if (!this.isPlaying) return;

        const target = document.createElement('div');
        target.classList.add('game-target');

        // Random Position (avoid edges)
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        target.style.left = `${randomX}px`;
        target.style.top = `${randomY}px`;

        // Random Float Animation
        const duration = 3000 + Math.random() * 2000; // 3-5s
        const moveX = (Math.random() - 0.5) * 200;
        const moveY = (Math.random() - 0.5) * 200;

        target.animate([
            { transform: 'translate(0, 0)' },
            { transform: `translate(${moveX}px, ${moveY}px)` }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        });

        // Click Handler
        target.addEventListener('click', (e) => {
            e.stopPropagation();
            this.createExplosion(e.clientX, e.clientY);
            if (this.sounds) this.sounds.play('explosion');
            this.addScore(100);
            target.remove();
        });

        // Auto-remove
        setTimeout(() => {
            if (document.body.contains(target)) {
                target.style.opacity = '0';
                target.style.transform = 'scale(0)';
                setTimeout(() => target.remove(), 500);
            }
        }, duration);

        this.container.appendChild(target);
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.classList.add('explosion');
        explosion.style.left = `${x - 20}px`;
        explosion.style.top = `${y - 20}px`;
        this.container.appendChild(explosion);
        setTimeout(() => explosion.remove(), 500);
    }

    addScore(points) {
        this.score += points;
        this.updateScoreUI();

        // High Score Check
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('portfolio-highscore', this.highScore);
            this.highScoreDisplay.innerText = this.highScore;
            this.highScoreDisplay.style.color = '#FFA500'; // Gold color highlight
            // Optional: Special sound for record breaking?
        }
    }

    updateScoreUI() {
        if (this.scoreDisplay) {
            this.scoreDisplay.innerText = this.score;
            this.scoreDisplay.style.transform = 'scale(1.5)';
            setTimeout(() => this.scoreDisplay.style.transform = 'scale(1)', 200);
        }
    }
}
