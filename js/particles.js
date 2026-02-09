import { state } from './state.js';

let particleCanvas = null;
let particleCtx = null;
let particles = [];
const PARTICLE_COUNT = 60;

function resizeParticles() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

function seedParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            r: Math.random() * 2.6 + 0.6,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.6 + 0.2
        });
    }
}

function animateParticles() {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particleCtx.fillStyle = state.particleColor;
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = particleCanvas.width + 20;
        if (p.x > particleCanvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = particleCanvas.height + 20;
        if (p.y > particleCanvas.height + 20) p.y = -20;

        particleCtx.globalAlpha = p.alpha;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}

export function initParticles() {
    particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particleCanvas';
    particleCanvas.className = 'particle-layer';
    document.body.appendChild(particleCanvas);
    particleCtx = particleCanvas.getContext('2d');
    resizeParticles();
    seedParticles();
    window.addEventListener('resize', () => {
        resizeParticles();
        seedParticles();
    });
    requestAnimationFrame(animateParticles);
}
