"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useBooth } from "@/store/booth";
import { useMedia } from "./useMedia";

export type RoomUser = { id: string; name: string; ready: boolean };

type Ctx = {
  connected: boolean;
  selfId: string;
  isHost: boolean;
  users: RoomUser[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaError: string | null;
  muted: boolean;
  localSpeaking: boolean;
  remoteSpeaking: boolean;
  connQuality: "excellent" | "good" | "poor" | "connecting" | "none";
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  startMedia: (cam?: string, mic?: string) => Promise<MediaStream | null>;
  joinRoom: (roomId: string, name: string) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  toggleMute: () => void;
  broadcastConfig: (cfg: Record<string, unknown>) => void;
  emit: (ev: string, ...args: unknown[]) => void;
  on: (ev: string, cb: (...args: unknown[]) => void) => () => void;
};

const RoomCtx = createContext<Ctx | null>(null);
export const useRoom = () => {
  const c = useContext(RoomCtx);
  if (!c) throw new Error("useRoom must be used within RoomProvider");
  return c;
};

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function useSpeaking(stream: MediaStream | null) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;
    let raf = 0;
    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        an.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setSpeaking(avg > 18);
        raf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      /* ignore */
    }
    return () => {
      cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
    };
  }, [stream]);
  return speaking;
}

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const media = useMedia();
  const store = useBooth();
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remotePeerId = useRef<string>("");

  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connQuality, setConnQuality] = useState<Ctx["connQuality"]>("none");

  const localSpeaking = useSpeaking(media.stream);
  const remoteSpeaking = useSpeaking(remoteStream);

  const startMedia = useCallback((cam?: string, mic?: string) => media.start(cam, mic), [media]);

  // ── WebRTC peer setup ─────────────────────────────────────
  const buildPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      pcRef.current?.close();
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      remotePeerId.current = peerId;
      setConnQuality("connecting");

      media.streamRef.current?.getTracks().forEach((t) =>
        pc.addTrack(t, media.streamRef.current!)
      );

      const remote = new MediaStream();
      pc.ontrack = (e) => {
        e.streams[0]?.getTracks().forEach((t) => remote.addTrack(t));
        setRemoteStream(remote);
      };
      pc.onicecandidate = (e) => {
        if (e.candidate)
          socketRef.current?.emit("signal", { to: peerId, data: { candidate: e.candidate } });
      };
      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        if (s === "connected") setConnQuality("excellent");
        else if (s === "disconnected" || s === "failed") setConnQuality("poor");
        else if (s === "closed") setConnQuality("none");
      };

      if (initiator) {
        pc.createOffer()
          .then((o) => pc.setLocalDescription(o))
          .then(() => socketRef.current?.emit("signal", { to: peerId, data: { sdp: pc.localDescription } }))
          .catch(() => {});
      }
      return pc;
    },
    [media.streamRef]
  );

  const joinRoom = useCallback(
    (roomId: string, name: string) => {
      if (socketRef.current) return;
      const socket = io({ transports: ["websocket", "polling"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("room:join", { roomId, name });
      });
      socket.on("disconnect", () => setConnected(false));

      socket.on("room:joined", ({ selfId, isHost }: { selfId: string; isHost: boolean }) => {
        setSelfId(selfId);
        setIsHost(isHost);
      });
      socket.on("room:users", (u: RoomUser[]) => setUsers(u));

      socket.on("peer:new", ({ id }: { id: string }) => buildPeer(id, true));
      socket.on("peer:left", () => {
        pcRef.current?.close();
        pcRef.current = null;
        setRemoteStream(null);
        setConnQuality("none");
      });

      socket.on("signal", async ({ from, data }: { from: string; data: { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit } }) => {
        let pc = pcRef.current;
        if (!pc || remotePeerId.current !== from) pc = buildPeer(from, false);
        try {
          if (data.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            if (data.sdp.type === "offer") {
              const ans = await pc.createAnswer();
              await pc.setLocalDescription(ans);
              socket.emit("signal", { to: from, data: { sdp: pc.localDescription } });
            }
          } else if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch {
          /* ignore signaling races */
        }
      });

      socket.on("room:config", (cfg: Record<string, unknown>) => {
        useBooth.getState().set(cfg as never);
      });
    },
    [buildPeer]
  );

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("room:leave");
    socketRef.current?.disconnect();
    socketRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
    setConnected(false);
    setUsers([]);
    setConnQuality("none");
  }, []);

  const setReady = useCallback((ready: boolean) => {
    socketRef.current?.emit("room:ready", { ready });
  }, []);

  const broadcastConfig = useCallback((cfg: Record<string, unknown>) => {
    socketRef.current?.emit("room:config", cfg);
  }, []);

  const emit = useCallback((ev: string, ...args: unknown[]) => {
    socketRef.current?.emit(ev, ...args);
  }, []);
  const on = useCallback((ev: string, cb: (...args: unknown[]) => void) => {
    socketRef.current?.on(ev, cb as never);
    return () => socketRef.current?.off(ev, cb as never);
  }, []);

  useEffect(() => () => leaveRoom(), [leaveRoom]);

  const value: Ctx = {
    connected,
    selfId,
    isHost,
    users,
    localStream: media.stream,
    remoteStream,
    mediaError: media.error,
    muted: media.muted,
    localSpeaking,
    remoteSpeaking,
    connQuality,
    cameras: media.devices.cameras,
    mics: media.devices.mics,
    speakers: media.devices.speakers,
    startMedia,
    joinRoom,
    leaveRoom,
    setReady,
    toggleMute: media.toggleMute,
    broadcastConfig,
    emit,
    on,
  };

  return <RoomCtx.Provider value={value}>{children}</RoomCtx.Provider>;
}
