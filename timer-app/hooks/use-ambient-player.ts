"use client";

import { useEffect, useRef } from "react";

import {
  useTimerSettings,
  volumeToGain,
  type NoiseType,
} from "@/hooks/use-timer-settings";

const FADE_SECONDS = 1.5;

// Paul Kellett's well-known filter coefficients for brown/pink noise from
// white noise, generated once into a short buffer and looped.
function createNoiseBuffer(ctx: AudioContext, type: NoiseType): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "brown") {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
  } else {
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = out * 0.11;
    }
  }

  return buffer;
}

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
  const { ambientEnabled, ambientMode, noiseType, ambientFile, volume } =
    useTimerSettings();

  const gainRef = useRef<GainNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);

  const shouldPlay = isPlaying && ambientEnabled;

  useEffect(() => {
    const target = volumeToGain(volume);
    if (gainRef.current) {
      const ctx = gainRef.current.context;
      gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainRef.current.gain.setValueAtTime(target, ctx.currentTime);
    }
    // skip live jumps while a fade in/out is actively animating this element
    if (audioElRef.current && !cancelFadeRef.current) {
      audioElRef.current.volume = target;
    }
  }, [volume]);

  useEffect(() => {
    if (!shouldPlay || ambientMode !== "generated") return;

    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, noiseType);
    source.loop = true;

    const gain = ctx.createGain();
    const target = volumeToGain(volume);
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
    // volume is intentionally excluded — the separate effect above updates
    // gain.value live so changing it doesn't restart (and click/pop) playback
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
    cancelFadeRef.current = fadeAudioElement(audio, volumeToGain(volume), () => {
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
