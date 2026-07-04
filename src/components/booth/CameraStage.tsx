"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRoom } from "@/hooks/RoomProvider";
import { useBooth } from "@/store/booth";
import { getLayout } from "@/data/layouts";
import { getFilter } from "@/data/filters";
import { sfx } from "@/lib/sounds";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";

function VideoTile({
  stream,
  mirror,
  label,
  speaking,
  filterCss,
  onEnable,
}: {
  stream: MediaStream | null;
  mirror: boolean;
  label: string;
  speaking?: boolean;
  filterCss: string;
  onEnable?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <div
      className={`relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-black/80 aspect-[3/4] ring-2 transition-all ${
        speaking ? "ring-green-400 shadow-[0_0_24px_-2px_rgba(74,222,128,0.7)]" : "ring-white/40"
      }`}
    >
      {stream ? (
        <video
          ref={ref}
          data-local
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: mirror ? "scaleX(-1)" : "none", filter: filterCss }}
        />
      ) : (
        <button
          onClick={onEnable}
          className="w-full h-full grid place-items-center text-white/80 text-sm font-cute"
        >
          <div className="text-center">
            <div className="text-3xl mb-1 animate-floaty">📷</div>
            Tap to enable camera
          </div>
        </button>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/45 text-white text-xs font-cute backdrop-blur">
        {speaking ? "🔊 " : ""}
        {label}
      </div>
    </div>
  );
}

export function CameraStage() {
  const room = useRoom();
  const s = useBooth();
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const busy = useRef(false);

  const grab = useCallback(
    (index: number) => {
      const useRemote = room.remoteStream && index % 2 === 1;
      const videoEl = document.querySelector(
        useRemote ? "video[data-remote]" : "video[data-local]"
      ) as HTMLVideoElement | null;
      if (!videoEl || !videoEl.videoWidth) return;
      const cw = videoEl.videoWidth;
      const ch = videoEl.videoHeight;
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;
      const mirror = !useRemote && s.settings.mirror;
      if (mirror) {
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoEl, 0, 0, cw, ch);
      s.setPhoto(index, canvas.toDataURL("image/jpeg", 0.92));
    },
    [s, room.remoteStream]
  );

  const runLoop = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    s.resetPhotos();
    const total = getLayout(s.layoutId).slots.length;
    const speed = s.settings.countdownSpeed;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < total; i++) {
      for (let n = 3; n >= 1; n--) {
        setCount(n);
        if (s.settings.sounds) sfx.beep();
        room.emit("session:tick", n);
        await wait(speed * 1000);
      }
      setCount(0);
      if (s.settings.sounds) sfx.go();
      setFlash(true);
      if (s.settings.sounds) sfx.shutter();
      grab(i);
      room.emit("session:capture", i);
      await wait(320);
      setFlash(false);
      setCount(null);
      await wait(420);
    }
    busy.current = false;
    if (s.settings.sounds) sfx.done();
    room.emit("session:done");
    toast("Photostrip complete! 🎉", "success");
    s.setPhase("review");
  }, [s, room, grab]);

  // non-host follows host-driven ticks
  useEffect(() => {
    const offStart = room.on("session:start", () => {
      if (!room.isHost) runLoop();
    });
    const offTick = room.on("session:tick", (...a) => {
      if (!room.isHost) setCount(a[0] as number);
    });
    const offCap = room.on("session:capture", (...a) => {
      if (!room.isHost) {
        setFlash(true);
        grab(a[0] as number);
        setTimeout(() => setFlash(false), 320);
      }
    });
    return () => {
      offStart();
      offTick();
      offCap();
    };
  }, [room, runLoop, grab]);

  const start = async () => {
    let stream = room.localStream;
    if (!stream) {
      stream = await room.startMedia(s.settings.cameraId, s.settings.micId);
      if (!stream) {
        toast("Camera/mic permission needed", "error");
        return;
      }
    }
    room.emit("session:start");
    runLoop();
  };

  const total = getLayout(s.layoutId).slots.length;
  const done = s.photos.filter(Boolean).length;
  const filterCss = getFilter(s.filterId).css;
  const filterStyle = filterCss === "none" ? undefined : filterCss;

  return (
    <div className="relative">
      <div className="flex gap-3">
        <VideoTile
          stream={room.localStream}
          mirror={s.settings.mirror}
          label={s.userName}
          speaking={room.localSpeaking && !room.muted}
          filterCss={filterStyle ?? ""}
          onEnable={() => room.startMedia(s.settings.cameraId, s.settings.micId)}
        />
        <RemoteTile
          stream={room.remoteStream}
          speaking={room.remoteSpeaking}
          filterCss={filterStyle ?? ""}
        />
      </div>

      <div className="flex gap-2 justify-center mt-3">
        <button
          onClick={() => s.updateSettings({ mirror: !s.settings.mirror })}
          className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white text-xs font-cute font-semibold"
        >
          {s.settings.mirror ? "🪞 Mirror: On" : "🪞 Mirror: Off"}
        </button>
        <button
          onClick={room.toggleMute}
          className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white text-xs font-cute font-semibold"
        >
          {room.muted ? "🔇 Mic Off" : "🎙️ Mic On"}
        </button>
      </div>

      {/* countdown + progress */}
      <AnimatePresence>
        {count !== null && (
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            className="absolute inset-0 grid place-items-center pointer-events-none"
          >
            <div className="text-white font-cute font-extrabold drop-shadow-lg" style={{ fontSize: "6rem" }}>
              {count === 0 ? "😊" : count}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {flash && <div className="absolute inset-0 bg-white rounded-2xl animate-flash pointer-events-none" />}

      <div className="mt-4 text-center">
        {busy.current || count !== null ? (
          <div className="font-cute font-semibold">
            Photo {Math.min(done + 1, total)} / {total}
            <div className="mt-2 h-2.5 rounded-full bg-white/50 overflow-hidden max-w-xs mx-auto">
              <motion.div
                className="h-full brand-grad"
                animate={{ width: `${(done / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
          </div>
        ) : (
          <Button onClick={start} className="px-8">
            {room.isHost || room.users.length <= 1 ? "✨ Start Collaborative Photoshoot" : "Waiting for host…"}
          </Button>
        )}
      </div>
    </div>
  );
}

function RemoteTile({
  stream,
  speaking,
  filterCss,
}: {
  stream: MediaStream | null;
  speaking: boolean;
  filterCss: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <div
      className={`relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-black/80 aspect-[3/4] ring-2 transition-all ${
        speaking ? "ring-green-400 shadow-[0_0_24px_-2px_rgba(74,222,128,0.7)]" : "ring-white/40"
      }`}
    >
      {stream ? (
        <video
          ref={ref}
          data-remote
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: filterCss || undefined }}
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-white/70 text-sm font-cute text-center px-3">
          <div>
            <div className="text-3xl mb-1 animate-floaty">💌</div>
            Invite your partner
            <br />
            with the room link!
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/45 text-white text-xs font-cute backdrop-blur">
        {speaking ? "🔊 " : ""}Partner
      </div>
    </div>
  );
}
