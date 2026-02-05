// Main Application Controller
import audioManager from './audio.js';
import { FloatingHeartsSystem, TrailSystem } from './particles.js';
import { HeartCatchingGame } from './game.js';
import {
  StageManager,
  ButtonChaseController,
  CelebrationController,
  TypewriterEffect
} from './animations.js';

class ValentineApp {
  constructor() {
    this.stageManager = new StageManager();
    this.systems = {};
    this.init();
  }

  init() {
    // Initialize audio
    audioManager.init();

    // Setup Stage 1: Portal
    this.setupStage1();

    // Setup Stage 2: Game
    this.setupStage2();

    // Setup Stage 3: Question
    this.setupStage3();

    // Setup Stage 4: Celebration
    this.setupStage4();
  }

  setupStage1() {
    const canvas = document.getElementById('particleCanvas1');
    const enterButton = document.getElementById('enterButton');

    // Create floating hearts system
    this.systems.floatingHearts = new FloatingHeartsSystem(canvas);
    this.systems.floatingHearts.start();

    // Enter button click
    enterButton.addEventListener('click', () => {
      audioManager.play('buttonClick');
      this.systems.floatingHearts.stop();
      this.stageManager.transitionTo(2);

      // Start game after transition
      setTimeout(() => {
        this.systems.game.start();
      }, 500);
    });
  }

  setupStage2() {
    const canvas = document.getElementById('gameCanvas');
    const continueButton = document.getElementById('continueButton');
    const gameComplete = document.getElementById('gameComplete');
    const gameInstructions = document.getElementById('gameInstructions');

    // Create game
    this.systems.game = new HeartCatchingGame(canvas);
    this.systems.game.onComplete = () => {
      // Show completion message
      setTimeout(() => {
        gameInstructions.classList.add('hidden');
        gameComplete.classList.remove('hidden');
      }, 500);
    };

    // Continue button
    continueButton.addEventListener('click', () => {
      audioManager.play('buttonClick');
      gameComplete.classList.add('hidden');
      gameInstructions.classList.remove('hidden');
      this.stageManager.transitionTo(3);

      // Setup stage 3 systems
      setTimeout(() => {
        this.systems.trailSystem.start();
        this.openQuestionCard();
      }, 500);
    });
  }

  setupStage3() {
    const canvas = document.getElementById('particleCanvas3');
    const questionCard = document.getElementById('questionCard');
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');

    // Create trail system
    this.systems.trailSystem = new TrailSystem(canvas);

    // Setup button chase controller
    this.systems.buttonChase = new ButtonChaseController(yesButton, noButton, questionCard);

    this.systems.buttonChase.onYesClick = () => {
      this.handleYesClick();
    };

    this.systems.buttonChase.onNoClick = () => {
      // Just handle the evading, already done in ButtonChaseController
    };

    // Card flip on click
    questionCard.addEventListener('click', (e) => {
      if (!questionCard.classList.contains('flipped') && e.target === questionCard) {
        this.openQuestionCard();
      }
    });
  }

  openQuestionCard() {
    const questionCard = document.getElementById('questionCard');
    if (!questionCard.classList.contains('flipped')) {
      audioManager.play('cardFlip');
      questionCard.classList.add('flipped');
    }
  }

  handleYesClick() {
    // Stop trail system
    this.systems.trailSystem.stop();
    this.systems.trailSystem.clear();

    // Transition to celebration
    this.stageManager.transitionTo(4);

    // Start celebration
    setTimeout(() => {
      this.startCelebration();
    }, 500);
  }

  async startCelebration() {
    // Play celebration sound
    audioManager.playCelebration();

    // Start fireworks
    const celebrationCanvas = document.getElementById('celebrationCanvas');
    this.systems.celebration = new CelebrationController(celebrationCanvas);
    this.systems.celebration.start();

    // Also trigger confetti
    this.triggerConfetti();

    // Type out love letter
    setTimeout(() => {
      this.typeLoveLetter();
    }, 1000);
  }

  async typeLoveLetter() {
    const letterText = document.getElementById('letterText');
    const letterDate = document.getElementById('letterDate');
    const sealButton = document.getElementById('sealButton');

    // Generate love letter text
    const loveLetterContent = `Thank you for being my valentine bb, I love you the most. I want to celebrate all my valentines only with you my bb. You are the most beautiful, pretty, loving and caring person I have met. I thank God for keeping you away from all the other guys so that he could give you to me. Yeyeyeyyeyeye !!!!!! I LOVE YOU CUTIE PATOOTIE, MY CHOTU BB 💕`;

    // Set date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    letterDate.textContent = dateStr;

    // Type out letter
    const typewriter = new TypewriterEffect(letterText, loveLetterContent, 30);
    await typewriter.start();

    // Setup seal button
    sealButton.addEventListener('click', () => {
      audioManager.play('buttonClick');
      this.sealLetter();
    });
  }

  sealLetter() {
    const kissStamp = document.getElementById('kissStamp');
    const sealButton = document.getElementById('sealButton');

    kissStamp.classList.remove('hidden');
    sealButton.style.display = 'none';

    // Extra confetti burst
    setTimeout(() => {
      this.triggerConfetti();
    }, 300);
  }

  triggerConfetti() {
    // Use native confetti library
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Multiple bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    }
  }

  setupStage4() {
    // Stage 4 setup is done dynamically in startCelebration
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ValentineApp();
});

// Load confetti library
const script = document.createElement('script');
script.type = 'module';
script.textContent = `import confetti from 'https://cdn.skypack.dev/canvas-confetti'; window.confetti = confetti;`;
document.head.appendChild(script);
