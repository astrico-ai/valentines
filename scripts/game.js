// Heart Catching Game
import audioManager from './audio.js';

class FallingHeart {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = 20;
    this.caught = false;
    this.missed = false;
  }

  update() {
    if (!this.caught && !this.missed) {
      this.y += this.speed;
    }
  }

  draw(ctx) {
    if (this.caught || this.missed) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#e91e63';
    ctx.strokeStyle = '#bd1e59';
    ctx.lineWidth = 2;

    // Draw heart shape
    ctx.beginPath();
    ctx.moveTo(0, this.size / 4);
    ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, -this.size, 0, -this.size / 4);
    ctx.bezierCurveTo(this.size, -this.size, this.size, -this.size / 2, 0, this.size / 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  checkCollision(cursorX, cursorY, cursorSize) {
    const distance = Math.sqrt(
      Math.pow(this.x - cursorX, 2) + Math.pow(this.y - cursorY, 2)
    );
    return distance < (this.size + cursorSize);
  }
}

export class HeartCatchingGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hearts = [];
    this.score = 0;
    this.targetScore = 30;
    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorSize = 30;
    this.isRunning = false;
    this.spawnInterval = null;
    this.lastSpawnTime = 0;
    this.spawnDelay = 800;
    this.onComplete = null;
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  handleMouseMove = (e) => {
    const rect = this.canvas.getBoundingClientRect();
    this.cursorX = e.clientX - rect.left;
    this.cursorY = e.clientY - rect.top;
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.cursorX = touch.clientX - rect.left;
    this.cursorY = touch.clientY - rect.top;
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.score = 0;
    this.hearts = [];
    this.updateLoveMeter();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  spawnHeart() {
    const x = Math.random() * (this.canvas.width - 40) + 20;
    const y = -30;
    const speed = Math.random() * 2 + 2;
    this.hearts.push(new FallingHeart(x, y, speed));
  }

  update(timestamp) {
    // Spawn hearts at intervals
    if (timestamp - this.lastSpawnTime > this.spawnDelay) {
      this.spawnHeart();
      this.lastSpawnTime = timestamp;
    }

    // Update hearts
    this.hearts = this.hearts.filter(heart => {
      heart.update();

      // Check collision with cursor
      if (!heart.caught && !heart.missed && heart.checkCollision(this.cursorX, this.cursorY, this.cursorSize)) {
        heart.caught = true;
        this.score++;
        this.updateLoveMeter();
        audioManager.play('heartCatch');
        this.createCatchEffect(heart.x, heart.y);

        if (this.score >= this.targetScore) {
          this.complete();
        }
        return false;
      }

      // Remove hearts that went off screen
      if (heart.y > this.canvas.height + 50) {
        heart.missed = true;
        return false;
      }

      return true;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw falling hearts
    this.hearts.forEach(heart => heart.draw(this.ctx));

    // Draw cursor
    this.drawCursor();
  }

  drawCursor() {
    this.ctx.save();
    this.ctx.translate(this.cursorX, this.cursorY);

    // Draw glowing circle
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.cursorSize);
    gradient.addColorStop(0, 'rgba(189, 30, 89, 0.5)');
    gradient.addColorStop(0.5, 'rgba(189, 30, 89, 0.3)');
    gradient.addColorStop(1, 'rgba(189, 30, 89, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.cursorSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw heart in center
    const heartSize = 15;
    this.ctx.fillStyle = '#bd1e59';
    this.ctx.beginPath();
    this.ctx.moveTo(0, heartSize / 4);
    this.ctx.bezierCurveTo(-heartSize, -heartSize / 2, -heartSize, -heartSize, 0, -heartSize / 4);
    this.ctx.bezierCurveTo(heartSize, -heartSize, heartSize, -heartSize / 2, 0, heartSize / 4);
    this.ctx.fill();

    this.ctx.restore();
  }

  createCatchEffect(x, y) {
    // Create particle explosion effect
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 3;
      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 4
      };
      this.animateParticle(particle);
    }
  }

  animateParticle(particle) {
    const animate = () => {
      if (particle.life <= 0) return;

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.05;

      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = '#ff1744';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      requestAnimationFrame(animate);
    };
    animate();
  }

  updateLoveMeter() {
    const percentage = Math.min((this.score / this.targetScore) * 100, 100);
    const loveMeter = document.getElementById('loveMeter');
    const lovePercentage = document.getElementById('lovePercentage');

    if (loveMeter) {
      loveMeter.style.width = percentage + '%';
    }
    if (lovePercentage) {
      lovePercentage.textContent = Math.round(percentage) + '%';
    }
  }

  complete() {
    this.stop();
    audioManager.play('gameComplete');
    if (this.onComplete) {
      this.onComplete();
    }
  }

  animate(timestamp = 0) {
    if (!this.isRunning) return;

    this.update(timestamp);
    this.draw();

    requestAnimationFrame((ts) => this.animate(ts));
  }
}

export default HeartCatchingGame;
