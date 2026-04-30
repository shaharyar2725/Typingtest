export class SoundEngine {
  private static instance: SoundEngine;
  private context: AudioContext | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  public init() {
    if (this.initialized) return;
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public playKey() {
    if (!this.context || this.context.state === "suspended") return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.03);
  }

  public playError() {
    if (!this.context || this.context.state === "suspended") return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(220, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  public playFinish() {
    if (!this.context || this.context.state === "suspended") return;
    
    const playNote = (freq: number, startTime: number) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    const now = this.context.currentTime;
    playNote(523.25, now);       // C5
    playNote(659.25, now + 0.1); // E5
    playNote(783.99, now + 0.2); // G5
    playNote(1046.50, now + 0.3); // C6
  }
}

export const sounds = SoundEngine.getInstance();
