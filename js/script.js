// Initialize AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 50
});

/* --- Sound Manager (Web Audio API) --- */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('portfolio-sound') === 'true';
        this.init();
    }

    init() {
        if (!this.enabled) return;
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('portfolio-sound', this.enabled);
        if (this.enabled && !this.ctx) {
            this.init();
        }
        return this.enabled;
    }

    play(v) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (v) {
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'click':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'shoot':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'explosion':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                // Add noise for explosion
                this.playNoise(now, 0.4);
                break;
            case 'success':
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
                notes.forEach((freq, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    o.frequency.setValueAtTime(freq, now + i * 0.1);
                    g.gain.setValueAtTime(0.1, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
                    o.start(now + i * 0.1);
                    o.stop(now + i * 0.1 + 0.3);
                });
                break;
            case 'toggle':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
        }
    }

    playNoise(time, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(50, time + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noiseGain.gain.setValueAtTime(0.2, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.start(time);
        noise.stop(time + duration);
    }
}

const sounds = new SoundManager();

// Global Sound Directives
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-sound="hover"]');
    if (target) sounds.play('hover');
});

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-sound="click"]');
    if (target) sounds.play('click');
});


// Custom Cursor Animation
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows cursor exactly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });

    // Parallax Effect for Floating Elements
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((el, index) => {
        const speed = (index + 1) * 20;
        const x = (window.innerWidth - posX * speed) / 100;
        const y = (window.innerHeight - posY * speed) / 100;
        el.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Magnetic Button Effect
    const magneticWraps = document.querySelectorAll('.magnetic-wrap');
    magneticWraps.forEach(wrap => {
        const rect = wrap.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = posX - centerX;
        const distanceY = posY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 100) {
            wrap.style.transform = `translate(${distanceX * 0.3}px, ${distanceY * 0.3}px)`;
        } else {
            wrap.style.transform = `translate(0, 0)`;
        }
    });
});

// Click/Shoot Effect
window.addEventListener('mousedown', () => {
    cursorOutline.classList.add('shooting');
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    sounds.play('shoot');
});

window.addEventListener('mouseup', () => {
    cursorOutline.classList.remove('shooting');
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
});

/* --- Mini Game Logic --- */
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
let score = 0;

function spawnTarget() {
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

    // Animate across screen lightly
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

    // Click Handler (Shoot)
    target.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger other things
        createExplosion(e.clientX, e.clientY);
        sounds.play('explosion');
        score += 100;
        scoreDisplay.innerText = score;
        scoreDisplay.style.transform = 'scale(1.5)';
        setTimeout(() => scoreDisplay.style.transform = 'scale(1)', 200);
        target.remove();
    });

    // Auto-remove after some time
    setTimeout(() => {
        if (document.body.contains(target)) {
            target.style.opacity = '0';
            target.style.transform = 'scale(0)';
            setTimeout(() => target.remove(), 500);
        }
    }, duration);

    gameContainer.appendChild(target);
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.left = `${x - 20}px`;
    explosion.style.top = `${y - 20}px`;
    gameContainer.appendChild(explosion);

    setTimeout(() => explosion.remove(), 500);
}

// Spawn Loop
setInterval(spawnTarget, 2000); // New target every 2s

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenuBtn = document.querySelector('.close-menu-btn');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function toggleMenu() {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', toggleMenu);
}

mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});

// Language Switching Logic
const langBtns = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('portfolio-lang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = translations[lang].dir;

    // Update UI buttons
    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Translate all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Handle placeholder translations
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
        // We'd need specific keys for placeholders or just use the label translation
        // For now, let's just use the form keys if available
    });

    // Refresh Lucide icons as translations might overwrite them if they were inside the same tag
    // (though we usually put i18n on spans next to icons)
    lucide.createIcons();
}

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
    });
});

// Load preferences on DOM load
window.addEventListener('DOMContentLoaded', () => {
    // Other loading logic...
    setLanguage(currentLang);
});

