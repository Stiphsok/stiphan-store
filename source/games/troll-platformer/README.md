# STIPHAN — DIE AGAIN: TROLL EDITION

A complete, responsive vertical mobile 2D troll platformer built with HTML5 Canvas, React, Vite, Tailwind CSS, and the Web Audio API.

---

## 1. Visual & Gameplay Reference Matching

- **Bright Orange Background:** `#ff7a00` vibrant warm orange tone.
- **Pale-Yellow Platforms & Terrain:** `#fff085` with crisp dark-golden amber `#c99700` outlines.
- **Retro Pixel Character (Stiphan):** Original expressive pixel hero with customizable skins (including an authentic Moroccan Tarboosh / Fez, Ninja headband, King's crown, Thug Life shades, and Evil Troll horns).
- **Black Triangular Spikes:** Precision sharp triangle hitboxes that feel fair yet unforgiving.
- **Minimalist Gray Exit Door:** Classic steel gray door with door handle and green portal glow.
- **Bold Black Pixel Level Number:** Prominently displayed at the top center (`LEVEL 01` through `LEVEL 200`).
- **Troll Traps:** Hidden pop-up spikes, crumbling fake floors, moving platforms, and falling ceiling hazards.

---

## 2. Mobile Portrait Format (9:16)

- Optimized for **9:16 vertical phone screens** (base canvas resolution 360 × 640).
- Fully responsive on Android smartphones, iPhones, tablets, and desktop browsers.
- No horizontal scrolling; viewport is locked with `touch-action: none` and `user-scalable=no` to prevent accidental zooming during frantic button taps.
- Large, tactile on-screen touch controls positioned comfortably at the bottom for thumb play:
  - **LEFT (◀)** and **RIGHT (▶)** movement buttons
  - **JUMP (▲)** button with tactile feedback and optional haptic vibration

---

## 3. 200 Playable Levels

The game features 200 distinct levels categorized across 6 progressive difficulty eras:

1. **Levels 1–10 (Learning Basics):** Introductory jumps, basic navigation, and the first surprise pop-up spike.
2. **Levels 11–30 (Sneaky Spikes):** Gaps, bait routes, and hidden spikes on landing spots.
3. **Levels 31–60 (Collapsing Reality):** Fake floors that crumble 0.25s after being stepped on, moving platforms.
4. **Levels 61–100 (Troll Symphony):** Falling ceiling hazards, deceptive troll signs ("SAFE AHEAD ;)"), precision hops.
5. **Levels 101–150 (Precision & Paranoia):** Vertical multi-tier zig-zag towers with tight landings and moving ferries.
6. **Levels 151–200 (Grandmaster Stiphan):** Expert gauntlets combining crumbling stepping stones, spike tunnels, and mind games.

> **Reachability Guarantee:** All jump geometries are strictly bounded within player physics (max vertical step ≤ 80px, max jump distance ≤ 120px). Every level is verified completable through skill and observation.

---

## 4. Funny Evil Sounds & Moroccan Darija Quotes

### Web Audio API Synthesis
Zero external audio files required — 100% reliable offline operation with zero missing asset errors:
- **5 Randomized Evil Villain Troll Laughs:**
  1. *Classic Deep Villain Laugh:* "Mwa-ha-ha-ha-ha!" with formant vocal vowel filters.
  2. *Cheeky Troll Giggle:* High-pitched rapid goblin chuckle.
  3. *Goofy Cartoon Wah-Wah:* Comedic descending slide followed by sarcastic chuckles.
  4. *Goblin Chortle:* Rapid mischievous arpeggiated laughter.
  5. *Raspy Devil Laugh:* Low growling laugh.
- **Action Sound Effects:** Crisp 8-bit jump sound, landing thud, spike trigger click, platform crumble crunch, splat death pop, coin chime, and level victory fanfare.

### 36 Moroccan Darija Troll Messages
Displayed dynamically upon death with Arabic script, phonetic transliteration, and English punchlines, including:
- “هههههه شدّيتيها 😂” (*Hahaha you got wrecked!*)
- “واش حسبتيها سهلة؟ 😈” (*Did you think it was that easy?*)
- “الفخ ضحك عليك ههههه!” (*The trap laughed at you hahaha!*)
- “ركز آ البطل، ركز! 🤣” (*Focus champion, focus!*)
- “حتى الأرض تخلّعات منك!” (*Even the floor got scared of you!*)
- “طحتي فالفخ كي السردين 🐟” (*Fell in the trap like a fresh sardine!*)
- “واش مشيتي تشرب أتاي؟ ☕😂” (*Did you go sip Moroccan mint tea?*)
- “زوينة منك ولكن مسلكاتش 🤷‍♂️” (*Nice try, but it didn't work out!*)
- “نتا والشوكة قصة حب أبدية 🌵❤️” (*You and the spike: an eternal love story!*)

---

## 5. Six Free Attempts System

- Every player starts with **6 Free Attempts**.
- Each death consumes 1 attempt.
- When only **2 attempts remain**, an animated warning banner flashes with an urgent alert sound: `⚠️ WARNING: ONLY 2 LIVES LEFT!`.
- When attempts reach 0, the game pauses and opens the **Out of Lives** screen.
- Watching a **Rewarded Ad** grants **+3 additional attempts**.
- Alternatively, players can purchase 3 lives for 50 in-game coins.
- **Unlocked levels are never erased** when attempts hit zero.
- Duplicate reward claims are prevented using unique time-stamped verification tokens saved in `localStorage`.

---

## 6. Advertising Integration (Google AdMob Ready)

The advertising module (`src/ads/AdManager.ts`) provides clean hooks for:

### Rewarded Advertisements:
1. **+3 Extra Attempts** when out of lives or at any time.
2. **Second Chance Revive** to resume right where you died.
3. **2X Bonus Coins (+50 Coins)** upon clearing a level.
4. **Troll Trap Radar** (highlights hidden spikes and crumbling floors in bright red/yellow outlines).
5. **Daily Mystery Box** for free lives and coins.

### Banner Advertisements:
- Displayed cleanly at the footer of the Main Menu, Level Select, and Shop.

### Interstitial Advertisements:
- Shown occasionally between completed levels (capped to at most once every 3 levels with a 90-second minimum cooldown, never interrupting active gameplay).

### Google AdMob Android Configuration
The game includes official Google AdMob test IDs pre-configured:
- **App ID:** `ca-app-pub-3940256099942544~3347511713`
- **Rewarded Ad Unit:** `ca-app-pub-3940256099942544/5224354917`
- **Interstitial Ad Unit:** `ca-app-pub-3940256099942544/1033173712`
- **Banner Ad Unit:** `ca-app-pub-3940256099942544/6300978111`

---

## 7. Packaging as an Android APK

To bundle this project into an Android APK using Capacitor:

```bash
# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor-community/admob

# 2. Initialize Capacitor
npx cap init Stiphan com.stiphan.trolledition

# 3. Build the web app
npm run build

# 4. Add the Android platform
npx cap add android
npx cap copy android

# 5. Open in Android Studio to build the signed APK
npx cap open android
```

In Android Studio:
1. Open `AndroidManifest.xml` and add your Google AdMob App ID.
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 8. In-Game ZIP Export

Players and developers can download the complete standalone game archive directly from the in-game menu by clicking **"Download Game (.ZIP)"** in the Pause Menu or Main Menu.
