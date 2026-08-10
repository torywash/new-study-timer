"use client";

import {
  volumeToGain,
  volumeToNotificationGain,
  type AmbientMode,
  type NoiseType,
} from "@/hooks/use-timer-settings";
import { createNoiseBuffer } from "@/lib/noise-buffer";

const PREVIEW_DURATION_MS = 1000;
const PREVIEW_FADE_OUT_SECONDS = 0.1;

// Plays the session-end chime once at the given volume, so Settings can let
// you hear what it'll sound like as you drag the slider.
export function playNotificationPreview(volume: number) {
  const audio = new Audio("/sounds/time_finish.mp3");
  audio.volume = volumeToNotificationGain(volume);
  audio.play().catch(() => {
    // autoplay can be blocked in some browser states; this is a best-effort
    // preview triggered by the user's own slider interaction, so there's
    // nothing further to recover from here
  });
}

// Plays 1 second of whichever ambient sound is currently configured
// (generated noise or the picked file) at the given volume, so Settings can
// let you hear it without starting a real Focus/Break session.
export function playAmbientPreview(
  mode: AmbientMode,
  noiseType: NoiseType,
  file: File | null,
  volume: number
) {
  const gain = volumeToGain(volume);

  if (mode === "generated") {
    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, noiseType);
    const gainNode = ctx.createGain();
    gainNode.gain.value = gain;
    source.connect(gainNode).connect(ctx.destination);
    source.start();

    setTimeout(() => {
      const now = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + PREVIEW_FADE_OUT_SECONDS);

      setTimeout(() => {
        source.stop();
        source.disconnect();
        gainNode.disconnect();
        ctx.close();
      }, PREVIEW_FADE_OUT_SECONDS * 1000);
    }, PREVIEW_DURATION_MS);
    return;
  }

  if (mode === "file" && file) {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.volume = gain;
    audio.play().catch(() => {});

    setTimeout(() => {
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(url);
    }, PREVIEW_DURATION_MS);
  }
}
