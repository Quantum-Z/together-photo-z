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
  const politeRef = useRef<boolean>(false);
  const makingOfferRef = useRef<boolean>(false);
  const sendersRef = useRef<{ audio?: RTCRtpSender; video?: RTCRtpSender }>({});

  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connQuality, setConnQuality] = useState<Ctx["connQuality"]>("none");

  const localSpeaking = useSpeaking(media.stream);
  const remoteSpeaking = useSpeaking(remoteStream);

  const startMedia = useCallback((cam?: string, mic?: string) => media.start(cam, mic), [media]);

  // ── WebRTC peer setup (perfect-negotiation pattern) ───────
  // `polite` peers yield on offer collisions. Tracks are (re)added whenever
  // the local camera becomes available, and onnegotiationneeded renegotiates —
  // so video connects even when the camera is enabled AFTER the peers join.
  const buildPeer = useCallback(
    (peerId: string, polite: boolean) => {
      pcRef.current?.close();
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      remotePeerId.current = peerId;
      politeRef.current = polite;
      makingOfferRef.current = false;
      setConnQuality("connecting");

      sendersRef.current = {};
      // Only the offerer pre-creates send/recv transceivers (fires the initial
      // offer). The answerer inherits matching m-lines from that offer, so both
      // sides can send video/audio even if a camera turns on later.
      if (!polite) {
        const stream = media.streamRef.current;
        const vTx = pc.addTransceiver("video", { direction: "sendrecv" });
        const aTx = pc.addTransceiver("audio", { direction: "sendrecv" });
        sendersRef.current = { video: vTx.sender, audio: aTx.sender };
        const vTrack = stream?.getVideoTracks()[0];
        const aTrack = stream?.getAudioTracks()[0];
        if (vTrack) vTx.sender.replaceTrack(vTrack).catch(() => {});
        if (aTrack) aTx.sender.replaceTrack(aTrack).catch(() => {});
      }

      const remote = new MediaStream();
      pc.ontrack = (e) => {
        remote.addTrack(e.track);
        setRemoteStream(remote);
      };
      pc.onicecandidate = (e) => {
        if (e.candidate)
          socketRef.current?.emit("signal", { to: peerId, data: { candidate: e.candidate } });
      };
      pc.onnegotiationneeded = async () => {
        try {
          makingOfferRef.current = true;
          await pc.setLocalDescription();
          socketRef.current?.emit("signal", { to: peerId, data: { sdp: pc.localDescription } });
        } catch {
          /* ignore */
        } finally {
          makingOfferRef.current = false;
        }
      };
      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === "connected") setConnQuality("excellent");
        else if (st === "disconnected") setConnQuality("poor");
        else if (st === "failed") {
          setConnQuality("poor");
          pc.restartIce?.();
        } else if (st === "closed") setConnQuality("none");
      };
      return pc;
    },
    [media.streamRef]
  );

  // When the local camera/mic turns on (or the device changes), push the new
  // tracks into the live peer connection and renegotiate.
  useEffect(() => {
    const pc = pcRef.current;
    const stream = media.stream;
    if (!pc || !stream) return;
    // replaceTrack on the pre-created transceivers — no renegotiation needed,
    // so the partner sees video the instant the camera is enabled.
    const v = stream.getVideoTracks()[0];
    const a = stream.getAudioTracks()[0];
    if (v && sendersRef.current.video && sendersRef.current.video.track !== v)
      sendersRef.current.video.replaceTrack(v).catch(() => {});
    if (a && sendersRef.current.audio && sendersRef.current.audio.track !== a)
      sendersRef.current.audio.replaceTrack(a).catch(() => {});
  }, [media.stream]);

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

      // existing member is the impolite offerer toward the newcomer
      socket.on("peer:new", ({ id }: { id: string }) => buildPeer(id, false));
      socket.on("peer:left", () => {
        pcRef.current?.close();
        pcRef.current = null;
        setRemoteStream(null);
        setConnQuality("none");
      });

      socket.on(
        "signal",
        async ({ from, data }: { from: string; data: { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit } }) => {
          // newcomer creates the peer as polite when the first signal arrives
          let pc = pcRef.current;
          if (!pc || remotePeerId.current !== from) pc = buildPeer(from, true);
          try {
            if (data.sdp) {
              const offerCollision =
                data.sdp.type === "offer" &&
                (makingOfferRef.current || pc.signalingState !== "stable");
              if (!politeRef.current && offerCollision) return; // impolite ignores
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              if (data.sdp.type === "offer") {
                await pc.setLocalDescription();
                socket.emit("signal", { to: from, data: { sdp: pc.localDescription } });
                // answerer: adopt the negotiated senders and attach local media
                const stream = media.streamRef.current;
                for (const tx of pc.getTransceivers()) {
                  const kind = tx.receiver.track?.kind;
                  if (kind === "video") {
                    sendersRef.current.video = tx.sender;
                    const t = stream?.getVideoTracks()[0];
                    if (t && tx.sender.track !== t) tx.sender.replaceTrack(t).catch(() => {});
                  } else if (kind === "audio") {
                    sendersRef.current.audio = tx.sender;
                    const t = stream?.getAudioTracks()[0];
                    if (t && tx.sender.track !== t) tx.sender.replaceTrack(t).catch(() => {});
                  }
                }
              }
            } else if (data.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch {
                /* candidate arrived before remote description — safe to drop */
              }
            }
          } catch {
            /* ignore signaling races */
          }
        }
      );

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
