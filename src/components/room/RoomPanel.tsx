"use client";
import { motion } from "framer-motion";
import { useRoom } from "@/hooks/RoomProvider";
import { useBooth } from "@/store/booth";
import { inviteLink } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/Button";

const qualityColor: Record<string, string> = {
  excellent: "#37c26a",
  good: "#7fc23a",
  poor: "#e0a52f",
  connecting: "#8aa0c9",
  none: "#c0b6c0",
};

export function RoomPanel() {
  const room = useRoom();
  const { roomId } = useBooth();

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied!`, "success");
    } catch {
      toast("Copy failed", "error");
    }
  };

  return (
    <div className="glass rounded-3xl p-5 flex flex-col gap-4">
      <h2 className="font-cute font-bold text-lg">Create or Join Room</h2>

      <div className="rounded-2xl bg-white/50 p-4">
        <div className="text-xs opacity-60 font-cute">Room ID</div>
        <div className="font-cute font-extrabold text-xl tracking-wide">{roomId || "…"}</div>
        <div className="flex gap-2 mt-3">
          <Button variant="soft" className="flex-1 py-2" onClick={() => copy(inviteLink(roomId), "Invite link")}>
            🔗 Copy Link
          </Button>
          <Button variant="soft" className="py-2 px-3" onClick={() => copy(roomId, "Room ID")}>
            #
          </Button>
        </div>
        <p className="text-xs opacity-60 mt-2 font-cute">Invite your partner with this unique link!</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-cute font-semibold text-sm">Connected</span>
          <span className="flex items-center gap-1.5 text-xs font-cute" style={{ color: qualityColor[room.connQuality] }}>
            <span className="w-2 h-2 rounded-full" style={{ background: qualityColor[room.connQuality] }} />
            {room.connQuality}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {room.users.length === 0 && (
            <div className="text-xs opacity-50 font-cute">Connecting…</div>
          )}
          {room.users.map((u) => (
            <motion.div
              key={u.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2"
            >
              <span className="w-7 h-7 rounded-full brand-grad grid place-items-center text-white text-xs">
                {(u.id === room.selfId ? "You" : u.name)[0]?.toUpperCase()}
              </span>
              <span className="font-cute text-sm flex-1">
                {u.id === room.selfId ? "You" : u.name}
                {u.id === room.selfId && room.isHost ? " · host" : ""}
              </span>
              {u.ready && <span className="text-xs text-green-600 font-cute">ready</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={room.muted ? "outline" : "soft"}
          className="flex-1 py-2"
          onClick={room.toggleMute}
        >
          {room.muted ? "🔇 Muted" : "🎙️ Mic On"}
        </Button>
        <Button
          variant="soft"
          className="flex-1 py-2"
          onClick={() => (room.localStream ? toast("Camera live", "success") : room.startMedia())}
        >
          {room.localStream ? "📸 Camera On" : "Enable Camera"}
        </Button>
      </div>
    </div>
  );
}
