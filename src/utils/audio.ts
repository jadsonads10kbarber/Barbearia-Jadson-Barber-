// Audio Synthesizer using Web Audio API for Notification Sounds
// Works across all modern browsers without external asset dependencies or CORS issues.

export type NotificationSoundType = 'bell' | 'chime' | 'marimba' | 'success';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// User interaction listener to unlock AudioContext
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { once: false, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: false, passive: true });
}

/**
 * Plays a notification sound with custom volume and sound type.
 * @param volume 0 to 100
 * @param isMuted boolean
 * @param soundType 'bell' | 'chime' | 'marimba' | 'success'
 */
export function playNotificationSound(
  volume = 80,
  isMuted = false,
  soundType: NotificationSoundType = 'bell'
): void {
  if (isMuted || volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    const gainLevel = Math.max(0.01, Math.min(1, volume / 100)) * 0.45; // Max 0.45 to prevent clipping
    masterGain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (soundType === 'bell') {
      // Golden Bell Chime (Rich, resonant, elegant)
      const freqs = [880, 1760, 2640, 3520];
      const gains = [0.6, 0.25, 0.1, 0.05];
      const decays = [1.2, 0.8, 0.5, 0.3];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decays[idx]);
      });

      // Second bell hit delayed by 140ms (Subtle chime harmony)
      setTimeout(() => {
        if (!ctx || ctx.state === 'closed') return;
        const now2 = ctx.currentTime;
        const freqs2 = [1174.66, 2349.32]; // D6 note
        freqs2.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now2);

          gain.gain.setValueAtTime(idx === 0 ? 0.5 : 0.2, now2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now2 + 1.4);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now2);
          osc.stop(now2 + 1.4);
        });
      }, 140);
    } else if (soundType === 'chime') {
      // Ascending melodic chime (D5 -> A5 -> D6)
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + i * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.5, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.9);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.95);
      });
    } else if (soundType === 'marimba') {
      // Warm, punchy marimba chord
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.6, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
    } else {
      // Modern Success (E5 -> B5)
      const notes = [659.25, 987.77];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + i * 0.14;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.6, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.75);
      });
    }
  } catch (err) {
    console.warn('Audio notification playback notice:', err);
  }
}