/* --- Theme Settings Logic --- */
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const themeToggle = document.getElementById('theme-toggle');
const colorSwatches = document.querySelectorAll('.color-swatch');

// Toggle Settings Panel
settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsToggle.contains(e.target) && !settingsPanel.contains(e.target)) {
        settingsPanel.classList.remove('active');
    }
});

// Light/Dark Mode Toggle
themeToggle.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    updateThemeUI(newTheme);
    sounds.play('toggle');
});

function updateThemeUI(theme) {
    const themeText = document.getElementById('theme-text');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'light') {
        if (themeText) themeText.innerText = 'Dark Mode';
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'inline-block';
    } else {
        if (themeText) themeText.innerText = 'Light Mode';
        if (sunIcon) sunIcon.style.display = 'inline-block';
        if (moonIcon) moonIcon.style.display = 'none';
    }
    // Refresh lucide icons for the toggle
    lucide.createIcons();
}

// Accent Color Change
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        document.documentElement.style.setProperty('--primary-color', color);

        // Update active swatch
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        localStorage.setItem('portfolio-accent', color);
        sounds.play('toggle');
    });
});

// Sound Toggle Logic
const soundToggle = document.getElementById('sound-toggle');
const soundText = document.getElementById('sound-text');
const volOnIcon = document.querySelector('.volume-on-icon');
const volOffIcon = document.querySelector('.volume-off-icon');

function updateSoundUI(enabled) {
    const key = enabled ? 'sound_on' : 'sound_off';
    if (soundText) soundText.innerText = translations[currentLang][key] || (enabled ? 'Sound: ON' : 'Sound: OFF');
    if (volOnIcon) volOnIcon.style.display = enabled ? 'inline-block' : 'none';
    if (volOffIcon) volOffIcon.style.display = enabled ? 'none' : 'inline-block';
}

if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        const enabled = sounds.toggle();
        updateSoundUI(enabled);
        if (enabled) sounds.play('toggle');
    });
}

// Load preferences
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedAccent = localStorage.getItem('portfolio-accent');
    const savedSound = localStorage.getItem('portfolio-sound') === 'true';

    updateSoundUI(savedSound);

    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    }

    if (savedAccent) {
        document.documentElement.style.setProperty('--primary-color', savedAccent);
        // Mark active swatch
        colorSwatches.forEach(swatch => {
            if (swatch.getAttribute('data-color') === savedAccent) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
    }
});

// Timeline Progress Animation
const timeline = document.querySelector('.timeline');
const progress = document.querySelector('.timeline-progress');

window.addEventListener('scroll', () => {
    if (timeline && progress) {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the timeline is visible
        if (rect.top < windowHeight && rect.bottom > 0) {
            const totalHeight = rect.height;
            const scrolledHeight = windowHeight - rect.top;
            let percentage = (scrolledHeight / totalHeight) * 100;

            percentage = Math.min(Math.max(percentage * 0.8, 0), 100); // 0.8 for a slightly slower reveal
            progress.style.height = `${percentage}%`;
        }
    }
});

// Form Submission Animation
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const originalContent = btn.innerHTML;

        // Disable and show loading
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Submitting...';
        lucide.createIcons();

        // Mock API Call delay
        setTimeout(() => {
            sounds.play('success');
            contactForm.innerHTML = `
                <div class="success-icon" data-aos="zoom-in">
                    <i data-lucide="check"></i>
                </div>
                <h3 data-aos="fade-up">Message Sent!</h3>
                <p data-aos="fade-up" data-aos-delay="100">Thank you for reaching out. I'll get back to you within 24 hours.</p>
                <button class="btn btn-outline" onclick="location.reload()" style="margin-top: 20px;">Send Another</button>
            `;
            lucide.createIcons();
        }, 2000);
    });
}

// Active Navigation Highlight
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNav() {
    let scrollY = window.scrollY;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(sectionId)) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNav);

// Smooth Scroll for Anchors (Polyfill-like behavior if needed, though html {scroll-behavior: smooth} handles most)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


