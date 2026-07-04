"use client";
// Lightweight WebAudio SFX — no asset files needed.
let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)());

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  beep: () => tone(660, 0.14, "triangle", 0.06),
  go: () => tone(990, 0.22, "triangle", 0.08),
  shutter: () => {
    try {
      const a = ac();
      const buf = a.createBuffer(1, a.sampleRate * 0.08, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = a.createBufferSource();
      const g = a.createGain();
      g.gain.value = 0.15;
      src.buffer = buf;
      src.connect(g).connect(a.destination);
      src.start();
    } catch {
      /* ignore */
    }
  },
  done: () => {
    tone(523, 0.15, "triangle", 0.07);
    setTimeout(() => tone(659, 0.15, "triangle", 0.07), 130);
    setTimeout(() => tone(784, 0.25, "triangle", 0.08), 260);
  },
  click: () => tone(440, 0.05, "square", 0.03),
};
