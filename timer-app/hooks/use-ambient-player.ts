"use client";

import { useEffect, useRef } from "react";

import { useTimerSettings, type NoiseType } from "@/hooks/use-timer-settings";

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

// Plays ambient background sound (generated noise or a user-picked file,
// looped) for as long as `isPlaying` and the ambient setting are both on.
// Volume changes apply live without restarting playback; switching mode,
// noise type, or file restarts it.
export function useAmbientPlayer(isPlaying: boolean) {
  const { ambientEnabled, ambientMode, noiseType, ambientFile, volume } =
    useTimerSettings();

  const gainRef = useRef<GainNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const shouldPlay = isPlaying && ambientEnabled;

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
    if (audioElRef.current) {
      audioElRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (!shouldPlay || ambientMode !== "generated") return;

    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, noiseType);
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume / 100;
    gainRef.current = gain;

    source.connect(gain).connect(ctx.destination);
    source.start();

    return () => {
      source.stop();
      source.disconnect();
      gain.disconnect();
      ctx.close();
      gainRef.current = null;
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
    audio.volume = volume / 100;
    audioElRef.current = audio;
    audio.play().catch(() => {
      // autoplay can be blocked in some browser states; nothing to recover
      // from here since this only runs as a result of the user's own Start
      // click, so it should generally be allowed
    });

    return () => {
      audio.pause();
      audio.src = "";
      URL.revokeObjectURL(url);
      audioElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, ambientMode, ambientFile]);
}
