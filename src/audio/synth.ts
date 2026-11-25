import type { Action, BeatResult } from '../core/types';

const pentatonic = [261.63, 293.66, 329.63, 392, 440] as const;
const subdivision = 60 / 78 / 2;

export class FactorySynth {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private noise?: AudioBuffer;
  private timer?: number;
  private playing = false;
  private muted = false;
  private progress = 0;
  private next = 0;
  private step = 0;
  private skipResponse = false;

  install(): void {
    const unlock = (event: Event) => {
      if (!event.isTrusted) return;
      this.unlock();
      if (this.context?.state === 'running') {
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
      }
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    document.addEventListener('visibilitychange', () => this.syncLoop());
  }

  private unlock(): void {
    try {
      if (!this.context) {
        const context = new AudioContext();
        const master = context.createGain();
        const music = context.createGain();
        master.gain.value = this.muted ? 0 : 0.72;
        music.gain.value = 0.68;
        master.connect(context.destination);
        music.connect(master);
        this.context = context;
        this.master = master;
        this.music = music;

        this.noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.15), context.sampleRate);
        const samples = this.noise.getChannelData(0);
        let seed = 421;
        for (let i = 0; i < samples.length; i += 1) {
          seed = (1664525 * seed + 1013904223) >>> 0;
          samples[i] = seed / 2147483648 - 1;
        }
      }
      void this.context.resume().then(() => this.syncLoop()).catch(() => {});
    } catch {
      // Audio can be unavailable in a browser or embed.
    }
  }

  get isMuted(): boolean { return this.muted; }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.context && this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.context.currentTime, 0.012);
    this.syncLoop();
  }

  setActive(active: boolean): void {
    this.playing = active;
    if (!active) {
      this.step = 0;
      this.skipResponse = false;
    }
    this.syncLoop();
  }

  setProgress(progress: number): void { this.progress = progress; }

  private syncLoop(): void {
    if (this.playing && !this.muted && !document.hidden && this.context?.state === 'running') {
      if (this.timer !== undefined) return;
      this.next = this.context.currentTime + 0.045;
      this.timer = window.setInterval(() => this.schedule(), 70);
      this.schedule();
    } else if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private schedule(): void {
    const ctx = this.context;
    const bus = this.music;
    if (!ctx || !bus || ctx.state !== 'running') return;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + 0.01;
    while (this.next < ctx.currentTime + 0.14) {
      const t = this.next;
      const pulse = this.step % 8;
      const bass = Math.floor(this.step / 8) % 2 === 0 ? 65.41 : 82.41;
      if (pulse === 0 || pulse === 4) this.tone(bus, 'sine', bass, t, 0.29, 0.09);
      if (this.progress >= 0.2 && pulse % 2 === 0) this.rustle(bus, t, 0.045, 0.018, 700);
      if (this.progress >= 0.46 && pulse === 0) {
        for (const note of [bass * 3, bass * 4]) this.tone(bus, 'sine', note, t, 1.36, 0.022, 0.13);
      }
      if (this.progress >= 0.68 && pulse === 6) {
        if (this.skipResponse) this.skipResponse = false;
        else this.tone(bus, 'sine', 392, t + 0.035, 0.34, 0.017, 0.035);
      }
      this.step += 1;
      this.next += subdivision;
    }
  }

  turn(action: Action, result: BeatResult, won: boolean): void {
    const ctx = this.context;
    const bus = this.master;
    if (!ctx || !bus || this.muted || ctx.state === 'closed') return;
    const t = ctx.currentTime + 0.016;
    if (action !== 'WAIT') {
      this.rustle(bus, t, 0.09, 0.19, 980);
      this.tone(bus, 'sine', 103, t, 0.14, 0.19, 0.006, 49);
    }

    for (const slot of result.matchedSlots) {
      const note = pentatonic[slot % pentatonic.length]!;
      const start = t + 0.075 + slot * 0.04;
      this.tone(bus, 'triangle', note * 2, start, 0.26, 0.075);
      this.tone(bus, 'sine', note * 3, start, 0.22, 0.027);
    }
    if (result.faultSlots.length) {
      this.skipResponse = true;
      this.tone(bus, 'triangle', 84, t + 0.07, 0.3, 0.105);
      this.tone(bus, 'sine', 89, t + 0.07, 0.32, 0.11);
    }
    if (won) {
      [261.63, 329.63, 392, 523.25].forEach((note, index) => {
        this.tone(bus, 'triangle', note, t + 0.32 + index * 0.086, 0.38, 0.105);
      });
    }
  }

  private tone(
    bus: AudioNode, wave: OscillatorType, frequency: number, start: number, duration: number, volume: number,
    attack = 0.012, endFrequency?: number,
  ): void {
    const ctx = this.context!;
    const tone = ctx.createOscillator();
    const envelope = this.envelope(bus, start, duration, volume, attack);
    tone.type = wave;
    tone.frequency.setValueAtTime(frequency, start);
    if (endFrequency) tone.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    tone.connect(envelope);
    tone.start(start);
    tone.stop(start + duration + 0.01);
    tone.onended = () => { tone.disconnect(); envelope.disconnect(); };
  }

  private rustle(bus: AudioNode, start: number, duration: number, volume: number, frequency: number): void {
    if (!this.noise) return;
    const ctx = this.context!;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = this.envelope(bus, start, duration, volume, 0.004);
    source.buffer = this.noise;
    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    source.connect(filter).connect(envelope);
    source.start(start);
    source.stop(start + duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  }

  private envelope(bus: AudioNode, start: number, duration: number, volume: number, attack: number): GainNode {
    const gain = this.context!.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(bus);
    return gain;
  }
}

export const synth = new FactorySynth();
