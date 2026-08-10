"use client";

import { useEffect, useRef } from "react";

import { useTimerSettings, volumeToGain } from "@/hooks/use-timer-settings";
import { createNoiseBuffer } from "@/lib/noise-buffer";

const FADE_SECONDS = 1.5;

// Ramps an <audio> element's volume over time (HTMLMediaElement has no
// native ramp API, unlike Web Audio's GainNode). Returns a cancel function.
function fadeAudioElement(
  audio: HTMLAudioElement,
  to: number,
  onDone?: () => void
): () => void {
  const from = audio.volume;
  const steps = 30;
  const stepMs = (FADE_SECONDS * 1000) / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, from + (to - from) * (step / steps)));
    if (step >= steps) {
      clearInterval(interval);
      onDone?.();
    }
  }, stepMs);

  return () => clearInterval(interval);
}

// Plays ambient background sound (generated noise or a user-picked file,
// looped) for as long as `isPlaying` and the ambient setting are both on,
// fading in on start and fading out before actually stopping. Volume slider
// changes apply live without restarting playback; switching mode, noise
// type, or file restarts it (with its own fade in/out).
export function useAmbientPlayer(isPlaying: boolean) {
  const {
    ambientEnabled,
    ambientMode,
    noiseType,
    ambientFile,
    ambientVolume,
  } = useTimerSettings();

  const gainRef = useRef<GainNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);

  const shouldPlay = isPlaying && ambientEnabled;

  useEffect(() => {
    const target = volumeToGain(ambientVolume);
    if (gainRef.current) {
      const ctx = gainRef.current.context;
      gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainRef.current.gain.setValueAtTime(target, ctx.currentTime);
    }
    // skip live jumps while a fade in/out is actively animating this element
    if (audioElRef.current && !cancelFadeRef.current) {
      audioElRef.current.volume = target;
    }
  }, [ambientVolume]);

  useEffect(() => {
    if (!shouldPlay || ambientMode !== "generated") return;

    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, noiseType);
    source.loop = true;

    const gain = ctx.createGain();
    const target = volumeToGain(ambientVolume);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(target, ctx.currentTime + FADE_SECONDS);
    gainRef.current = gain;

    source.connect(gain).connect(ctx.destination);
    source.start();

    return () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
      gainRef.current = null;

      setTimeout(() => {
        source.stop();
        source.disconnect();
        gain.disconnect();
        ctx.close();
      }, FADE_SECONDS * 1000);
    };
    // ambientVolume is intentionally excluded — the separate effect above
    // updates gain.value live so changing it doesn't restart (and click/pop)
    // playback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, ambientMode, noiseType]);

  useEffect(() => {
    if (!shouldPlay || ambientMode !== "file" || !ambientFile) return;

    const url = URL.createObjectURL(ambientFile);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    audioElRef.current = audio;
    audio.play().catch(() => {
      // autoplay can be blocked in some browser states; nothing to recover
      // from here since this only runs as a result of the user's own Start
      // click, so it should generally be allowed
    });

    cancelFadeRef.current?.();
    cancelFadeRef.current = fadeAudioElement(audio, volumeToGain(ambientVolume), () => {
      cancelFadeRef.current = null;
    });

    return () => {
      cancelFadeRef.current?.();
      cancelFadeRef.current = fadeAudioElement(audio, 0, () => {
        cancelFadeRef.current = null;
      });

      setTimeout(() => {
        audio.pause();
        audio.src = "";
        URL.revokeObjectURL(url);
      }, FADE_SECONDS * 1000);

      audioElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, ambientMode, ambientFile]);
}
