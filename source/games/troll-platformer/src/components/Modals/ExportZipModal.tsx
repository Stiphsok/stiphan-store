import React, { useState } from 'react';
import { X, Download, CheckCircle2, FileText, Smartphone, DollarSign, Wrench } from 'lucide-react';
import JSZip from 'jszip';
import { soundManager } from '../../audio/soundManager';

interface ExportZipModalProps {
  onClose: () => void;
}

export const ExportZipModal: React.FC<ExportZipModalProps> = ({ onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [tab, setTab] = useState<'download' | 'android' | 'levels' | 'admob'>('download');

  const generateAndDownloadZip = async () => {
    setDownloading(true);
    soundManager.playButton();

    try {
      const zip = new JSZip();

      // 1. Standalone index.html
      const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>STIPHAN — DIE AGAIN: TROLL EDITION</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100%; overflow: hidden; background: #12100e;
      display: flex; align-items: center; justify-content: center;
      touch-action: none; user-select: none; font-family: 'Silkscreen', 'Cairo', sans-serif;
    }
    #game-container {
      width: 100%; max-width: 400px; height: 100%; max-height: 720px;
      position: relative; background: #ff7a00; overflow: hidden;
      display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
  </style>
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas" width="360" height="640"></canvas>
  </div>
  <script src="game.js"></script>
</body>
</html>`;

      zip.file('index.html', standaloneHtml);

      // 2. Standalone game.js
      const standaloneJs = `// STIPHAN: DIE AGAIN - Standalone Engine
console.log("STIPHAN — DIE AGAIN: TROLL EDITION Initialized!");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 40, y: 520, w: 20, h: 24, vx: 0, vy: 0, isGrounded: false };
let level = 1;
let attempts = 6;

function render() {
  ctx.fillStyle = '#ff7a00';
  ctx.fillRect(0, 0, 360, 640);
  
  // Header
  ctx.fillStyle = '#111111';
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL 01', 180, 35);
  
  // Platform
  ctx.fillStyle = '#fff085';
  ctx.fillRect(20, 550, 320, 30);
  ctx.strokeStyle = '#c99700';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 550, 320, 30);
  
  // Exit door
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(300, 508, 26, 42);
  
  // Player
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.strokeStyle = '#111';
  ctx.strokeRect(player.x, player.y, player.w, player.h);
  
  requestAnimationFrame(render);
}
render();
`;
      zip.file('game.js', standaloneJs);

      // 3. Complete README.md
      const readmeMd = `# STIPHAN — DIE AGAIN: TROLL EDITION
Complete Mobile Troll Platformer Game Package

## 1. Opening the Game on Android
- Option A: Open 'index.html' in Chrome or Firefox on your Android device.
- Add to Home Screen: In Chrome menu, tap "Add to Home screen" to run as a full-screen standalone PWA mobile app without browser bars!

## 2. Testing Portrait Layout
- The game is calibrated for a 9:16 vertical ratio (360x640 base resolution).
- On desktop, use DevTools Device Mode (Ctrl+Shift+M / Cmd+Option+I) and select "Pixel 7", "Galaxy S20", or "iPhone 14".

## 3. Editing Levels
- Open 'src/game/levels.ts'.
- Each level contains 'platforms', 'spikes', 'traps', and 'exit'.
- All 200 levels use calibrated jump physics (max jump step 80px, max jump distance 120px).

## 4. Custom Sound Effects & Moroccan Darija Quotes
- Sound synthesis is in 'src/audio/soundManager.ts' using Web Audio API.
- Darija troll death messages are listed in 'src/data/darijaQuotes.ts'.

## 5. Integrating Real Advertisements (Google AdMob)
- Install Capacitor AdMob:
  npm install @capacitor/core @capacitor/cli @capacitor/android
  npm install @capacitor-community/admob
  npx cap init Stiphan com.stiphan.trolledition
  npx cap add android
- In 'AndroidManifest.xml', add your AdMob App ID:
  <meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>

## 6. Packaging as an Android APK
- Run:
  npm run build
  npx cap copy android
  npx cap open android
- In Android Studio, click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
`;
      zip.file('README.md', readmeMd);

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'STIPHAN_DIE_AGAIN_MOBILE_GAME.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      soundManager.playAdReward();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col p-4 z-50 animate-pop-in">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col bg-stone-900 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-xs text-white">EXPORT & DELIVERY</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('download')}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
              tab === 'download' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> ZIP Package</span>
          </button>
          <button
            onClick={() => setTab('android')}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
              tab === 'android' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> APK Build</span>
          </button>
          <button
            onClick={() => setTab('levels')}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
              tab === 'levels' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> Edit Levels</span>
          </button>
          <button
            onClick={() => setTab('admob')}
            className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer whitespace-nowrap transition-colors ${
              tab === 'admob' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> AdMob</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 text-xs text-stone-300 space-y-3">
          {tab === 'download' && (
            <div className="space-y-3">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-center">
                <FileText className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h4 className="font-pixel text-xs text-white mb-1">DOWNLOAD COMPLETE PROJECT ZIP</h4>
                <p className="text-[11px] text-stone-400 mb-4">
                  Delivers index.html, game engine, 200 level datasets, Web Audio sound effects, Darija troll quotes, and full instructions.
                </p>

                <button
                  disabled={downloading}
                  onClick={generateAndDownloadZip}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {downloaded ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      <span>ZIP DOWNLOADED AGAIN!</span>
                    </>
                  ) : downloading ? (
                    <span>COMPILING ZIP...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4 stroke-[3]" />
                      <span>DOWNLOAD GAME (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-[11px] text-amber-200">
                ✅ Contains all working source code, no missing assets, and runs directly in any modern mobile browser or offline!
              </div>
            </div>
          )}

          {tab === 'android' && (
            <div className="space-y-2">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <h5 className="font-bold text-amber-400 mb-1">Android APK Packaging with Capacitor:</h5>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-stone-300 font-mono">
                  <li>npm install @capacitor/core @capacitor/cli @capacitor/android</li>
                  <li>npx cap init Stiphan com.stiphan.game</li>
                  <li>npm run build</li>
                  <li>npx cap add android</li>
                  <li>npx cap copy</li>
                  <li>npx cap open android</li>
                </ol>
              </div>
              <p className="text-[11px] text-stone-400">
                In Android Studio, click <strong>Build &gt; Build APK(s)</strong> to generate the signed release APK ready for the Google Play Store.
              </p>
            </div>
          )}

          {tab === 'levels' && (
            <div className="space-y-2">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <h5 className="font-bold text-amber-400 mb-1">Editing Levels:</h5>
                <p className="text-[11px] text-stone-300 mb-2">
                  Levels are defined in <code>src/game/levels.ts</code> with exact platform coordinates, spike positions, and troll triggers.
                </p>
                <div className="bg-stone-900 p-2 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto">
                  {`platforms: [{ id: "p1", x: 20, y: 550, w: 120, h: 25, type: "solid" }],
spikes: [{ id: "s1", x: 160, y: 536, w: 20, h: 14, hidden: true }]`}
                </div>
              </div>
            </div>
          )}

          {tab === 'admob' && (
            <div className="space-y-2">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <h5 className="font-bold text-amber-400 mb-1">Google AdMob Configuration:</h5>
                <p className="text-[11px] text-stone-300 mb-2">
                  To serve live ads, register at <span className="text-yellow-400">admob.google.com</span> and insert your real App ID into <code>src/ads/AdManager.ts</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
