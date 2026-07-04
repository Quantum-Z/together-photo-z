# 📸 Love Booth

A premium Korean-style couples photobooth. Real-time camera + Discord-style voice chat, cute customizable frames, continuous automatic countdown photography, and a polished photostrip editor.

Built with **Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Zustand · Socket.io · WebRTC**.

## Features
- **Rooms** — create/join, invite link (`?room=CODE`), live connected users, host-controlled session, auto-reconnect.
- **Voice chat** — WebRTC audio with echo cancellation, noise suppression, auto gain, speaking indicator, mute.
- **Live camera** — own (mirrored) + partner (not mirrored) preview, desktop/tablet/mobile.
- **Auto photoshoot** — synchronized `3·2·1·FLASH` countdown that continues automatically until the strip is complete.
- **~29 cute frames** (Simple / Pattern / Seasonal packs) drawn as pure SVG — hearts, cherry, flowers, clouds, bear, ribbon, gingham, galaxy, film, valentine, christmas, and more.
- **Editor** — 14 filters, sticker library (drag/scale/rotate/duplicate), custom text (fonts/color/shadow), draw tools (brush/marker/pencil/glow + undo/redo), photo retake.
- **Export** — high-res PNG / JPEG / PDF, native share, QR code, social links.
- **Settings** — camera/mic/speaker select, mirror, countdown speed, sounds, dark mode.

## Run locally
```bash
npm install
npm run dev       # custom Next + Socket.io server on http://localhost:3000
```
Open the same `?room=CODE` link in two tabs/devices to test voice + partner sync. Grant camera + microphone permission.

## Production
```bash
npm run build
npm run start     # serves Next + Socket.io (needs a Node host, not static hosting)
```

### Deploy (Render — one click)
This app uses a **long-lived Socket.io server**, so it needs a Node host (Render / Railway / Fly), not static GitHub Pages.

1. Push this repo to GitHub.
2. On [Render](https://render.com) → **New → Blueprint** → pick this repo. `render.yaml` is detected automatically.
3. Deploy. The live URL (e.g. `https://love-booth.onrender.com`) is your shareable room link.

A `Dockerfile` is included for Railway / Fly / any container host.

---
Made with 💖
