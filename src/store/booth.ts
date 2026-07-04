import { create } from "zustand";
import { StickerItem, TextItem, Stroke, Overlay } from "@/lib/types";
import { photoCount } from "@/data/layouts";

export type Phase = "home" | "lobby" | "booth" | "review";

type Settings = {
  mirror: boolean;
  sounds: boolean;
  countdownSpeed: number; // seconds per count
  darkMode: boolean;
  cameraId?: string;
  micId?: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);

type State = {
  phase: Phase;
  roomId: string;
  roomName: string;
  userName: string;
  isHost: boolean;

  layoutId: string;
  frameId: string;
  filterId: string;
  caption: string;

  photos: (string | null)[];
  captureIndex: number;
  capturing: boolean;

  stickers: StickerItem[];
  texts: TextItem[];
  strokes: Stroke[];
  selectedId: string | null;

  settings: Settings;

  set: (p: Partial<State>) => void;
  setPhase: (p: Phase) => void;
  setLayout: (id: string) => void;
  setFrame: (id: string) => void;
  setFilter: (id: string) => void;

  resetPhotos: () => void;
  setPhoto: (i: number, data: string | null) => void;

  addSticker: (emoji: string) => void;
  addText: (text: string) => void;
  updateOverlay: (id: string, patch: Partial<Overlay>) => void;
  removeOverlay: (id: string) => void;
  duplicateOverlay: (id: string) => void;
  select: (id: string | null) => void;

  addStroke: (s: Stroke) => void;
  popStroke: () => Stroke | undefined;
  redoStack: Stroke[];
  pushRedo: (s: Stroke) => void;
  redo: () => void;
  clearStrokes: () => void;

  updateSettings: (p: Partial<Settings>) => void;
};

export const useBooth = create<State>((set, get) => ({
  phase: "home",
  roomId: "",
  roomName: "Love Booth",
  userName: "You",
  isHost: false,

  layoutId: "strip-1x4",
  frameId: "pink",
  filterId: "original",
  caption: "<3 Love <3",

  photos: Array(photoCount("strip-1x4")).fill(null),
  captureIndex: 0,
  capturing: false,

  stickers: [],
  texts: [],
  strokes: [],
  selectedId: null,
  redoStack: [],

  settings: {
    mirror: true,
    sounds: true,
    countdownSpeed: 1,
    darkMode: false,
  },

  set: (p) => set(p),
  setPhase: (phase) => set({ phase }),
  setLayout: (layoutId) =>
    set({ layoutId, photos: Array(photoCount(layoutId)).fill(null), captureIndex: 0 }),
  setFrame: (frameId) => set({ frameId }),
  setFilter: (filterId) => set({ filterId }),

  resetPhotos: () =>
    set({ photos: Array(photoCount(get().layoutId)).fill(null), captureIndex: 0 }),
  setPhoto: (i, data) =>
    set((s) => {
      const photos = [...s.photos];
      photos[i] = data;
      return { photos };
    }),

  addSticker: (emoji) => {
    const s: StickerItem = { id: uid(), kind: "sticker", emoji, x: 0.5, y: 0.45, scale: 1, rot: 0 };
    set((st) => ({ stickers: [...st.stickers, s], selectedId: s.id }));
  },
  addText: (text) => {
    const t: TextItem = {
      id: uid(), kind: "text", text, x: 0.5, y: 0.5, scale: 1, rot: 0,
      color: "#ff5c8a", font: "'Baloo 2', cursive, sans-serif", shadow: true,
    };
    set((st) => ({ texts: [...st.texts, t], selectedId: t.id }));
  },
  updateOverlay: (id, patch) =>
    set((s) => ({
      stickers: s.stickers.map((o) => (o.id === id ? { ...o, ...patch } as StickerItem : o)),
      texts: s.texts.map((o) => (o.id === id ? { ...o, ...patch } as TextItem : o)),
    })),
  removeOverlay: (id) =>
    set((s) => ({
      stickers: s.stickers.filter((o) => o.id !== id),
      texts: s.texts.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  duplicateOverlay: (id) =>
    set((s) => {
      const src = [...s.stickers, ...s.texts].find((o) => o.id === id);
      if (!src) return {};
      const copy = { ...src, id: uid(), x: Math.min(0.95, src.x + 0.05), y: Math.min(0.95, src.y + 0.05) };
      if (copy.kind === "sticker")
        return { stickers: [...s.stickers, copy as StickerItem], selectedId: copy.id };
      return { texts: [...s.texts, copy as TextItem], selectedId: copy.id };
    }),
  select: (selectedId) => set({ selectedId }),

  addStroke: (st) => set((s) => ({ strokes: [...s.strokes, st], redoStack: [] })),
  popStroke: () => {
    const s = get().strokes;
    if (!s.length) return undefined;
    const last = s[s.length - 1];
    set({ strokes: s.slice(0, -1) });
    return last;
  },
  pushRedo: (st) => set((s) => ({ redoStack: [...s.redoStack, st] })),
  redo: () =>
    set((s) => {
      if (!s.redoStack.length) return {};
      const last = s.redoStack[s.redoStack.length - 1];
      return { strokes: [...s.strokes, last], redoStack: s.redoStack.slice(0, -1) };
    }),
  clearStrokes: () => set({ strokes: [], redoStack: [] }),

  updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
}));
