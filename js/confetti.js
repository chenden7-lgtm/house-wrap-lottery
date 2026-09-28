// Canvas Confetti and Particle Burst System
class ConfettiEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animId = null;
        this.active = false;
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '99999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 120) {
        this.init();
        const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#e11d48', '#38bdf8', '#fbbf24', '#ffffff'];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 12;
            const size = 6 + Math.random() * 8;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1,
                decay: 0.008 + Math.random() * 0.012,
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (!this.active) {
            this.active = true;
            this.render();
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // gravity
            p.vx *= 0.98; // drag
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > window.innerHeight) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(() => this.render());
        } else {
            this.active = false;
        }
    }
}

window.confettiEffect = new ConfettiEffect();
