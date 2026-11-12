// Web Speech API Voice Reader for Arabic Questions & Options

export class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer Arabic voice
    const arVoice = voices.find(v => v.lang.startsWith('ar')) || voices[0];
    if (arVoice) {
      this.voice = arVoice;
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
      utterance.lang = this.voice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechEngine = new SpeechEngine();
