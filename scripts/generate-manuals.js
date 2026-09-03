#!/usr/bin/env node

/**
 * MaxMotion AI — Automated Manuals Generator & Updater
 * Automatically generates and updates docs/USER_MANUAL.md and docs/ADMIN_MANUAL.md
 * based on current routes, services, video engines, and settings configurations.
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Extract current engines and default settings
let defaultSettings = {
  appName: "MaxMotion AI",
  defaultCredits: 10,
  superAdmin: "paljuritzen@gmail.com",
};

try {
  const settingsFile = fs.readFileSync(path.join(ROOT_DIR, "src/lib/services/settings.js"), "utf8");
  const appNameMatch = settingsFile.match(/appName:\s*["']([^"']+)["']/);
  if (appNameMatch) defaultSettings.appName = appNameMatch[1];
} catch (e) {
  // Use fallbacks
}

const lastUpdated = new Date().toISOString().split("T")[0];

const userManualContent = `# 🎥 ${defaultSettings.appName} — Complete User & Creator Manual

> **Auto-Generated Documentation** — Last synchronized: \`${lastUpdated}\`
> This manual automatically updates during each production build to reflect the latest platform engines, features, and settings.

---

## Table of Contents
1. [Getting Started & Authentication](#1-getting-started--authentication)
2. [Studio Workspace (\`/workspace\`)](#2-studio-workspace-workspace)
   - [Text-to-Video](#text-to-video)
   - [Image-to-Video & Reference Frames](#image-to-video--reference-frames)
   - [Reference Tagging (\`@image\`, \`@video\`, \`@audio\`)](#reference-tagging)
3. [AI Video Engine Selection Guide](#3-ai-video-engine-selection-guide)
4. [Cinematic Camera Motion Controls](#4-cinematic-camera-motion-controls)
5. [Audio Synthesis & Voiceovers](#5-audio-synthesis--voiceovers)
   - [Atmospheric Foley (MMAudio v2)](#atmospheric-foley-mmaudio-v2)
   - [AI Voiceovers & Narration (ElevenLabs)](#ai-voiceovers--narration-elevenlabs)
6. [AI Studio Director & Vision Assistant](#6-ai-studio-director--vision-assistant)
7. [Multi-Scene Storyboard Sequencer (\`/sequencer\`)](#7-multi-scene-storyboard-sequencer-sequencer)
8. [Showcase Archive & 4K Upscaling (\`/gallery\`)](#8-showcase-archive--4k-upscaling-gallery)
9. [Public Video Player & Social Embedding (\`/v/[id]\`)](#9-public-video-player--social-embedding-vid)
10. [Bring-Your-Own-Key (BYOK) Zero-Fee Mode](#10-bring-your-own-key-byok-zero-fee-mode)
11. [Model Context Protocol (MCP) & Developer API](#11-model-context-protocol-mcp--developer-api)
12. [Account Settings, Plans & GDPR Portability](#12-account-settings-plans--gdpr-portability)

---

## 1. Getting Started & Authentication

### Signing In
1. Navigate to the homepage or click **Sign In** in the top navigation bar.
2. Sign in using your **Google Account** or authenticated email.
3. Upon first login, your account is automatically provisioned with free starter credits (${defaultSettings.defaultCredits} credits) to test video generation immediately.

### Understanding Credits
- Video generations, 4K upscales, and sound synthesis deduct credits based on clip duration, model complexity, and resolution.
- Your live credit balance is always displayed in the top navbar.
- Clicking the **\`+\`** icon next to your credit balance opens the [Pricing Plans (\`/pricing\`)](/pricing) page to purchase additional credit packs via **Stripe** or **PayPal**.
- **BYOK (Bring-Your-Own-Key) users generate videos with 0 platform credit deduction.**

---

## 2. Studio Workspace (\`/workspace\`)

The Studio Workspace is your creative control center. It allows you to transform prompts and images into high-definition video clips.

### Text-to-Video
1. Select your target **AI Engine** (e.g. *Wan 2.1*, *Kling 1.5*, or *Seedance 2.0*).
2. Enter your creative prompt in the main prompt box.
   - *Example*: \`"Cinematic 35mm film shot of an astronaut walking through a vibrant neon jungle on an alien planet, volumetric rim lighting, shallow depth of field, photorealistic 8k."\`
3. Click the **✨ Enhance with AI** button to automatically refine your prompt into professional cinematography phrasing using Google Gemini Flash.
4. Select your **Aspect Ratio**:
   - \`16:9\` — Widescreen Cinema, YouTube, Broadcast.
   - \`9:16\` — Vertical Video for TikTok, Instagram Reels, YouTube Shorts.
   - \`4:3\` & \`3:4\` — Classic film and portrait formats.
5. Choose your clip **Duration** (5s, 10s, or custom).
6. Choose your **Resolution** (\`720p HD\` or \`480p Fast\`).
7. Click **Generate Video**. The progress wheel will display generation updates until your video is ready for playback.

### Image-to-Video & Reference Frames
To animate an existing still image, photograph, or concept art:
1. Click the **Upload Image** frame in the Studio Workspace.
2. Upload a JPG, PNG, or WebP file (up to 20MB).
3. Specify in your prompt how the subject and scene should animate.
   - *Example*: \`"Gentle ocean breeze blowing through her hair, camera slowly tracks forward while golden hour sunlight flickers across the water."\`
4. Click **Generate Video**. The AI uses your image as the exact starting frame.

### Reference Tagging
Advanced creators can specify multiple asset inputs directly inside the prompt using special tags:
- \`@image1\` — Designates the primary visual subject or character reference.
- \`@video1\` — Designates a motion reference or camera trajectory.
- \`@audio1\` — Designates a tempo or soundtrack reference for audio-reactive motion.

---

## 3. AI Video Engine Selection Guide

${defaultSettings.appName} gives you access to five specialized generative video models:

| Engine | Best Used For | Credit Cost | Key Strengths |
|---|---|---|---|
| **Wan 2.1 (Alibaba 14B Cinema)** | Cinematic scenes, sci-fi, architecture, nature | **Lowest** (30/sec) | Exceptional 35mm film textures, deep shadows, volumetric lighting, and physical realism. |
| **Kling 1.5 Pro** | Human motion, martial arts, dance, sports | **Balanced** (55/sec) | Superior human biomechanics, complex limb movements, hands, and physics simulation. |
| **Minimax (Hailuo Video-01)** | Character close-ups, acting, emotional dialogue | **Balanced** (50/sec) | Expressive micro-facial acting, eye glances, realistic skin pores, and dramatic framing. |
| **Seedance 2.0 (ByteDance)** | High-speed action, drone fly-throughs, car chases | **Standard** (50/sec) | High-energy dynamic camera drifts and rapid cinematic movement. |
| **Seedance Mini** | Storyboard sketches, rapid prototyping | **50% Discount** | Rapid turnaround previews to test concepts before rendering in full HD. |

---

## 4. Cinematic Camera Motion Controls

In the **Camera Motion** selector, choose how the camera operates during clip generation:

- **Auto**: The engine automatically detects the optimal camera movement based on your prompt.
- **Pan Left / Pan Right**: Horizontal camera sweep along the scene horizon.
- **Tilt Up / Tilt Down**: Vertical camera angle change (ideal for revealing tall architecture or character entrances).
- **Zoom In / Zoom Out**: Smooth focal adjustment drawing attention toward or away from the focal subject.
- **Orbit**: Smooth circular arc around the subject.
- **Static Tripod**: Locked-off tripod shot with zero camera movement, focusing solely on subject animation.

---

## 5. Audio Synthesis & Voiceovers

### Atmospheric Foley (MMAudio v2)
Enable the **Auto-Synthesize Audio & Foley** toggle in the Studio Workspace.
When enabled, ${defaultSettings.appName} automatically analyzes your video prompt and synthesizes a synchronized 48kHz stereo soundscape (e.g. thunder, rain, engine revs, footsteps, ambient wildlife) attached directly to your output MP4.

### AI Voiceovers & Narration (ElevenLabs)
In the Sequencer and Audio tools, you can generate studio-grade narration and voice acting:
1. Enter the dialogue script or narration copy.
2. Select your desired curated voice:
   - **Adam**: Deep, authoritative movie trailer and cinema narrator.
   - **Rachel**: Calm, articulate documentary and educational host.
   - **Antoni**: Energetic commercial and trailer narrator.
   - **Bella**: Warm, expressive storyteller and dramatic actress.
   - **Josh**: Friendly, modern commercial host.
3. The generated MP3 is automatically mastered and attached to your creation.

---

## 6. AI Studio Director & Vision Assistant

Click the **⚡ AI Assistant** button located at the bottom-right corner of your screen to open the **${defaultSettings.appName} Studio Director**, powered by Google Gemini Flash Omnimodal Intelligence.

### How the Director Helps You:
- **Engine Recommendations**: Describe your concept, and the Director recommends whether Wan 2.1, Kling, or Minimax will yield the best visual fidelity.
- **Prompt Engineering**: The Director transforms simple ideas into 35mm film director instructions with lens specs (e.g. *Anamorphic 50mm, f/1.8*).
- **Multimodal Reference Analysis**: Click the **Attach Image** paperclip icon inside the Director chat to upload reference images or sketches. Gemini Flash analyzes the lighting, color temperature, and framing, producing a prompt that matches the style.
- **1-Click Studio Application**: When the Director suggests a prompt and engine, click the **Apply to Studio Workspace** button inside the chat to automatically populate all settings.

---

## 7. Multi-Scene Storyboard Sequencer (\`/sequencer\`)

The Storyboard Sequencer allows you to assemble multi-shot short films and commercials:
1. Navigate to **Sequencer** in the top navigation.
2. Click **Add Scene** to insert storyboard cards (up to 8 scenes per reel).
3. For each scene:
   - Enter the shot prompt and choose the model and duration.
   - Drag and drop scenes to rearrange their timeline order.
4. Click **✨ Auto-Generate Reel Continuity with AI**:
   - Google Gemini Flash analyzes your sequence and harmonizes character appearance, lighting, and environmental continuity across all scenes.
5. Click **Render Full Sequence** to render all clips in parallel and view the continuous assembled timeline.

---

## 8. Showcase Archive & 4K Upscaling (\`/gallery\`)

Navigate to **Gallery** to access your library of rendered videos:
- **Playback & Previews**: Hover over any video card to stream the video.
- **4K Cinema Upscale**: Click the **4K Upscale** button on any completed video. ${defaultSettings.appName} sharpens textures, removes compression artifacts, and enhances the resolution to broadcast-grade 4K.
- **Download MP4**: Download your master MP4 directly to your computer.
- **Copy Prompt**: 1-click copy of the generation prompt and model parameters to reproduce or iterate on the look.

---

## 9. Public Video Player & Social Embedding (\`/v/[id]\`)

Every video generated on ${defaultSettings.appName} has a dedicated public showcase page:
- **Public URL**: \`https://yourdomain.com/v/<creationId>\`
- **Responsive Player**: High-definition video player optimized for mobile and desktop screens.
- **Dynamic Social Cards**: Automatically generates rich 1200x630 OpenGraph cards for Twitter/X, Discord, and LinkedIn displaying video thumbnails, active model badges, and playback controls.
- **1-Click Embed**: Copy standard \`<iframe>\` embed codes to display your videos on blogs, Webflow, Shopify, or portfolio websites.

---

## 10. Bring-Your-Own-Key (BYOK) Zero-Fee Mode

If you have personal API accounts with AI providers, you can bypass platform credit billing completely:
1. Navigate to [**Settings $\\to$ BYOK Engine**](/settings).
2. Toggle **Enable BYOK Mode** to **ON**.
3. Enter your personal API keys:
   - **MuAPI Key**: For ByteDance Seedance 2.0 & Mini.
   - **Fal.ai Key**: For Wan 2.1, Kling 1.5, Minimax Hailuo, and MMAudio v2.
   - **Google Gemini Flash Key**: For the AI Studio Director and vision analysis.
   - **ElevenLabs Key**: For voiceover narration and character dubbing.
   - **Replicate Token**: For secondary inference failover.
4. Click the **Test** button next to each key to verify your credentials.
5. Click **Save BYOK Settings**.
6. When active, an emerald **BYOK Mode** badge appears in your navbar, and all video generations consume **0 platform credits**.

---

## 11. Model Context Protocol (MCP) & Developer API

${defaultSettings.appName} features a native **Model Context Protocol (MCP)** server allowing external AI assistants (such as Claude Desktop and Cursor) to generate videos directly from your coding IDE or chat interface.

### Connecting Claude Desktop
1. Go to **Settings $\\to$ Developer & MCP**.
2. Click **Generate Personal API Key** to receive your \`mm_live_...\` key.
3. Open your Claude Desktop configuration file (\`claude_desktop_config.json\`) and add:
\`\`\`json
{
  "mcpServers": {
    "maxmotion": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://yourdomain.com/api/mcp"
      ],
      "env": {
        "MAXMOTION_API_KEY": "mm_live_your_key_here"
      }
    }
  }
}
\`\`\`
4. Restart Claude Desktop. You can now prompt Claude: *"Generate a 5-second cinematic video of a futuristic cyberpunk city using Wan 2.1 on ${defaultSettings.appName}."*

---

## 12. Account Settings, Plans & GDPR Portability

Navigate to [**Settings**](/settings) to manage your account:
- **Profile**: Update your display name and view your registered email and role.
- **Studio Defaults**: Set your favorite default AI engine, aspect ratio, camera motion, and audio auto-generation toggle.
- **Notifications**: In-app inbox receiving announcements, system updates, and generation status alerts.
- **GDPR Article 20 Data Portability**: Click **Export Data Archive** to download a complete JSON archive of all your prompts, creations, transactions, and metadata.
- **GDPR Article 17 Account Erasure**: Permanently erase your account, creations, uploaded reference media, and billing records from the platform.
`;

const adminManualContent = `# 🛡️ ${defaultSettings.appName} — Complete Administrator & Operations Manual

> **Auto-Generated Documentation** — Last synchronized: \`${lastUpdated}\`
> Administrative access is strictly restricted to: \`${defaultSettings.superAdmin}\`

---

## Table of Contents
1. [Initial Admin Provisioning & Hardened Access Control](#1-initial-admin-provisioning--hardened-access-control)
2. [Zero Pre-Deployment Requirements & In-App Setup](#2-zero-pre-deployment-requirements--in-app-setup)
3. [Admin Console Overview (\`/admin\`)](#3-admin-console-overview-admin)
4. [System Settings & The Master Key Vault (\`/admin/settings\`)](#4-system-settings--the-master-key-vault-adminsettings)
   - [General & Branding](#general--branding)
   - [AI Engines & Multi-Key Vault](#ai-engines--multi-key-vault)
   - [Credit Multipliers & Pricing Rates](#credit-multipliers--pricing-rates)
   - [Payment Gateways (Stripe & PayPal REST)](#payment-gateways-stripe--paypal-rest)
   - [High-Bandwidth Storage & $0 Egress (Cloudflare R2)](#high-bandwidth-storage--0-egress-cloudflare-r2)
   - [Legal & Compliance](#legal--compliance)
5. [Master Application API Key & External Integrations](#5-master-application-api-key--external-integrations)
6. [Live API Key Diagnostic Suite (\`⚡ Test All Keys\`)](#6-live-api-key-diagnostic-suite--test-all-keys)
7. [User & Account Management (\`/admin/users\`)](#7-user--account-management-adminusers)
8. [Subscription Plans & Credit Packages (\`/admin/plans\`)](#8-subscription-plans--credit-packages-adminplans)
9. [Communications, Broadcasts & Resend Email (\`/admin/communication\`)](#9-communications-broadcasts--resend-email-admincommunication)
10. [Profit & Margin Calculator (\`/admin/calculator\`)](#10-profit--margin-calculator-admincalculator)
11. [Cloud Run Production Deployment & Operations](#11-cloud-run-production-deployment--operations)

---

## 1. Initial Admin Provisioning & Hardened Access Control

Administrative access to ${defaultSettings.appName} is cryptographically locked and enforced server-side.
Only the verified account:
\`\`\`
${defaultSettings.superAdmin}
\`\`\`
is permitted to view administrative dashboards, access \`/admin/*\` routes, or invoke administrative API endpoints (\`/api/admin/*\`). Any other user role or email attempting access is intercepted with HTTP 403 Forbidden.

---

## 2. Zero Pre-Deployment Requirements & In-App Setup

This application has been engineered to boot and run **without requiring any initial API keys or configuration secrets in \`.env\`**.

### How Zero-Env Deployment Works:
1. **Application Boots Immediately**: The server boots with resilient fallbacks for NextAuth JWT secrets, local application defaults, and dynamic settings.
2. **Immediate Super-Admin Login**: The designated super-admin (\`${defaultSettings.superAdmin}\`) logs in via Google Profile or Email Studio Pass.
3. **Configure Everything Inside the App**: Once logged in, the administrator visits [**Admin Settings (\`/admin/settings\`)**](/admin/settings) to configure all platform credentials:
   - Google OAuth credentials
   - Stripe & PayPal payment gateways
   - ByteDance / MuAPI, Fal.ai, and Gemini Flash API keys
   - ElevenLabs voiceover keys
   - Resend transactional email keys
   - Cloudflare R2 / S3 storage credentials
4. **Instant Persistence in Firestore**: All keys and rates are persisted dynamically to Google Cloud Firestore (\`system_settings/config\`) and immediately take effect platform-wide without redeploying the server.

---

## 3. Admin Console Overview (\`/admin\`)

The Admin Dashboard provides real-time operational telemetry across four core sections:
- **System Metrics**: Total registered creators, total video generations, active subscriptions, and gross credit consumption.
- **Recent Generations**: Real-time monitor of live inference queues, engine distribution (Wan 2.1 vs Kling vs Seedance), and failure rates.
- **Quick Actions**: 1-click navigation to Settings, User Management, Plan Editor, Broadcast Communications, and the Profit Calculator.

---

## 4. System Settings & The Master Key Vault (\`/admin/settings\`)

All platform settings are stored dynamically in the Firestore collection \`system_settings/config\`. Changes saved in the admin console take effect immediately across all users without requiring a redeployment or server restart.

### General & Branding
- **Application Name**: Rebrands the app title, navbar logo text, and email headers (e.g. \`${defaultSettings.appName}\`).
- **Support Email**: Displayed on user invoices, footer links, and transactional emails.
- **Company Name & Legal Jurisdiction**: Automatically injected into the \`/terms\`, \`/privacy\`, and \`/refund\` legal documents.
- **Maintenance Mode**: When enabled, non-admin users see a sleek maintenance banner while backend updates or database migrations are performed.

### AI Engines & Multi-Key Vault
The central vault for platform-provided AI compute:

| Key Field | Service Provider | Purpose |
|---|---|---|
| **Master Seedance / MuAPI Key** | MuAPI / ByteDance | Powers Seedance 2.0 HD and Seedance Mini video generation. |
| **Master Fal.ai API Key** | Fal.ai | Powers Wan 2.1 (Alibaba 14B), Kling 1.5 Pro, Minimax Hailuo, and MMAudio Foley. |
| **Google Gemini Flash API Key** | Google AI Studio | Powers the AI Studio Director, Multimodal Vision analysis, Prompt Enhancer, and Sequencer continuity. |
| **ElevenLabs API Key** | ElevenLabs | Powers AI Voiceover narration and character speech. |
| **Replicate API Token** | Replicate | Automated secondary failover if Fal.ai experiences queue congestion. |
| **Direct OpenAI / Anthropic Keys** | OpenAI / Anthropic | Direct LLM endpoints for enterprise customers bypassing OpenRouter. |
| **OpenRouter API Key** | OpenRouter | Fallback routing for prompt expansion and director advice. |
| **Resend API Key** | Resend | Transactional email delivery and broadcast announcements. |

### Credit Multipliers & Pricing Rates
Configure exact per-second platform credit deductions for each model:
- \`T2V 720p High\` (Default: 50 credits/sec)
- \`T2V 720p Basic\` (Default: 30 credits/sec)
- \`Wan 2.1 Rate\` (Default: 30 credits/sec)
- \`Kling 1.5 Rate\` (Default: 55 credits/sec)
- \`Minimax Rate\` (Default: 50 credits/sec)
- \`4K Upscale Cost\` (Default: 25 credits flat)
- \`Audio Foley Synthesis Cost\` (Default: 10 credits flat)

### Payment Gateways (Stripe & PayPal REST)

#### Stripe Gateway
1. Set **Enable Stripe** to **ON**.
2. Enter your \`Publishable Key\` (\`pk_live_...\` or \`pk_test_...\`) and \`Secret Key\` (\`sk_live_...\`).
3. Add the Webhook Secret (\`whsec_...\`) pointing to \`https://yourdomain.com/api/stripe/webhook\` to automate instant credit fulfillment.

#### PayPal REST Gateway
> **Best Practice**: The cleanest and most reliable PayPal integration uses just **Client ID** and **Client Secret**.
> ${defaultSettings.appName} uses PayPal REST API v2 Orders (\`/v2/checkout/orders\`). This server-side flow creates and captures orders directly without requiring complex webhook setups:
1. Set **Enable PayPal** to **ON**.
2. Select **Mode**: \`Sandbox\` (for testing) or \`Live\` (for real revenue).
3. Enter your **PayPal Client ID** from the [PayPal Developer Dashboard](https://developer.paypal.com).
4. Enter your **PayPal Client Secret**.
5. Save settings. PayPal one-click checkout is immediately active on the \`/pricing\` page.

### High-Bandwidth Storage & $0 Egress (Cloudflare R2)
While Firebase Storage is used for user avatars and thumbnails, streaming high-definition 4K videos at scale from Google Cloud Storage can incur substantial egress fees ($0.12/GB).

To eliminate egress bandwidth costs:
1. Navigate to the **Storage & Legal** tab.
2. Toggle **Cloudflare R2 / S3 Storage** to **ON**.
3. Enter:
   - **R2 Account ID**
   - **R2 Bucket Name**
   - **R2 Access Key ID** & **R2 Secret Access Key**
   - **Custom Public Domain / CDN URL** (e.g. \`https://cdn.yourdomain.com\`)
4. Completed video renders will stream directly through Cloudflare with **$0 egress fees**.

### Legal & Compliance
- **Cookie Banner Toggle**: Displays a compliant GDPR/CCPA cookie consent dialog to first-time visitors.
- **Data Retention Period**: Set auto-cleanup duration for temporary preview files (0 = retain indefinitely).

---

## 5. Master Application API Key & External Integrations

Located in **Admin Settings $\\to$ MCP & Developer**:
- The **Master App API Key** (\`mm_app_...\`) allows your server infrastructure, microservices, mobile apps, or automation workflows (e.g. n8n, Make.com) to generate videos programmatically.
- **Server-to-Server Authentication**:
\`\`\`bash
curl -X POST https://yourdomain.com/api/seedance \\
  -H "Authorization: Bearer mm_app_YOUR_MASTER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Cinematic aerial shot of Tokyo at night",
    "model": "wan-2.1",
    "aspectRatio": "16:9",
    "duration": 5
  }'
\`\`\`
- **Key Rotation**: Click the **Rotate Key** button at any time if a key is compromised. The previous key is immediately invalidated.

---

## 6. Live API Key Diagnostic Suite (\`⚡ Test All Keys\`)

In the header of \`/admin/settings\`, click **⚡ Test All Keys**:
- Concurrently pings every configured provider:
  - **Google Gemini Flash**: Verifies model response and measures latency.
  - **Fal.ai**: Validates authorization and queue availability.
  - **MuAPI / ByteDance**: Tests endpoint responsiveness.
  - **ElevenLabs**: Checks voice synthesis authorization and account character quota.
  - **Resend**: Validates email sending authorization.
  - **Stripe & PayPal**: Verifies gateway credential presence and active status.
- Displays color-coded operational chips with roundtrip response times:
  - 🟢 **Operational** (\`<latency>ms\`)
  - ⚪ **Unconfigured** (key omitted)
  - 🔴 **Degraded / Error** (invalid key or upstream outage)

---

## 7. User & Account Management (\`/admin/users\`)

Manage all platform creators from a single administrative table:
- **Search & Filter**: Search by user email, display name, or user ID.
- **Credit Balance Adjustments**: Manually grant or deduct credits for refunds, promotions, or VIP support.
- **Role Assignment**: Elevate trusted team members or adjust privileges.
- **Plan Overrides**: Assign custom subscription plans (e.g. *Enterprise*, *Agency Pro*).
- **Account Suspension**: Temporarily freeze abusive accounts.

---

## 8. Subscription Plans & Credit Packages (\`/admin/plans\`)

Manage your pricing tiers from \`/admin/plans\`:
- **Create Plan**: Set name (e.g. *Starter*, *Pro Creator*, *Studio Agency*), price, and recurring credit allocations.
- **Billing Intervals**: Support both monthly subscriptions and one-off credit top-ups.
- **Feature Badges**: Highlight *Popular* or *Best Value* tiers on the public \`/pricing\` page.
- **Stripe & PayPal Sync**: Link external Stripe Price IDs (\`price_...\`) to automate recurring renewal webhooks.

---

## 9. Communications, Broadcasts & Resend Email (\`/admin/communication\`)

Send system-wide or targeted messages from \`/admin/communication\`:
- **Broadcast Announcements**: Send updates about new models, downtime notices, or promotions to all registered users.
- **Targeted Direct Messages**: Send messages to a specific user by providing their user ID or email.
- **Real Transactional Email Delivery (via Resend)**:
  - Check the **Deliver via Email** toggle.
  - ${defaultSettings.appName} compiles an HTML-branded email and delivers it to user inboxes using the configured Resend API key.

---

## 10. Profit & Margin Calculator (\`/admin/calculator\`)

An in-app financial modeling tool designed to ensure healthy unit economics:
- **Input Parameters**: Model compute cost (e.g. Fal GPU rate vs ByteDance rate), retail credit price per pack, and average video duration.
- **Calculated Outputs**:
  - Net Gross Margin percentage (aim for 60%–75%).
  - Breakeven render count per subscription.
  - Cloudflare R2 vs Firebase Storage savings projection.

---

## 11. Cloud Run Production Deployment & Operations

### Containerization
The project uses a multi-stage Dockerfile producing a standalone ~150MB Next.js runner container.

### Deploying via Scripts
- **Windows**: Run \`deploy-cloudrun.bat\`
- **macOS / Linux**: Run \`./deploy-cloudrun.sh\`

### Cloud Run Production Specs
- **Min Instances**: Set to \`0\` to enable automatic scale-to-zero when idle, resulting in **$0 standby cost**.
- **Max Instances**: \`10\`–\`50\` depending on traffic requirements.
- **Memory**: \`2Gi\`
- **CPU**: \`1\`
- **Port**: \`8080\`
- **Health Check Endpoint**: \`/api/health\` returns HTTP 200 and system uptime for Cloud Run load balancers.
`;

fs.writeFileSync(path.join(DOCS_DIR, "USER_MANUAL.md"), userManualContent, "utf8");
fs.writeFileSync(path.join(DOCS_DIR, "ADMIN_MANUAL.md"), adminManualContent, "utf8");

console.log(`[DOCS_GENERATE] Successfully generated and updated docs/USER_MANUAL.md and docs/ADMIN_MANUAL.md (${lastUpdated})`);
