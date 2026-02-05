// Particle System Engine
class Particle {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx || (Math.random() - 0.5) * 2;
    this.vy = config.vy || (Math.random() - 0.5) * 2;
    this.size = config.size || Math.random() * 4 + 2;
    this.color = config.color || '#bd1e59';
    this.life = config.life || 1;
    this.decay = config.decay || 0.01;
    this.gravity = config.gravity || 0;
    this.type = config.type || 'circle';
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || (Math.random() - 0.5) * 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'heart') {
      this.drawHeart(ctx);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawHeart(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const size = this.size;
    ctx.moveTo(0, size / 4);
    ctx.bezierCurveTo(-size, -size / 2, -size, -size, 0, -size / 4);
    ctx.bezierCurveTo(size, -size, size, -size / 2, 0, size / 4);
    ctx.fill();
  }
}

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  addParticle(x, y, config) {
    this.particles.push(new Particle(x, y, config));
  }

  addParticles(count, config = {}) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.addParticle(x, y, config);
    }
  }

  createExplosion(x, y, count = 20, config = {}) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = config.speed || Math.random() * 3 + 2;
      this.addParticle(x, y, {
        ...config,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        decay: 0.02
      });
    }
  }

  createTrail(x, y, config = {}) {
    this.addParticle(x, y, {
      ...config,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      decay: 0.03
    });
  }

  update() {
    this.particles = this.particles.filter(particle => particle.update());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(particle => particle.draw(this.ctx));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  clear() {
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Floating hearts for background
export class FloatingHeartsSystem extends ParticleSystem {
  constructor(canvas) {
    super(canvas);
    this.spawnInterval = null;
  }

  start() {
    super.start();
    this.addParticles(20, {
      type: 'heart',
      size: Math.random() * 10 + 5,
      vy: -0.5 - Math.random(),
      vx: (Math.random() - 0.5) * 0.5,
      color: ['#bd1e59', '#e91e63', '#ff1744'][Math.floor(Math.random() * 3)],
      decay: 0.005
    });

    this.spawnInterval = setInterval(() => {
      const x = Math.random() * this.canvas.width;
      const y = this.canvas.height + 20;
      this.addParticle(x, y, {
        type: 'heart',
        size: Math.random() * 10 + 5,
        vy: -0.5 - Math.random(),
        vx: (Math.random() - 0.5) * 0.5,
        color: ['#bd1e59', '#e91e63', '#ff1744'][Math.floor(Math.random() * 3)],
        decay: 0.005
      });
    }, 300);
  }

  stop() {
    super.stop();
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }
}

// Mouse trail particles
export class TrailSystem extends ParticleSystem {
  constructor(canvas) {
    super(canvas);
    this.lastX = 0;
    this.lastY = 0;
  }

  start() {
    super.start();
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
  }

  stop() {
    super.stop();
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only create trail if mouse moved
    if (Math.abs(x - this.lastX) > 2 || Math.abs(y - this.lastY) > 2) {
      this.createTrail(x, y, {
        type: 'heart',
        size: Math.random() * 5 + 2,
        color: '#bd1e59',
        decay: 0.05
      });
      this.lastX = x;
      this.lastY = y;
    }
  };
}

export default ParticleSystem;
