# FocusTube PWA

Track your YouTube playlist progress. Install it like a native app on Android and desktop.

## Deploy to Vercel (5 minutes)

### Option A — GitHub + Vercel (recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "init"
   gh repo create focustube --public --push
   ```

2. **Import on Vercel**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"** → select `focustube`
   - Framework Preset: **Vite** (auto-detected)
   - Click **Deploy** — done ✅

### Option B — Vercel CLI (no GitHub needed)

```bash
npm install -g vercel
npm install          # install dependencies first
vercel               # follow prompts → deploys instantly
```

---

## Install as a PWA

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap the **⋮ menu → "Add to Home Screen"**
3. App installs with its own icon, opens fullscreen

### Desktop (Chrome / Edge)
1. Open your Vercel URL
2. Click the **install icon** (➕) in the address bar
3. Click **Install** — launches like a native app

### iOS (Safari)
1. Open your Vercel URL in Safari
2. Tap **Share → "Add to Home Screen"**

---

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

---

## Features

- ✅ Tracks multiple YouTube playlists simultaneously
- ✅ Per-video or count-based progress tracking
- ✅ Daily goals with completion tracking
- ✅ Progress bars + SVG chart
- ✅ Data persists via localStorage
- ✅ Works offline (service worker caches app shell + fonts)
- ✅ Installable on Android, iOS, Windows, macOS, Linux
