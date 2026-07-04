"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRoom } from "@/hooks/RoomProvider";
import { useBooth } from "@/store/booth";
import { roomCode } from "@/lib/utils";
import { RoomPanel } from "@/components/room/RoomPanel";
import { CameraStage } from "@/components/booth/CameraStage";
import { LayoutPicker } from "@/components/LayoutPicker";
import { FramePicker } from "@/components/FramePicker";
import { Review } from "@/components/editor/Review";
import { Confetti } from "@/components/Confetti";
import { SettingsSheet } from "@/components/Settings";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";

export function App() {
  const room = useRoom();
  const s = useBooth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // join room once. Camera/mic is started on a user gesture (Enable Camera /
  // Start button) — mobile browsers block getUserMedia without one.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceHost = params.has("host"); // host link: ?room=CODE&host=1
    const invited = params.has("room") && !forceHost; // invite link → guest
    const id = params.get("room") || roomCode();
    const name = invited ? "Partner" : "Host";
    s.set({ roomId: id, userName: name });
    room.joinRoom(id, name);
    if (invited) toast("You joined the room 💌", "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (s.phase === "review") {
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 3800);
      return () => clearTimeout(t);
    }
  }, [s.phase]);

  return (
    <div className="min-h-screen">
      {confetti && <Confetti />}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <header className="max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-floaty">📸</span>
          <div>
            <h1 className="font-cute font-extrabold text-xl leading-none">Love Booth</h1>
            <p className="text-[11px] opacity-60 font-cute">capture memories, miles apart</p>
          </div>
        </div>
        <Button variant="soft" className="py-2" onClick={() => setSettingsOpen(true)}>⚙️ Settings</Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {s.phase !== "review" ? (
            <motion.div
              key="home"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid lg:grid-cols-[300px_1fr_320px] gap-4 sm:gap-5 items-start mt-3"
            >
              <div className="order-2 lg:order-none">
                <RoomPanel />
              </div>

              <div className="glass rounded-3xl p-4 sm:p-5 order-1 lg:order-none">
                <div className="text-center mb-4">
                  <span className="inline-block brand-grad text-white font-cute font-bold px-5 py-2 rounded-2xl shadow">
                    CAPTURE MEMORIES, MILES APART 💕
                  </span>
                </div>
                <CameraStage />
              </div>

              <div className="glass rounded-3xl p-4 sm:p-5 space-y-5 order-3 lg:order-none">
                <div>
                  <h3 className="font-cute font-bold mb-2">Select Layout</h3>
                  <LayoutPicker />
                </div>
                <div>
                  <h3 className="font-cute font-bold mb-2">Choose Frame</h3>
                  <FramePicker />
                </div>
                <div>
                  <h3 className="font-cute font-bold mb-2">Custom Text</h3>
                  <input
                    value={s.caption}
                    onChange={(e) => s.set({ caption: e.target.value })}
                    className="w-full rounded-xl bg-white/70 px-3 py-2 text-sm font-cute outline-none focus:ring-2 ring-pink-300"
                    placeholder="<3 Love <3"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="review" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3">
              <Review />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
