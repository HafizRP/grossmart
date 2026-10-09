/**
 * Grossmart Audio Feedback Utility
 * Menggunakan Web Audio API untuk sintesis audio instan tanpa ketergantungan file eksternal.
 * Memberikan umpan balik suara jelas: beep barcode, buzz error, chime lunas.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.8;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('grossmart_audio_muted');
      const savedVolume = localStorage.getItem('grossmart_audio_volume');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        this.volume = isNaN(parsed) ? 0.8 : parsed;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('grossmart_audio_muted', String(muted));
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('grossmart_audio_volume', String(this.volume));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Beep Ringan: Barcode terbaca atau barang masuk keranjang
   */
  public playBeep(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio fallback jika autoplay di-block browser
    }
  }

  /**
   * Buzz / Tetot Rendah: Scan gagal, stok habis, atau aksi ditolak
   */
  public playError(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const playTone = (offset: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime + offset);

        gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime + offset);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + offset + 0.11);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.12);
      };

      playTone(0);
      playTone(0.14);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Chime Kring Kassa / Sukses: Pembayaran selesai, nota tercetak
   */
  public playChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const offset = idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);

        gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.48);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Click Halus: Umpan balik sentuhan tombol
   */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }
}

export const sound = new SoundManager();
