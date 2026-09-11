# KAVACH-AURA — TENSOR Welfare Intelligence & WHOOP BLE

> **Ethical Military Welfare Intelligence, Non-Punitive Tactical Rotation, Real-Time WHOOP 4.0 BLE GATT Stream, Google Gemini AI Co-Pilot & 365-Day Annual Roster Heatmap**

[![Zero-PII Privacy](https://img.shields.io/badge/Privacy-Zero--PII%20Boundary-078c66?style=for-the-badge&logo=shield)](https://github.com/)
[![Web Bluetooth](https://img.shields.io/badge/Bluetooth-GATT%200x180D%20%2F%200x2A37-0284c7?style=for-the-badge&logo=bluetooth)](https://github.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203.6%20Flash-f59e0b?style=for-the-badge&logo=google)](https://github.com/)
[![Three.js & GSAP](https://img.shields.io/badge/3D%20Engine-Three.js%20%2B%20GSAP-be123c?style=for-the-badge&logo=three.js)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**KAVACH-AURA** is a zero-PII military welfare intelligence dashboard and confidential clinical recovery ecosystem. Built to support uniformed service personnel, it balances high-readiness unit monitoring for commanding welfare officers with strictly confidential, self-reflection vitals for individual personnel (jawans).

Biometric telemetry never crosses into disciplinary appraisal records. All predictions serve as prompts for voluntary care, tactical rest windows, and circadian alignment.

---

## 🎯 Complete Feature Checklist (All Working Features)

### 1. Dual Role Architecture (Zero-PII Boundary)
- **Command & Welfare Intelligence View:** Anonymized cohort metrics, unit readiness index, 7-day fatigue trajectory, explainable AI vectors, and non-punitive intervention queue.
- **My Confidential Self-Care (Jawan View):** Completely private to the individual device; displays personal WHOOP telemetry, HRV recovery, sleep debt, and local micro-checks. Never accessible by command.

### 2. Physical & Virtual WHOOP 4.0 Bluetooth GATT Subsystem
- **Targeted Hardware Pairing:** Dedicated pairing for `WHOOP 5B00348148` (and prefix matching `WHOOP*`) using the standard Web Bluetooth API.
- **Real-Time GATT Telemetry:** Subscribes to GATT Service `0x180D` (Heart Rate) and Characteristic `0x2A37` (Heart Rate Measurement & RR Intervals), plus `0x180F` (Battery Level).
- **Fallback 1Hz Stream:** Continuous 1-second packet generator simulating live sympathetic/parasympathetic biometric variation when hardware is disconnected.
- **Live Packet Console:** Timestamped hexadecimal packet inspection log (`[0x00 0x44] -> 68 BPM (RR: 882ms)`).
- **Biometric Preset Injections:** One-click simulation for:
  - 🟢 Resting State (64 BPM, HRV 58ms)
  - 🟡 Patrol Strain (128 BPM, HRV 36ms)
  - 🔴 Fatigue Alert (96 BPM, HRV 24ms)

### 3. Google Gemini Welfare AI Co-Pilot
- **Integrated Drawer & FAB:** Slide-out assistant drawer with direct API integration to `gemini-3.6-flash`.
- **Live Telemetry Ingestion:** One-click button (`Run Live WHOOP Analysis`) feeds active heart rate, HRV, sleep debt, and strain into Gemini for clinical evaluation.
- **Quick Action Chips:** Pre-built prompts for 365-day fatigue trends, tactical duty rotations, HRV recovery protocols, and night perimeter circadian resets.
- **Offline Fallback Engine:** If the network or API key is unavailable, a high-utility local rule-based clinical engine provides immediate tactical guidance.
- **Key Manager Modal:** Store and update custom Gemini API keys in browser `localStorage`.

### 4. 365-Day Annual Welfare, Roster & Strain Calendar
- **Complete 12-Month Heatmap:** Renders all 365 days of 2026 across 12 monthly grid cards.
- **Cohort Health Categorization:**
  - 🟢 Optimal (228 days)
  - 🟡 Moderate Strain (58 days)
  - 🔴 Elevated Alert (14 days, e.g., peak monsoon perimeter windows)
  - 🔵 Approved Leave / Rest Windows (65 days)
- **Interactive Day Inspector:** Click any date tile to view specific daily strain scores, resting HRV baselines, and rotation guidance.
- **Fast Filter Buttons:** Filter by "All 365 Days", "Strain Alerts Only", or "Leave Windows".

### 5. Confidential Helplines & Custom Contact Connect
- **Direct Dialing (`tel:`):**
  - 📞 **Tele-MANAS Toll-Free:** `14416` (Alt: `1800-891-4416`) — 24/7 National Mental Health Line
  - 🛡️ **Armed Forces Kavach Desk:** `1904` — Direct Unit Welfare Officer Desk
  - 🩺 **KIRAN Mental Health Helpline:** `1800-599-0019` — Govt of India 24/7 Toll-Free Psychological First Aid
  - 🤝 **Vandrevala Foundation:** `+91 9999 666 555` — 24/7 Multi-lingual Peer Support
  - 🚨 **Duty Medical Officer:** `112` — Immediate Tactical Relief Dispatch
- **Custom Contact Manager:**
  - **"+ Add Number to Connect"** card & modal input.
  - Enter any custom number (buddy, base doctor, counselor, chaplain, or family).
  - Saved to `localStorage` and dynamically added to the dashboard grid and call selector with a 1-tap dial button.

### 6. 3D Visualizations & Micro-Interactions
- **Unit Resilience Trajectory:** Shaded 7-day dual-vector polyline graph comparing fatigue signals with tactical workloads.
- **3D Segmented Doughnut Chart:** Segmented into Low Risk (71%), Moderate Strain (23%), and Elevated Risk (6%). Click to separate and extrude the 78% cohort segment forward in 3D (`translateZ: 30px`).
- **Kinetic EKG Strip:** Infinitely scrolling SVG sinus rhythm that dynamically morphs into real-time BPM near center-screen. Hover to induce vibration noise; click to simulate an acute cardiac event that decays back to sinus rhythm.
- **Voluntary Micro-Check 3D Board:** Mouse-tracking isometric wobble (`rotateX`, `rotateY`). Sliders translate on Z-depth with blurred drop-shadows; numbers spin 360° on value change. Calculation button physically depresses (`translateZ: -5px`) and morphs into a spinning 3D wellness badge.
- **4-Metric Deck Unfold:** Switch between a 4-column layout and a stacked deck with 180° X-axis tumbling animations.

### 7. Tactical 4-4-4-4 Box Breathing Regulator
- **Visual Breathing Orb:** Interactive pulsing orb guiding Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s).
- **Web Audio API Chimes:** Integrated oscillator synthesizer emitting calming frequency chimes (440Hz, 550Hz, 370Hz, 660Hz) at each phase transition.
- **Timer & Progress Bar:** 2-minute session countdown with auto-reset and phase indicator pills.

---

## 📂 Repository File Structure

```text
├── index.html                   # Complete standalone single-page application
├── package.json                 # Project configuration & start scripts
├── .gitignore                   # Ignored files for clean Git tracking
├── LICENSE                      # Open-source MIT License
├── README.md                    # Project documentation & GitHub guide
└── components/
    ├── Tensor3DVisualizations.jsx # Modular React Three Fiber 3D visual components
    └── package.json             # R3F dependencies (Three.js, GSAP, Drei)
```

---

## 🚀 Quick Start Guide

### Option A: Using Python (Zero Setup)
Clone the repository and launch Python's built-in HTTP server:
```bash
# Clone repository
git clone https://github.com/your-username/kavach-aura-tensor.git
cd kavach-aura-tensor

# Start local server on port 8000
python -m http.server 8000
```
Open **[http://localhost:8000/index.html](http://localhost:8000/index.html)** in Google Chrome or Microsoft Edge.

---

### Option B: Using Node.js / NPM
```bash
# Install serve globally or run with npx
npm install -g serve
serve -l 8000 .
```
Open **[http://localhost:8000/index.html](http://localhost:8000/index.html)**.

---

## 🌐 Deploy to GitHub Pages (Free & Instant)

1. Push this repository to GitHub.
2. Navigate to your GitHub repository: **Settings &rarr; Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Your application will be live at:
   `https://<your-username>.github.io/<repository-name>/index.html`

> **Note on Web Bluetooth:** Web Bluetooth strictly requires a Secure Origin (`https://` or `http://localhost`). Both GitHub Pages (`https://`) and `http://localhost:8000` satisfy this requirement out of the box!

---

## 🛠️ Step-by-Step Commands to Push to GitHub

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit files
git commit -m "Initial commit: KAVACH-AURA Welfare Intelligence dashboard"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub remote repository (replace with your repository URL)
git remote add origin https://github.com/<your-username>/kavach-aura-tensor.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 🔒 Privacy & Dignity Guarantee

- **k-Anonymity Threshold:** Minimum cohort size of 5 for commander reports.
- **Differential Privacy:** Zero individual biometric records transmitted upstream.
- **Non-Punitive Mandate:** Every welfare trigger prompts supportive relief windows, never disciplinary action or performance demotions.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
