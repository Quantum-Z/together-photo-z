"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { useBooth } from "@/store/booth";
import { getFrame } from "@/data/frames";
import { getLayout } from "@/data/layouts";
import { FILTERS } from "@/data/filters";
import { STICKER_GROUPS } from "@/data/stickers";
import { FONTS, Stroke } from "@/lib/types";
import { exportStrip, downloadDataUrl } from "@/lib/compose";
import { todayStr, inviteLink } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";
import { FramePicker } from "@/components/FramePicker";
import { OverlayEditor } from "./OverlayEditor";
import { cn } from "@/lib/utils";

type Tab = "photos" | "frame" | "filter" | "sticker" | "text" | "draw";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "photos", label: "Photos", icon: "🖼️" },
  { id: "frame", label: "Frame", icon: "🎀" },
  { id: "filter", label: "Filter", icon: "✨" },
  { id: "sticker", label: "Sticker", icon: "💖" },
  { id: "text", label: "Text", icon: "🔤" },
  { id: "draw", label: "Draw", icon: "🖌️" },
];

const DRAW_COLORS = ["#ff5c8a", "#ffffff", "#111111", "#ffd23f", "#5ec8ff", "#8b5cf6", "#4ade80", "#ff8a5c"];

export function Review() {
  const s = useBooth();
  const [tab, setTab] = useState<Tab>("frame");
  const [drawTool, setDrawTool] = useState<Stroke["tool"]>("brush");
  const [drawColor, setDrawColor] = useState("#ff5c8a");
  const [drawWidth, setDrawWidth] = useState(0.012);
  const [busy, setBusy] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const selected = useMemo(
    () => [...s.stickers, ...s.texts].find((o) => o.id === s.selectedId) ?? null,
    [s.stickers, s.texts, s.selectedId]
  );

  const composeOpts = () => ({
    frame: getFrame(s.frameId),
    layout: getLayout(s.layoutId),
    filterId: s.filterId,
    caption: s.caption,
    dateStr: todayStr(),
    roomName: s.roomName,
    photos: s.photos,
    stickers: s.stickers,
    texts: s.texts,
    strokes: s.strokes,
  });

  const doExport = async (fmt: "png" | "jpeg" | "pdf") => {
    setBusy(true);
    try {
      if (fmt === "pdf") {
        const url = await exportStrip(composeOpts(), "png");
        const img = new Image();
        img.src = url;
        await img.decode();
        const pdf = new jsPDF({ orientation: img.width > img.height ? "l" : "p", unit: "px", format: [img.width, img.height] });
        pdf.addImage(url, "PNG", 0, 0, img.width, img.height);
        pdf.save(`lovebooth-${Date.now()}.pdf`);
      } else {
        const url = await exportStrip(composeOpts(), fmt);
        downloadDataUrl(url, `lovebooth-${Date.now()}.${fmt === "jpeg" ? "jpg" : "png"}`);
      }
      toast("Saved! 💖", "success");
    } catch {
      toast("Export failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const share = async (net?: string) => {
    const link = inviteLink(s.roomId);
    if (net) {
      const enc = encodeURIComponent(link);
      const urls: Record<string, string> = {
        x: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Made a cute photostrip on Love Booth 💖")}&url=${enc}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
        tiktok: `https://www.tiktok.com/upload`,
        instagram: `https://www.instagram.com/`,
      };
      window.open(urls[net], "_blank");
      return;
    }
    try {
      const url = await exportStrip(composeOpts(), "png");
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "lovebooth.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Love Booth" });
      } else {
        await navigator.clipboard.writeText(link);
        toast("Link copied!", "success");
      }
    } catch {
      toast("Share cancelled", "info");
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(280px,360px)] gap-5 items-start">
      {/* preview */}
      <div className="glass rounded-3xl p-5 flex flex-col items-center">
        <div className="w-full max-w-[380px]">
          <OverlayEditor mode={tab === "draw" ? "draw" : "select"} drawColor={drawColor} drawTool={drawTool} drawWidth={drawWidth} />
        </div>

        {selected && tab !== "draw" && (
          <SelectedControls />
        )}

        <div className="flex flex-wrap gap-2 justify-center mt-5">
          <Button variant="soft" onClick={() => doExport("png")} disabled={busy}>⬇️ PNG</Button>
          <Button variant="soft" onClick={() => doExport("jpeg")} disabled={busy}>⬇️ JPEG</Button>
          <Button variant="soft" onClick={() => doExport("pdf")} disabled={busy}>📄 PDF</Button>
          <Button onClick={() => share()} disabled={busy}>💌 Share</Button>
          <Button variant="outline" onClick={() => setShowQR((v) => !v)}>🔳 QR</Button>
        </div>
        <div className="flex gap-3 mt-3 text-xl">
          <button onClick={() => share("instagram")} title="Instagram">📸</button>
          <button onClick={() => share("tiktok")} title="TikTok">🎵</button>
          <button onClick={() => share("x")} title="X">✖️</button>
          <button onClick={() => share("facebook")} title="Facebook">📘</button>
        </div>
        <AnimatePresence>
          {showQR && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 bg-white rounded-2xl">
              <QRCodeCanvas value={inviteLink(s.roomId)} size={128} fgColor="#ff5c8a" />
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => s.setPhase("home")} className="mt-4 text-sm font-cute opacity-60 hover:opacity-100">
          ← back to booth
        </button>
      </div>

      {/* tools */}
      <div className="glass rounded-3xl p-4">
        <div className="grid grid-cols-6 gap-1 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-cute font-semibold transition",
                tab === t.id ? "brand-grad text-white shadow" : "hover:bg-white/50"
              )}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] overflow-y-auto no-scrollbar">
          {tab === "photos" && <PhotosPanel />}
          {tab === "frame" && (
            <div className="space-y-4">
              <FramePicker />
              <div>
                <label className="text-xs font-cute font-semibold opacity-70">Caption</label>
                <input
                  value={s.caption}
                  onChange={(e) => s.set({ caption: e.target.value })}
                  className="w-full mt-1 rounded-xl bg-white/70 px-3 py-2 text-sm font-cute outline-none focus:ring-2 ring-pink-300"
                  placeholder="<3 Love <3"
                />
              </div>
            </div>
          )}
          {tab === "filter" && (
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => s.setFilter(f.id)}
                  className={cn(
                    "rounded-xl overflow-hidden ring-2 transition",
                    s.filterId === f.id ? "ring-pink-400" : "ring-transparent"
                  )}
                >
                  <div className="aspect-square brand-grad" style={{ filter: f.css === "none" ? undefined : f.css }} />
                  <div className="text-[10px] font-cute py-1">{f.name}</div>
                </button>
              ))}
            </div>
          )}
          {tab === "sticker" && (
            <div className="space-y-3">
              {STICKER_GROUPS.map((g) => (
                <div key={g.label}>
                  <div className="text-xs font-cute font-semibold opacity-60 mb-1">{g.label}</div>
                  <div className="grid grid-cols-6 gap-1">
                    {g.items.map((em, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => s.addSticker(em)}
                        className="text-2xl aspect-square grid place-items-center rounded-lg hover:bg-white/60"
                      >
                        {em}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "text" && <TextPanel selected={selected?.kind === "text" ? selected : null} />}
          {tab === "draw" && (
            <DrawPanel
              tool={drawTool}
              setTool={setDrawTool}
              color={drawColor}
              setColor={setDrawColor}
              width={drawWidth}
              setWidth={setDrawWidth}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PhotosPanel() {
  const s = useBooth();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {s.photos.map((p, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-white/40">
            {p ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs opacity-50 font-cute">empty</div>
            )}
            <button
              onClick={() => s.setPhoto(i, null)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-xs"
            >
              ↺
            </button>
            <span className="absolute bottom-1 left-1 bg-black/50 text-white rounded-full px-2 text-[10px] font-cute">{i + 1}</span>
          </div>
        ))}
      </div>
      <Button variant="soft" full onClick={() => { s.resetPhotos(); s.setPhase("home"); }}>
        🔁 Retake All
      </Button>
      <p className="text-[11px] opacity-60 font-cute text-center">Tap ↺ to clear a photo, then retake it in the booth.</p>
    </div>
  );
}

function TextPanel({ selected }: { selected: import("@/lib/types").TextItem | null }) {
  const s = useBooth();
  const [val, setVal] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Type something cute…"
          className="flex-1 rounded-xl bg-white/70 px-3 py-2 text-sm font-cute outline-none focus:ring-2 ring-pink-300"
        />
        <Button onClick={() => { if (val.trim()) { s.addText(val.trim()); setVal(""); } }}>Add</Button>
      </div>
      {selected ? (
        <div className="space-y-2 rounded-xl bg-white/50 p-3">
          <div className="text-xs font-cute font-semibold opacity-60">Selected text</div>
          <div className="grid grid-cols-5 gap-1">
            {FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => s.updateOverlay(selected.id, { font: f.css })}
                className={cn("text-[10px] py-1.5 rounded-lg", selected.font === f.css ? "brand-grad text-white" : "bg-white/70")}
                style={{ fontFamily: f.css }}
              >
                Aa
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {DRAW_COLORS.map((c) => (
              <button key={c} onClick={() => s.updateOverlay(selected.id, { color: c })} className="w-6 h-6 rounded-full ring-1 ring-black/10" style={{ background: c }} />
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs font-cute">
            <input type="checkbox" checked={selected.shadow} onChange={(e) => s.updateOverlay(selected.id, { shadow: e.target.checked })} />
            shadow
          </label>
        </div>
      ) : (
        <p className="text-[11px] opacity-60 font-cute text-center">Add text, then tap it on the strip to edit its font & color.</p>
      )}
    </div>
  );
}

function DrawPanel({
  tool, setTool, color, setColor, width, setWidth,
}: {
  tool: Stroke["tool"]; setTool: (t: Stroke["tool"]) => void;
  color: string; setColor: (c: string) => void;
  width: number; setWidth: (w: number) => void;
}) {
  const s = useBooth();
  const tools: { id: Stroke["tool"]; label: string; icon: string }[] = [
    { id: "brush", label: "Brush", icon: "🖌️" },
    { id: "marker", label: "Marker", icon: "🖊️" },
    { id: "pencil", label: "Pencil", icon: "✏️" },
    { id: "glow", label: "Glow", icon: "🌟" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1">
        {tools.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} className={cn("py-2 rounded-xl text-[10px] font-cute", tool === t.id ? "brand-grad text-white" : "bg-white/70")}>
            <div className="text-base">{t.icon}</div>{t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {DRAW_COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={cn("w-7 h-7 rounded-full ring-2", color === c ? "ring-pink-400" : "ring-black/10")} style={{ background: c }} />
        ))}
      </div>
      <label className="block text-xs font-cute">
        Size
        <input type="range" min={0.004} max={0.03} step={0.002} value={width} onChange={(e) => setWidth(+e.target.value)} className="w-full accent-pink-400" />
      </label>
      <div className="flex gap-2">
        <Button variant="soft" className="flex-1 py-2" onClick={() => s.popStroke()}>↩️ Undo</Button>
        <Button variant="soft" className="flex-1 py-2" onClick={() => s.redo()}>↪️ Redo</Button>
        <Button variant="outline" className="py-2" onClick={() => s.clearStrokes()}>🗑️</Button>
      </div>
      <p className="text-[11px] opacity-60 font-cute text-center">Draw directly on the strip with your finger or mouse.</p>
    </div>
  );
}

function SelectedControls() {
  const s = useBooth();
  const o = [...s.stickers, ...s.texts].find((x) => x.id === s.selectedId);
  if (!o) return null;
  return (
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass rounded-2xl p-2 mt-3 flex items-center gap-2 flex-wrap justify-center">
      <IconBtn onClick={() => s.updateOverlay(o.id, { scale: Math.max(0.3, o.scale - 0.15) })}>➖</IconBtn>
      <IconBtn onClick={() => s.updateOverlay(o.id, { scale: Math.min(4, o.scale + 0.15) })}>➕</IconBtn>
      <IconBtn onClick={() => s.updateOverlay(o.id, { rot: o.rot - 15 })}>↺</IconBtn>
      <IconBtn onClick={() => s.updateOverlay(o.id, { rot: o.rot + 15 })}>↻</IconBtn>
      <IconBtn onClick={() => s.duplicateOverlay(o.id)}>⧉</IconBtn>
      <IconBtn onClick={() => s.removeOverlay(o.id)}>🗑️</IconBtn>
    </motion.div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-9 h-9 rounded-xl bg-white/70 hover:bg-white grid place-items-center text-sm">
      {children}
    </button>
  );
}
