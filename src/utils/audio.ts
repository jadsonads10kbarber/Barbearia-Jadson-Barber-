// Audio Synthesizer & Device Audio Engine for Notification Sounds
// Uses Web Audio API for zero-latency synthesized tones, plus support for custom user-uploaded device audio files.

export type NotificationSoundType = 'bell' | 'cash' | 'chime' | 'marimba' | 'success' | 'custom';

export const LOCAL_STORAGE_CUSTOM_SOUND_KEY = 'jadson_custom_sound_audio_data';
export const LOCAL_STORAGE_CUSTOM_SOUND_NAME_KEY = 'jadson_custom_sound_file_name';

let audioCtx: AudioContext | null = null;
let lastSoundTime = 0;
const SOUND_COOLDOWN_MS = 1000; // Minimum 1s between automatic sounds to prevent rapid sound loops

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext unavailable or disabled:', err);
    return null;
  }
}

// User interaction listener to unlock AudioContext on mobile and strict desktop browsers
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    } catch {}
  };
  window.addEventListener('click', unlockAudio, { once: false, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
}

/**
 * Plays a custom base64 or blob audio string using HTMLAudioElement
 */
function playCustomDeviceAudio(audioDataUri: string, volume: number): void {
  try {
    if (!audioDataUri || !audioDataUri.startsWith('data:audio/')) return;
    const audio = new Audio(audioDataUri);
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Custom audio playback notice:', err);
      });
    }
  } catch (err) {
    console.warn('Failed to play custom audio file:', err);
  }
}

/**
 * Plays a notification sound with custom volume, sound type, or custom device file.
 * @param volume 0 to 100
 * @param isMuted boolean
 * @param soundType 'bell' | 'cash' | 'chime' | 'marimba' | 'success' | 'custom'
 * @param customAudioUri Optional base64 data URI of the custom device audio
 * @param forcePlay If true, ignores cooldown (e.g. for user preview/test button)
 */
export function playNotificationSound(
  volume = 80,
  isMuted = false,
  soundType: NotificationSoundType = 'bell',
  customAudioUri?: string | null,
  forcePlay = false
): void {
  if (isMuted || volume <= 0) return;

  const nowMs = Date.now();
  if (!forcePlay && nowMs - lastSoundTime < SOUND_COOLDOWN_MS) {
    return;
  }
  lastSoundTime = nowMs;

  // If custom sound is selected and audio URI is provided
  if (soundType === 'custom' && customAudioUri) {
    playCustomDeviceAudio(customAudioUri, volume);
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    const gainLevel = Math.max(0.01, Math.min(1, volume / 100)) * 0.45; // Max 0.45 to avoid audio clipping
    const now = Math.max(0.001, ctx.currentTime);

    masterGain.gain.setValueAtTime(gainLevel, now);
    masterGain.connect(ctx.destination);

    if (soundType === 'bell') {
      // Golden Bell Chime (Rich, resonant, barber shop front desk chime)
      const freqs = [880, 1760, 2640, 3520];
      const gains = [0.6, 0.25, 0.1, 0.05];
      const decays = [1.2, 0.7, 0.4, 0.25];

      freqs.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(Math.max(0.0001, gains[idx]), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(now + 0.05, now + decays[idx]));

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + decays[idx]);
        } catch {}
      });

      // Second bell strike with warm harmonic resonance
      setTimeout(() => {
        try {
          if (!ctx || ctx.state === 'closed') return;
          const now2 = Math.max(0.001, ctx.currentTime);
          const freqs2 = [1174.66, 2349.32, 3520]; // D6 note harmonic
          freqs2.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now2);

            gain.gain.setValueAtTime(idx === 0 ? 0.45 : 0.15, now2);
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(now2 + 0.05, now2 + 1.2));

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now2);
            osc.stop(now2 + 1.25);
          });
        } catch {}
      }, 120);
    } else if (soundType === 'cash') {
      // Cash Register / Caixa Registradora (Crisp "ka-ching" bell & mechanical click)
      try {
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(280, now);
        clickGain.gain.setValueAtTime(0.25, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        clickOsc.connect(clickGain);
        clickGain.connect(masterGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.06);
      } catch {}

      // Bright coin/register bell
      setTimeout(() => {
        try {
          if (!ctx || ctx.state === 'closed') return;
          const now2 = Math.max(0.001, ctx.currentTime);
          const bellFreqs = [1975.53, 2637.02, 3951.07]; // B6 + E7
          bellFreqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now2);

            gain.gain.setValueAtTime(idx === 0 ? 0.5 : 0.2, now2);
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(now2 + 0.05, now2 + 1.0));

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now2);
            osc.stop(now2 + 1.05);
          });
        } catch {}
      }, 65);
    } else if (soundType === 'chime') {
      // Ascending melodic chime (D5 -> A5 -> D6)
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + i * 0.1;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0.001, noteStart);
          gain.gain.linearRampToValueAtTime(0.45, noteStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(noteStart + 0.05, noteStart + 0.8));

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(noteStart);
          osc.stop(noteStart + 0.85);
        } catch {}
      });
    } else if (soundType === 'marimba') {
      // Warm acoustic marimba chord (C5 -> E5 -> G5 -> C6)
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.05;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0.5, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(noteStart + 0.05, noteStart + 0.5));

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(noteStart);
          osc.stop(noteStart + 0.55);
        } catch {}
      });
    } else {
      // Modern Success (E5 -> B5 -> E6)
      const notes = [659.25, 987.77, 1318.51];
      notes.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + i * 0.1;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);

          gain.gain.setValueAtTime(0.001, noteStart);
          gain.gain.linearRampToValueAtTime(0.45, noteStart + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(noteStart + 0.05, noteStart + 0.7));

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(noteStart);
          osc.stop(noteStart + 0.75);
        } catch {}
      });
    }
  } catch (err) {
    console.warn('Audio notification playback notice:', err);
  }
}
