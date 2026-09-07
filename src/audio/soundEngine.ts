class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.6;
  private musicVolume: number = 0.35;
  private musicInterval: number | null = null;
  private inCombat: boolean = false;
  private inBossFight: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public init() {
    this.initContext();
    this.startAmbientMusic();
  }

  public setMusicTheme(theme?: string) {
    // Dynamically adjust ambient music vibe
    this.initContext();
  }

  public playQuestComplete() {
    this.playLevelUp();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    } else if (!muted && !this.musicInterval) {
      this.startAmbientMusic();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  // Combat state shifts background music intensity
  public setCombatState(inCombat: boolean, inBossFight: boolean) {
    this.inCombat = inCombat;
    this.inBossFight = inBossFight;
  }

  public playSwing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHit(isCrit: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low frequency punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isCrit ? 220 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime((isCrit ? 0.45 : 0.3) * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // If crit, add high-pitched resonance chime
    if (isCrit) {
      const critOsc = this.ctx.createOscillator();
      const critGain = this.ctx.createGain();
      critOsc.type = 'sine';
      critOsc.frequency.setValueAtTime(880, now);
      critOsc.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
      critGain.gain.setValueAtTime(0.25 * this.masterVolume, now);
      critGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      critOsc.connect(critGain);
      critGain.connect(this.ctx.destination);
      critOsc.start(now);
      critOsc.stop(now + 0.21);
    }
  }

  public playDodge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playArrowShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playSpellCast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554, 659].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.25);
      gain.gain.setValueAtTime(0.15 * this.masterVolume, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + 0.31);
    });
  }

  public playMonsterHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playBossRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.9);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(65, now);
    osc2.frequency.linearRampToValueAtTime(95, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(35, now + 0.9);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.95);
    osc2.stop(now + 0.95);
  }

  public playTrackFound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.18 * this.masterVolume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Heroic trumpet-like fanfare arpeggio
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.3 * this.masterVolume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.45);
    });
  }

  public playHarvest() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playPotion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [300, 420, 580].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.2 * this.masterVolume, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.13);
    });
  }

  // Dynamic ambient rhythm loop
  public startAmbientMusic() {
    if (this.musicInterval) return;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (this.inBossFight) {
        // Dramatic heavy pounding war drum
        const drum = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();
        drum.type = 'sine';
        drum.frequency.setValueAtTime(110, now);
        drum.frequency.exponentialRampToValueAtTime(35, now + 0.25);
        drumGain.gain.setValueAtTime(0.35 * this.musicVolume * this.masterVolume, now);
        drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        drum.connect(drumGain);
        drumGain.connect(this.ctx.destination);
        drum.start(now);
        drum.stop(now + 0.29);
      } else if (this.inCombat) {
        // Tension pulsing bass
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(65, now);
        bass.frequency.linearRampToValueAtTime(55, now + 0.2);
        bassGain.gain.setValueAtTime(0.18 * this.musicVolume * this.masterVolume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.start(now);
        bass.stop(now + 0.26);
      } else {
        // Peaceful ambient outdoor resonant tone
        if (Math.random() < 0.35) {
          const notes = [220, 261.63, 329.63, 392.0];
          const chosenNote = notes[Math.floor(Math.random() * notes.length)];
          const tone = this.ctx.createOscillator();
          const toneGain = this.ctx.createGain();
          tone.type = 'sine';
          tone.frequency.setValueAtTime(chosenNote, now);
          toneGain.gain.setValueAtTime(0.06 * this.musicVolume * this.masterVolume, now);
          toneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          tone.connect(toneGain);
          toneGain.connect(this.ctx.destination);
          tone.start(now);
          tone.stop(now + 1.25);
        }
      }
    }, 1200);
  }
}

export const soundEngine = new SoundEngine();
