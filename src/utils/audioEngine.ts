/**
 * Web Audio API synthesizer for lively birthday music and realistic sound effects
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private currentLoopTimer: number | null = null;
  private isMusicPlaying: boolean = false;
  private currentTrack: string = 'synth-birthday';
  private customAudio: HTMLAudioElement | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async resume(): Promise<void> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.customAudio) {
      this.customAudio.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isMusicPlaying;
  }

  // --- SOUND EFFECTS ---

  public playFireworkLaunch() {
    // Disabled booming firework sound as requested
    return;
  }

  public playFireworkBurst(_type: 'boom' | 'crackle' | 'sparkle' = 'boom') {
    // Disabled booming firework sound as requested
    return;
  }

  public playBlowCandle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const duration = 0.6;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    } catch {
      // Ignore
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Cheerful celebratory fanfare chords: C - E - G - high C
      const t = this.ctx.currentTime;
      const notes = [
        { f: 523.25, time: 0, dur: 0.18 },    // C5
        { f: 523.25, time: 0.18, dur: 0.15 }, // C5
        { f: 523.25, time: 0.33, dur: 0.15 }, // C5
        { f: 659.25, time: 0.48, dur: 0.4 },  // E5
        { f: 587.33, time: 0.9, dur: 0.2 },   // D5
        { f: 659.25, time: 1.1, dur: 0.2 },   // E5
        { f: 783.99, time: 1.3, dur: 0.6 },   // G5
        { f: 1046.5, time: 1.9, dur: 1.0 },   // C6
      ];

      notes.forEach(({ f, time, dur }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + time);

        gain.gain.setValueAtTime(0.2 * this.volume, t + time);
        gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + time);
        osc.stop(t + time + dur);
      });
    } catch {
      // Ignore
    }
  }

  // --- MUSIC PLAYBACK ---

  public startMusic(track: string = 'synth-birthday', customUrl?: string) {
    this.stopMusic();
    this.initContext();
    this.currentTrack = track;
    this.isMusicPlaying = true;

    if (track === 'custom' && customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }

    if (track === 'music-box') {
      this.playMusicBoxLoop();
    } else if (track === 'party-beat') {
      this.playPartyBeatLoop();
    } else {
      // Default: synth-birthday
      this.playBirthdayMelodyLoop();
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.currentLoopTimer) {
      window.clearTimeout(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
      this.customAudio = null;
    }
  }

  public togglePlay(track: string = 'synth-birthday', customUrl?: string) {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic(track, customUrl);
    }
  }

  private playCustomAudio(url: string) {
    try {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
      this.customAudio.volume = this.volume;
      this.customAudio.muted = this.isMuted;
      this.customAudio.play().catch(() => {
        // Fallback to synth if external audio fails or blocked
        this.playBirthdayMelodyLoop();
      });
    } catch {
      this.playBirthdayMelodyLoop();
    }
  }

  // Synthesize "Happy Birthday To You" with warm chords, marimba, and cheerful bassline
  private playBirthdayMelodyLoop() {
    if (!this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    // Tempo: 124 BPM -> quarter note ~ 0.48s
    const beat = 0.46;
    const t0 = this.ctx.currentTime + 0.05;

    // Happy birthday notes (standard key of F major / C major):
    // C4, C4, D4, C4, F4, E4
    // C4, C4, D4, C4, G4, F4
    // C4, C4, C5, A4, F4, E4, D4
    // Bb4, Bb4, A4, F4, G4, F4
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const Bb4 = 466.16;
    const C5 = 523.25;

    const melody: { note: number; start: number; dur: number }[] = [
      // Bar 1 & 2: "Happy birthday to you"
      { note: C4, start: 0, dur: beat * 0.75 },
      { note: C4, start: beat * 0.75, dur: beat * 0.25 },
      { note: D4, start: beat * 1, dur: beat },
      { note: C4, start: beat * 2, dur: beat },
      { note: F4, start: beat * 3, dur: beat },
      { note: E4, start: beat * 4, dur: beat * 2 },

      // Bar 3 & 4: "Happy birthday to you"
      { note: C4, start: beat * 6, dur: beat * 0.75 },
      { note: C4, start: beat * 6.75, dur: beat * 0.25 },
      { note: D4, start: beat * 7, dur: beat },
      { note: C4, start: beat * 8, dur: beat },
      { note: G4, start: beat * 9, dur: beat },
      { note: F4, start: beat * 10, dur: beat * 2 },

      // Bar 5 & 6: "Happy birthday dear friend"
      { note: C4, start: beat * 12, dur: beat * 0.75 },
      { note: C4, start: beat * 12.75, dur: beat * 0.25 },
      { note: C5, start: beat * 13, dur: beat },
      { note: A4, start: beat * 14, dur: beat },
      { note: F4, start: beat * 15, dur: beat },
      { note: E4, start: beat * 16, dur: beat },
      { note: D4, start: beat * 17, dur: beat * 2 },

      // Bar 7 & 8: "Happy birthday to you"
      { note: Bb4, start: beat * 19, dur: beat * 0.75 },
      { note: Bb4, start: beat * 19.75, dur: beat * 0.25 },
      { note: A4, start: beat * 20, dur: beat },
      { note: F4, start: beat * 21, dur: beat },
      { note: G4, start: beat * 22, dur: beat },
      { note: F4, start: beat * 23, dur: beat * 2.5 },
    ];

    const totalDuration = beat * 26;

    if (!this.isMuted) {
      // Play lead melody (marimba / bell tone)
      melody.forEach(({ note, start, dur }) => {
        this.playMelodyNote(note, t0 + start, dur);
        // Soft harmony octave
        this.playHarmonicNote(note * 0.5, t0 + start, dur * 0.8);
      });

      // Play soft cheerful rhythmic chord accompaniment
      const chordBeats = [
        { f: [F4, A4, C5], start: 0, dur: beat * 2 },
        { f: [C4, E4, G4], start: beat * 3, dur: beat * 3 },
        { f: [C4, E4, G4], start: beat * 6, dur: beat * 3 },
        { f: [F4, A4, C5], start: beat * 9, dur: beat * 3 },
        { f: [F4, A4, C5], start: beat * 12, dur: beat * 3 },
        { f: [Bb4, D4 * 2, F4 * 2], start: beat * 15, dur: beat * 3 },
        { f: [F4, A4, C5], start: beat * 18, dur: beat * 2 },
        { f: [C4, E4, G4], start: beat * 20, dur: beat * 2 },
        { f: [F4, A4, C5], start: beat * 22, dur: beat * 3.5 },
      ];

      chordBeats.forEach(({ f, start, dur }) => {
        f.forEach(pitch => {
          this.playPadNote(pitch, t0 + start, dur);
        });
      });
    }

    // Schedule next loop
    this.currentLoopTimer = window.setTimeout(() => {
      if (this.isMusicPlaying && this.currentTrack === 'synth-birthday') {
        this.playBirthdayMelodyLoop();
      }
    }, totalDuration * 1000);
  }

  // Music box style: pure sine tones, dreamy bell decay
  private playMusicBoxLoop() {
    if (!this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    const beat = 0.55;
    const t0 = this.ctx.currentTime + 0.05;

    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;
    const E5 = 659.25;
    const G5 = 783.99;

    const notes = [
      { n: G4, t: 0 }, { n: G4, t: beat * 0.5 }, { n: A4, t: beat }, { n: G4, t: beat * 2 }, { n: C5, t: beat * 3 }, { n: B4, t: beat * 4 },
      { n: G4, t: beat * 6 }, { n: G4, t: beat * 6.5 }, { n: A4, t: beat * 7 }, { n: G4, t: beat * 8 }, { n: D5, t: beat * 9 }, { n: C5, t: beat * 10 },
      { n: G4, t: beat * 12 }, { n: G4, t: beat * 12.5 }, { n: G5, t: beat * 13 }, { n: E5, t: beat * 14 }, { n: C5, t: beat * 15 }, { n: B4, t: beat * 16 }, { n: A4, t: beat * 17 },
      { n: F4, t: beat * 19 }, { n: F4, t: beat * 19.5 }, { n: E5, t: beat * 20 }, { n: C5, t: beat * 21 }, { n: D5, t: beat * 22 }, { n: C5, t: beat * 23 },
    ];

    if (!this.isMuted) {
      notes.forEach(({ n, t }) => {
        this.playMusicBoxNote(n, t0 + t, beat * 1.5);
      });
    }

    const totalDuration = beat * 26;
    this.currentLoopTimer = window.setTimeout(() => {
      if (this.isMusicPlaying && this.currentTrack === 'music-box') {
        this.playMusicBoxLoop();
      }
    }, totalDuration * 1000);
  }

  // Upbeat party rhythm loop
  private playPartyBeatLoop() {
    if (!this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    const beat = 0.35;
    const t0 = this.ctx.currentTime + 0.05;

    // 16-step upbeat groove
    const bassline = [130.81, 130.81, 164.81, 196.0, 130.81, 174.61, 196.0, 261.63];
    if (!this.isMuted) {
      for (let i = 0; i < 16; i++) {
        const pitch = bassline[i % bassline.length];
        this.playBassNote(pitch, t0 + i * beat, beat * 0.8);
        if (i % 2 === 1) {
          this.playHiHat(t0 + i * beat);
        }
      }
    }

    this.currentLoopTimer = window.setTimeout(() => {
      if (this.isMusicPlaying && this.currentTrack === 'party-beat') {
        this.playPartyBeatLoop();
      }
    }, 16 * beat * 1000);
  }

  // Note synthesis helpers
  private playMelodyNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.24 * this.volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playHarmonicNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.08 * this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playPadNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.045 * this.volume, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playMusicBoxNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.28 * this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playBassNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, startTime);

    gain.gain.setValueAtTime(0.18 * this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playHiHat(startTime: number) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08 * this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(startTime);
  }
}

export const audioEngine = new AudioEngine();
