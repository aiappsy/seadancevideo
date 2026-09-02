# 🎬 MaxMotion AI — Commercial Multi-Engine Video Platform

MaxMotion AI is a commercial-grade generative AI video studio and SaaS platform. It combines state-of-the-art multi-model video generation, an interactive studio workspace, multi-scene reel sequencing, an Artlist-inspired landing showcase, dynamic OpenGraph social sharing cards, and a native Model Context Protocol (MCP) server for Claude Desktop and Cursor.

---

## ⚡ Supported AI Video Engines

1. **Wan 2.1 (Alibaba 14B Cinema)** — Ultra-consistent cinematics, depth, lighting, and camera motions.
2. **Kling 1.5 Pro** — High-speed dynamic motion and complex human physics.
3. **Minimax Hailuo** — High-fidelity micro-expressions and photorealistic human characters.
4. **Seedance 2.0 (ByteDance)** — High-definition storyboard video rendering.
5. **Seedance 2 Mini** — Ultra-fast preview iterations with 50% lower compute cost.

---

## 🚀 Key Features

- **Multi-Engine BYOK (Bring Your Own Key):** Users can supply personal Fal.ai and MuAPI keys for \$0 platform fee generations.
- **AI Sound Effects & Ambience:** Automatic synchronization of cinematic foley and ambient audio (via Fal.ai MMAudio).
- **4K AI Video Upscaler:** 1-click enhancement upgrading 720p clips to broadcast-grade 1440p / 4K.
- **Multi-Scene Storyboard Sequencer (`/sequencer`):** Chain 2 to 8 clips into a continuous broadcast reel with reordering and timecode calculations.
- **Model Context Protocol (MCP) Server (`/api/mcp`):** Native JSON-RPC 2.0 server allowing Claude Desktop, Cursor, and ChatGPT to direct videos via natural language.
- **Dynamic Social Cards (`/api/og/[id]`):** Branded 1200x630 cards with active model pills, prompts, and play overlays for X/Twitter and Discord.
- **Monetization & Margins:** Stripe & PayPal integrations, dynamic credit pricing, and an in-app Profit & Margin Calculator (`/admin/calculator`).
- **GDPR & Compliance:** Article 17 account erasure, Article 20 data portability archive, and customizable cookie consent banner.

---

## 🛠️ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env.local`)
```env
# NextAuth & Core App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Database & Storage (Firebase Admin SDK)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# AI Master Keys (Optional: Can also be set in /admin/settings)
FAL_KEY=your_fal_ai_key
SEEDANCE_V2_API_KEY=your_muapi_key
OPENROUTER_API_KEY=your_openrouter_key

# Payment Gateways (Optional: Can also be set in /admin/settings)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Production Deployment to Google Cloud Run

This project includes a multi-stage Dockerfile and 1-click deployment scripts.

### Windows:
```cmd
deploy-cloudrun.bat
```

### macOS / Linux / Cloud Shell:
```bash
chmod +x deploy-cloudrun.sh
./deploy-cloudrun.sh
```

The scripts deploy to Google Cloud Run with:
- `min-instances=0` (scales to zero when idle = **\$0 standby cost**)
- `memory=2Gi`, `cpu=1`
- `port=8080`
- Compact ~150MB container footprint (Next.js standalone runner)

---

## ✳️ Model Context Protocol (MCP) Setup

Connect Claude Desktop to your live MaxMotion AI server by adding this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "maxmotion": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-domain.com/api/mcp?key=YOUR_MAXMOTION_API_KEY"
      ]
    }
  }
}
```

Generated API keys can be managed directly in **User Settings $\to$ Developer & MCP**.
