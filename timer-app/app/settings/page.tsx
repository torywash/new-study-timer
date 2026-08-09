"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useTimerSettings,
  type AmbientMode,
  type NoiseType,
} from "@/hooks/use-timer-settings";

function DurationField({
  id,
  label,
  minutes,
  onCommit,
}: {
  id: string;
  label: string;
  minutes: number;
  onCommit: (minutes: number) => void;
}) {
  const [text, setText] = useState(String(minutes));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    const parsed = Number(e.target.value);
    if (e.target.value.trim() !== "" && Number.isFinite(parsed) && parsed > 0) {
      onCommit(parsed);
    }
  };

  const handleBlur = () => {
    // if the field was left invalid/empty, snap the display back to the
    // last committed value instead of leaving a stale/invalid string shown
    setText(String(minutes));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="1"
        step="1"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
}

// Minimal structural types for the File System Access API — not yet part of
// TS's standard DOM lib, so this is scoped locally rather than assuming a
// global ambient declaration.
type PickedFileHandle = {
  kind: "file" | "directory";
  getFile?: () => Promise<File>;
};
type PickedDirectoryHandle = {
  entries: () => AsyncIterableIterator<[string, PickedFileHandle]>;
};

const AUDIO_FILE_PATTERN = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;

async function pickAmbientFolder(): Promise<File[]> {
  const showDirectoryPicker = (
    window as unknown as {
      showDirectoryPicker?: () => Promise<PickedDirectoryHandle>;
    }
  ).showDirectoryPicker;
  if (!showDirectoryPicker) return [];

  const dirHandle = await showDirectoryPicker();
  const files: File[] = [];
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file" && handle.getFile && AUDIO_FILE_PATTERN.test(name)) {
      files.push(await handle.getFile());
    }
  }
  return files;
}

function AmbientFilePicker({
  ambientFile,
  onSelectFile,
}: {
  ambientFile: File | null;
  onSelectFile: (file: File) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported("showDirectoryPicker" in window);
  }, []);

  const handlePickFolder = async () => {
    setError(null);
    try {
      const files = await pickAmbientFolder();
      setAvailableFiles(files);
      if (files.length === 0) {
        setError("No audio files found in that folder.");
      }
    } catch {
      // user cancelled the picker, or permission was denied — nothing to do
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Picking a folder of your own files isn&apos;t supported in this
        browser — try Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" onClick={handlePickFolder}>
        Choose Folder...
      </Button>

      {error && <p className="text-sm text-muted-foreground">{error}</p>}

      {availableFiles.length > 0 && (
        <Select
          value={ambientFile?.name}
          onValueChange={(name) => {
            const file = availableFiles.find((f) => f.name === name);
            if (file) onSelectFile(file);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a file..." />
          </SelectTrigger>
          <SelectContent>
            {availableFiles.map((file) => (
              <SelectItem key={file.name} value={file.name}>
                {file.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {ambientFile && (
        <p className="text-sm text-muted-foreground">
          Selected: {ambientFile.name}
        </p>
      )}
    </div>
  );
}

const NOISE_LABELS: Record<NoiseType, string> = {
  white: "White Noise",
  brown: "Brown Noise",
  pink: "Pink Noise",
};

export default function SettingsPage() {
  const {
    focusMinutes,
    breakMinutes,
    soundEnabled,
    volume,
    ambientEnabled,
    ambientMode,
    noiseType,
    ambientFile,
    setFocusMinutes,
    setSoundEnabled,
    setVolume,
    setAmbientEnabled,
    setAmbientMode,
    setNoiseType,
    setAmbientFile,
  } = useTimerSettings();
  const breakMinutesLabel = breakMinutes.toFixed(1).replace(/\.0$/, "");

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="flex w-full max-w-lg flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label htmlFor="dark-mode-toggle">Dark Mode</Label>
            <ThemeToggle id="dark-mode-toggle" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DurationField
              id="focus-minutes"
              label="Focus Duration (minutes)"
              minutes={focusMinutes}
              onCommit={setFocusMinutes}
            />
            <p className="text-sm text-muted-foreground">
              Break Duration: {breakMinutesLabel} minutes (auto-calculated as
              1/5 of Focus Duration)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              Sound
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider">Volume</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {volume}%
                </span>
              </div>
              <Slider
                id="volume-slider"
                value={[volume]}
                onValueChange={(next) =>
                  setVolume(Array.isArray(next) ? next[0] : next)
                }
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">
                Play sound when a session ends
              </Label>
              <Checkbox
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ambient-enabled">Ambient Sound</Label>
              <Checkbox
                id="ambient-enabled"
                checked={ambientEnabled}
                onCheckedChange={setAmbientEnabled}
              />
            </div>

            {ambientEnabled && (
              <div className="flex flex-col gap-3 rounded-md border p-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ambient-mode">Source</Label>
                  <Select
                    value={ambientMode}
                    onValueChange={(value) =>
                      setAmbientMode(value as AmbientMode)
                    }
                  >
                    <SelectTrigger id="ambient-mode" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generated">
                        Generated Noise
                      </SelectItem>
                      <SelectItem value="file">My Files</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ambientMode === "generated" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="noise-type">Noise Type</Label>
                    <Select
                      value={noiseType}
                      onValueChange={(value) =>
                        setNoiseType(value as NoiseType)
                      }
                    >
                      <SelectTrigger id="noise-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(NOISE_LABELS) as NoiseType[]).map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {NOISE_LABELS[type]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <AmbientFilePicker
                    ambientFile={ambientFile}
                    onSelectFile={setAmbientFile}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
