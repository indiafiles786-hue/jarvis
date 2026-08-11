# SolveGenius — Setup Guide (Hindi + English steps)

Photo/text se NEET, JEE Advanced aur NCERT 11-12 questions solve karne wala app.
Purple-white premium theme, guest-only (no login).

---

## STEP 1 — Free Gemini API Key lo

1. Browser mein jao: https://aistudio.google.com/apikey
2. Apne Google account se sign in karo (koi cost nahi)
3. "Create API key" pe click karo
4. Jo key milegi (starts with `AIza...`) usko copy kar lo
5. Is folder mein `config.js` file kholo, aur `PASTE_YOUR_API_KEY_HERE` ki jagah apni key paste kardo:
   ```js
   export const GEMINI_API_KEY = "AIzaSy...tumhari-key...";
   ```
6. Save kardo. Bas, yehi sabse important step tha.

Free tier limits: ~10 requests/minute, ~250 requests/day — personal study ke liye kaafi hai.

---

## STEP 2 — Apne computer par tools install karo

(Ek baar ka setup hai)

1. **Node.js** install karo (agar pehle se nahi hai): https://nodejs.org (LTS version download karo)
2. Terminal/CMD kholo aur check karo:
   ```
   node -v
   npm -v
   ```
3. Expo CLI aur EAS CLI install karo:
   ```
   npm install -g eas-cli
   ```
4. Free Expo account banao: https://expo.dev/signup
5. Terminal mein login karo:
   ```
   eas login
   ```

---

## STEP 3 — Project setup karo

1. Is poore folder (`neetgenius`) ko apne computer mein kisi jagah rakho
2. Terminal mein us folder ke andar jao:
   ```
   cd path/to/neetgenius
   ```
3. Dependencies install karo:
   ```
   npm install
   ```
4. (Optional) App ko apne phone mein turant test karne ke liye — bina APK banaye:
   - Apne phone mein "Expo Go" app install karo (Play Store se, free)
   - Terminal mein likho: `npx expo start`
   - Jo QR code dikhega usko Expo Go app se scan karo — app turant chal jayegi phone mein

---

## STEP 4 — APK banao (permanent install ke liye)

1. Sabse pehle EAS build config banao:
   ```
   eas build:configure
   ```
   (Jab pooche "Which platforms" — Android select karo)

2. APK build command chalao:
   ```
   eas build -p android --profile preview
   ```
   - Ye command tumhara code Expo ke free cloud servers pe bhejegi aur wahan APK banayegi
   - 10-20 minute lag sakte hai (free tier queue ke hisaab se)
   - Terminal mein ek link milega jaha se build ka status dekh sakte ho

3. Build complete hone ke baad, terminal/website pe ek **download link** milega — waha se seedha APK download kar sakte ho

---

## STEP 5 — Phone mein install karo

1. Wo APK link apne phone mein kholo (link ko WhatsApp/email/browser se phone tak pahuncha do, ya seedha phone browser mein eas build link kholo)
2. APK download hoga
3. Install karte waqt Android "Unknown apps install" ki permission maangega — allow kardo (ye normal hai kyunki Play Store se nahi aa raha)
3. Install hone ke baad app open karo — "Continue as Guest" dabao aur seedha use shuru karo

---

## App kaise use karo

- Neeche camera icon se photo kheecho ya gallery se select karo (question ki photo)
- Ya seedha text box mein type karke poochho
- Send dabao — kuch second mein step-by-step solution aayega

---

## Agar kuch problem aaye

- "API error" dikhe → config.js mein key sahi se paste hui ya nahi check karo
- Build fail ho → `eas build -p android --profile preview` dobara chalao, error terminal mein dikhega
- Free daily limit khatam ho jaye → agle din reset ho jayegi (midnight UTC)
