// Animation Controllers
import audioManager from './audio.js';

export class StageManager {
  constructor() {
    this.currentStage = 1;
    this.stages = {
      1: document.getElementById('stage1'),
      2: document.getElementById('stage2'),
      3: document.getElementById('stage3'),
      4: document.getElementById('stage4')
    };
  }

  transitionTo(stageNumber) {
    if (this.stages[this.currentStage]) {
      this.stages[this.currentStage].classList.remove('active');
    }

    this.currentStage = stageNumber;

    if (this.stages[stageNumber]) {
      setTimeout(() => {
        this.stages[stageNumber].classList.add('active');
      }, 300);
    }
  }
}

export class ButtonChaseController {
  constructor(yesButton, noButton, questionCard) {
    this.yesButton = yesButton;
    this.noButton = noButton;
    this.questionCard = questionCard;
    this.yesEscapeCount = 0;
    this.maxYesEscapes = 3;
    this.isYesCatchable = false;
    this.noEscapeCount = 0;
    this.onYesClick = null;
    this.onNoClick = null;

    this.encouragementMessages = [
      "Not so fast! 😏",
      "Catch me if you can! 💕",
      "Almost there! 🏃",
      "One more time! ✨",
      "You can do it! 💪"
    ];

    this.noMessages = [
      "No",
      "Are you sure?",
      "Pookie please",
      "Don't do this to me :(",
      "You're breaking my heart",
      "I'm gonna cry..."
    ];

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Yes button hover/click handling
    this.yesButton.addEventListener('mouseenter', () => this.handleYesHover());
    this.yesButton.addEventListener('click', (e) => this.handleYesClick(e));

    // No button hover/click handling
    this.noButton.addEventListener('mouseenter', () => this.handleNoHover());
    this.noButton.addEventListener('mousemove', (e) => this.handleNoMouseMove(e));
    this.noButton.addEventListener('click', (e) => this.handleNoClick(e));

    // Touch support
    this.yesButton.addEventListener('touchstart', (e) => {
      if (!this.isYesCatchable) {
        e.preventDefault();
        this.handleYesHover();
      }
    });
    this.noButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleNoHover();
    });
  }

  handleYesHover() {
    if (this.isYesCatchable) {
      audioManager.play('buttonHover');
      return;
    }

    if (this.yesEscapeCount < this.maxYesEscapes) {
      this.evadeYesButton();
    }
  }

  evadeYesButton() {
    audioManager.play('buttonEvade');
    this.yesEscapeCount++;

    // Show encouragement message
    const encouragementText = document.getElementById('encouragementText');
    if (encouragementText) {
      encouragementText.textContent = this.encouragementMessages[this.yesEscapeCount - 1] || this.encouragementMessages[0];
    }

    // Update escape counter
    const chaseCounter = document.getElementById('chaseCounter');
    const escapeCount = document.getElementById('escapeCount');
    if (chaseCounter && escapeCount) {
      chaseCounter.classList.remove('hidden');
      escapeCount.textContent = this.yesEscapeCount;
    }

    // Make button evade
    this.yesButton.classList.add('evading');

    const buttonRect = this.yesButton.getBoundingClientRect();
    const cardRect = this.questionCard.getBoundingClientRect();

    // Calculate new position within card bounds
    const maxX = cardRect.width - buttonRect.width - 40;
    const maxY = 200; // Stay in lower portion of card

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    this.yesButton.style.left = newX + 'px';
    this.yesButton.style.top = newY + 'px';

    // Check if max escapes reached
    if (this.yesEscapeCount >= this.maxYesEscapes) {
      setTimeout(() => {
        this.makeYesCatchable();
      }, 500);
    }
  }

  makeYesCatchable() {
    this.isYesCatchable = true;
    this.yesButton.classList.remove('evading');
    this.yesButton.classList.add('catchable');
    this.yesButton.style.position = '';
    this.yesButton.style.left = '';
    this.yesButton.style.top = '';

    const encouragementText = document.getElementById('encouragementText');
    if (encouragementText) {
      encouragementText.textContent = "Okay fine, you can click now! 💝";
      encouragementText.style.color = '#4caf50';
    }
  }

  handleYesClick(e) {
    if (!this.isYesCatchable) {
      e.preventDefault();
      e.stopPropagation();
      this.handleYesHover();
      return;
    }

    audioManager.play('buttonClick');
    if (this.onYesClick) {
      this.onYesClick();
    }
  }

  handleNoHover() {
    this.evadeNoButton();
  }

  handleNoMouseMove(e) {
    if (this.noButton.classList.contains('evading')) {
      this.evadeNoButton();
    }
  }

  evadeNoButton() {
    audioManager.play('buttonEvade');
    this.noEscapeCount++;

    // Make button evade
    this.noButton.classList.add('evading');

    const buttonRect = this.noButton.getBoundingClientRect();
    const cardRect = this.questionCard.getBoundingClientRect();

    // Calculate new position within card bounds
    const maxX = cardRect.width - buttonRect.width - 40;
    const maxY = 200;

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    this.noButton.style.left = newX + 'px';
    this.noButton.style.top = newY + 'px';

    // Shrink button slightly
    const scale = Math.max(0.5, 1 - (this.noEscapeCount * 0.05));
    this.noButton.style.transform = `scale(${scale})`;
  }

  handleNoClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.noEscapeCount < this.noMessages.length) {
      this.noButton.textContent = this.noMessages[this.noEscapeCount];
    }

    // Update the image
    const questionImage = document.getElementById('questionImage');
    if (questionImage && this.noEscapeCount < 6) {
      const imageIndex = Math.min(this.noEscapeCount + 1, 6);
      questionImage.src = `./images/image${imageIndex}.gif`;
    }

    if (this.onNoClick) {
      this.onNoClick();
    }

    this.evadeNoButton();
  }
}

export class CelebrationController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isRunning = false;
    this.particles = [];
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Create initial burst
    this.createFireworks();

    // Continue creating fireworks
    this.fireworkInterval = setInterval(() => {
      this.createFireworks();
    }, 1000);

    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.fireworkInterval) {
      clearInterval(this.fireworkInterval);
      this.fireworkInterval = null;
    }
  }

  createFireworks() {
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * (this.canvas.height / 2);
    const colors = ['#bd1e59', '#e91e63', '#ff1744', '#f50057', '#ff4081'];

    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = Math.random() * 3 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.01,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05; // Gravity
      particle.life -= particle.decay;
      return particle.life > 0;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.animate());
  }
}

export class TypewriterEffect {
  constructor(element, text, speed = 50) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.index = 0;
  }

  start() {
    return new Promise((resolve) => {
      this.element.textContent = '';

      const type = () => {
        if (this.index < this.text.length) {
          this.element.textContent += this.text[this.index];
          this.index++;
          setTimeout(type, this.speed);
        } else {
          resolve();
        }
      };

      type();
    });
  }
}

export default {
  StageManager,
  ButtonChaseController,
  CelebrationController,
  TypewriterEffect
};
