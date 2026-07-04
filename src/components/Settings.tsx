"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRoom } from "@/hooks/RoomProvider";
import { useBooth } from "@/store/booth";
import { Button } from "@/components/ui/Button";

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const room = useRoom();
  const s = useBooth();
  const st = s.settings;

  const applyDevice = (patch: { cameraId?: string; micId?: string }) => {
    s.updateSettings(patch);
    room.startMedia(patch.cameraId ?? st.cameraId, patch.micId ?? st.micId);
  };

  const toggleDark = (v: boolean) => {
    s.updateSettings({ darkMode: v });
    document.documentElement.classList.toggle("dark", v);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[min(92vw,380px)] glass z-50 p-6 overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cute font-bold text-lg">Settings</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/60">✕</button>
            </div>

            <Field label="Camera">
              <Select value={st.cameraId} onChange={(v) => applyDevice({ cameraId: v })} options={room.cameras.map((c) => ({ id: c.deviceId, label: c.label || "Camera" }))} />
            </Field>
            <Field label="Microphone">
              <Select value={st.micId} onChange={(v) => applyDevice({ micId: v })} options={room.mics.map((c) => ({ id: c.deviceId, label: c.label || "Microphone" }))} />
            </Field>
            <Field label="Speaker">
              <Select value={undefined} onChange={() => {}} options={room.speakers.map((c) => ({ id: c.deviceId, label: c.label || "Speaker" }))} />
            </Field>

            <Toggle label="Mirror my camera" value={st.mirror} onChange={(v) => s.updateSettings({ mirror: v })} />
            <Toggle label="Sounds" value={st.sounds} onChange={(v) => s.updateSettings({ sounds: v })} />
            <Toggle label="Dark mode" value={st.darkMode} onChange={toggleDark} />
            <Toggle label="Mute partner" value={room.muted} onChange={() => room.toggleMute()} />

            <Field label={`Countdown speed — ${st.countdownSpeed.toFixed(1)}s`}>
              <input type="range" min={0.5} max={2} step={0.1} value={st.countdownSpeed} onChange={(e) => s.updateSettings({ countdownSpeed: +e.target.value })} className="w-full accent-pink-400" />
            </Field>

            <Button full className="mt-4" onClick={() => room.startMedia(st.cameraId, st.micId)}>Restart Camera</Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-cute font-semibold opacity-70 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-cute">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full transition ${value ? "brand-grad" : "bg-white/60"} relative`}>
        <motion.span layout className="absolute top-1 w-5 h-5 rounded-full bg-white shadow" style={{ left: value ? 26 : 4 }} />
      </button>
    </div>
  );
}

function Select({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl bg-white/70 px-3 py-2 text-sm font-cute outline-none">
      {options.length === 0 && <option value="">Default</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
