"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type Devices = { cameras: MediaDeviceInfo[]; mics: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] };

export function useMedia() {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [devices, setDevices] = useState<Devices>({ cameras: [], mics: [], speakers: [] });
  const [muted, setMuted] = useState(false);

  const enumerate = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        cameras: list.filter((d) => d.kind === "videoinput"),
        mics: list.filter((d) => d.kind === "audioinput"),
        speakers: list.filter((d) => d.kind === "audiooutput"),
      });
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(
    async (cameraId?: string, micId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't access the camera. Use Chrome/Safari over HTTPS.");
        return null;
      }
      const audio = {
        deviceId: micId ? { exact: micId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      const attempts: MediaStreamConstraints[] = [
        {
          video: {
            deviceId: cameraId ? { exact: cameraId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio,
        },
        { video: { facingMode: "user" }, audio }, // simpler fallback
        { video: true, audio }, // most permissive
        { video: true, audio: true }, // last resort
      ];
      streamRef.current?.getTracks().forEach((t) => t.stop());
      let lastErr: unknown;
      for (const constraints of attempts) {
        try {
          const s = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = s;
          setStream(s);
          setReady(true);
          setError(null);
          await enumerate();
          return s;
        } catch (e) {
          lastErr = e;
        }
      }
      const name = lastErr instanceof DOMException ? lastErr.name : "";
      setError(
        name === "NotAllowedError"
          ? "Camera/mic permission denied. Allow it in your browser settings."
          : name === "NotReadableError"
          ? "Camera is busy — close other apps using it and retry."
          : "Couldn't start camera/mic. Check permissions and retry."
      );
      setReady(false);
      return null;
    },
    [enumerate]
  );

  const toggleMute = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    const next = !muted;
    s.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [muted]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setReady(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { stream, streamRef, ready, error, devices, muted, start, stop, toggleMute, enumerate };
}
