// Audio Manager - Uses Web Audio API for sound effects
// Since we don't have actual audio files, we'll generate simple tones

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupSounds();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  setupSounds() {
    // Define sound characteristics
    this.sounds = {
      buttonHover: { frequency: 600, duration: 0.05, type: 'sine' },
      buttonEvade: { frequency: 800, duration: 0.1, type: 'sine' },
      heartCatch: { frequency: 1200, duration: 0.15, type: 'sine' },
      buttonClick: { frequency: 400, duration: 0.1, type: 'square' },
      cardFlip: { frequency: 500, duration: 0.2, type: 'triangle' },
      celebration: { frequency: 1000, duration: 0.3, type: 'sine' },
      gameComplete: { frequency: 1500, duration: 0.4, type: 'sine' }
    };
  }

  play(soundName) {
    if (!this.enabled || !this.audioContext || !this.sounds[soundName]) {
      return;
    }

    try {
      const sound = this.sounds[soundName];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);

      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playSequence(soundNames, interval = 100) {
    soundNames.forEach((soundName, index) => {
      setTimeout(() => this.play(soundName), index * interval);
    });
  }

  playCelebration() {
    // Play a happy sequence of sounds
    const notes = [
      { frequency: 523, duration: 0.2 }, // C
      { frequency: 659, duration: 0.2 }, // E
      { frequency: 784, duration: 0.2 }, // G
      { frequency: 1047, duration: 0.4 } // C (higher)
    ];

    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.frequency, note.duration);
      }, index * 200);
    });
  }

  playTone(frequency, duration) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing tone:', error);
    }
  }
}

// Create and export singleton instance
const audioManager = new AudioManager();
export default audioManager;
