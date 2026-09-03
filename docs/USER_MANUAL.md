# 🎥 MaxMotion AI — Complete User & Creator Manual

Welcome to **MaxMotion AI**, the next-generation commercial AI video creation studio. MaxMotion AI empowers filmmakers, content creators, marketing agencies, and visual artists to generate cinema-grade videos using five industry-leading generative video engines, synthesized atmospheric foley, lifelike voiceovers, 4K upscaling, and multi-scene storyboard sequencing.

---

## Table of Contents
1. [Getting Started & Authentication](#1-getting-started--authentication)
2. [Studio Workspace (`/workspace`)](#2-studio-workspace-workspace)
   - [Text-to-Video](#text-to-video)
   - [Image-to-Video & Reference Frames](#image-to-video--reference-frames)
   - [Reference Tagging (`@image`, `@video`, `@audio`)](#reference-tagging)
3. [AI Video Engine Selection Guide](#3-ai-video-engine-selection-guide)
4. [Cinematic Camera Motion Controls](#4-cinematic-camera-motion-controls)
5. [Audio Synthesis & Voiceovers](#5-audio-synthesis--voiceovers)
   - [Atmospheric Foley (MMAudio v2)](#atmospheric-foley-mmaudio-v2)
   - [AI Voiceovers & Narration (ElevenLabs)](#ai-voiceovers--narration-elevenlabs)
6. [AI Studio Director & Vision Assistant](#6-ai-studio-director--vision-assistant)
7. [Multi-Scene Storyboard Sequencer (`/sequencer`)](#7-multi-scene-storyboard-sequencer-sequencer)
8. [Showcase Archive & 4K Upscaling (`/gallery`)](#8-showcase-archive--4k-upscaling-gallery)
9. [Public Video Player & Social Embedding (`/v/[id]`)](#9-public-video-player--social-embedding-vid)
10. [Bring-Your-Own-Key (BYOK) Zero-Fee Mode](#10-bring-your-own-key-byok-zero-fee-mode)
11. [Model Context Protocol (MCP) & Developer API](#11-model-context-protocol-mcp--developer-api)
12. [Account Settings, Plans & GDPR Portability](#12-account-settings-plans--gdpr-portability)

---

## 1. Getting Started & Authentication

### Signing In
1. Navigate to the homepage or click **Sign In** in the top navigation bar.
2. Sign in using your **Google Account** or authenticated email.
3. Upon first login, your account is automatically provisioned with free starter credits to test video generation immediately.

### Understanding Credits
- Video generations, 4K upscales, and sound synthesis deduct credits based on clip duration, model complexity, and resolution.
- Your live credit balance is always displayed in the top navbar.
- Clicking the **`+`** icon next to your credit balance opens the [Pricing Plans (`/pricing`)](/pricing) page to purchase additional credit packs via **Stripe** or **PayPal**.
- **BYOK (Bring-Your-Own-Key) users generate videos with 0 platform credit deduction.**

---

## 2. Studio Workspace (`/workspace`)

The Studio Workspace is your creative control center. It allows you to transform prompts and images into high-definition video clips.

### Text-to-Video
1. Select your target **AI Engine** (e.g. *Wan 2.1*, *Kling 1.5*, or *Seedance 2.0*).
2. Enter your creative prompt in the main prompt box.
   - *Example*: `"Cinematic 35mm film shot of an astronaut walking through a vibrant neon jungle on an alien planet, volumetric rim lighting, shallow depth of field, photorealistic 8k."`
3. Click the **✨ Enhance with AI** button to automatically refine your prompt into professional cinematography phrasing using Google Gemini Flash.
4. Select your **Aspect Ratio**:
   - `16:9` — Widescreen Cinema, YouTube, Broadcast.
   - `9:16` — Vertical Video for TikTok, Instagram Reels, YouTube Shorts.
   - `4:3` & `3:4` — Classic film and portrait formats.
5. Choose your clip **Duration** (5s, 10s, or custom).
6. Choose your **Resolution** (`720p HD` or `480p Fast`).
7. Click **Generate Video**. The progress wheel will display generation updates until your video is ready for playback.

### Image-to-Video & Reference Frames
To animate an existing still image, photograph, or concept art:
1. Click the **Upload Image** frame in the Studio Workspace.
2. Upload a JPG, PNG, or WebP file (up to 20MB).
3. Specify in your prompt how the subject and scene should animate.
   - *Example*: `"Gentle ocean breeze blowing through her hair, camera slowly tracks forward while golden hour sunlight flickers across the water."`
4. Click **Generate Video**. The AI uses your image as the exact starting frame.

### Reference Tagging
Advanced creators can specify multiple asset inputs directly inside the prompt using special tags:
- `@image1` — Designates the primary visual subject or character reference.
- `@video1` — Designates a motion reference or camera trajectory.
- `@audio1` — Designates a tempo or soundtrack reference for audio-reactive motion.

---

## 3. AI Video Engine Selection Guide

MaxMotion AI gives you access to five specialized generative video models:

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
When enabled, MaxMotion AI automatically analyzes your video prompt and synthesizes a synchronized 48kHz stereo soundscape (e.g. thunder, rain, engine revs, footsteps, ambient wildlife) attached directly to your output MP4.

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

Click the **⚡ AI Assistant** button located at the bottom-right corner of your screen to open the **MaxMotion AI Studio Director**, powered by Google Gemini Flash Omnimodal Intelligence.

### How the Director Helps You:
- **Engine Recommendations**: Describe your concept, and the Director recommends whether Wan 2.1, Kling, or Minimax will yield the best visual fidelity.
- **Prompt Engineering**: The Director transforms simple ideas into 35mm film director instructions with lens specs (e.g. *Anamorphic 50mm, f/1.8*).
- **Multimodal Reference Analysis**: Click the **Attach Image** paperclip icon inside the Director chat to upload reference images or sketches. Gemini Flash analyzes the lighting, color temperature, and framing, producing a prompt that matches the style.
- **1-Click Studio Application**: When the Director suggests a prompt and engine, click the **Apply to Studio Workspace** button inside the chat to automatically populate all settings.

---

## 7. Multi-Scene Storyboard Sequencer (`/sequencer`)

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

## 8. Showcase Archive & 4K Upscaling (`/gallery`)

Navigate to **Gallery** to access your library of rendered videos:
- **Playback & Previews**: Hover over any video card to stream the video.
- **4K Cinema Upscale**: Click the **4K Upscale** button on any completed video. MaxMotion AI sharpens textures, removes compression artifacts, and enhances the resolution to broadcast-grade 4K.
- **Download MP4**: Download your master MP4 directly to your computer.
- **Copy Prompt**: 1-click copy of the generation prompt and model parameters to reproduce or iterate on the look.

---

## 9. Public Video Player & Social Embedding (`/v/[id]`)

Every video generated on MaxMotion AI has a dedicated public showcase page:
- **Public URL**: `https://yourdomain.com/v/<creationId>`
- **Responsive Player**: High-definition video player optimized for mobile and desktop screens.
- **Dynamic Social Cards**: Automatically generates rich 1200x630 OpenGraph cards for Twitter/X, Discord, and LinkedIn displaying video thumbnails, active model badges, and playback controls.
- **1-Click Embed**: Copy standard `<iframe>` embed codes to display your videos on blogs, Webflow, Shopify, or portfolio websites.

---

## 10. Bring-Your-Own-Key (BYOK) Zero-Fee Mode

If you have personal API accounts with AI providers, you can bypass platform credit billing completely:
1. Navigate to [**Settings $\to$ BYOK Engine**](/settings).
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

MaxMotion AI features a native **Model Context Protocol (MCP)** server allowing external AI assistants (such as Claude Desktop and Cursor) to generate videos directly from your coding IDE or chat interface.

### Connecting Claude Desktop
1. Go to **Settings $\to$ Developer & MCP**.
2. Click **Generate Personal API Key** to receive your `mm_live_...` key.
3. Open your Claude Desktop configuration file (`claude_desktop_config.json`) and add:
```json
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
```
4. Restart Claude Desktop. You can now prompt Claude: *"Generate a 5-second cinematic video of a futuristic cyberpunk city using Wan 2.1 on MaxMotion AI."*

---

## 12. Account Settings, Plans & GDPR Portability

Navigate to [**Settings**](/settings) to manage your account:
- **Profile**: Update your display name and view your registered email and role.
- **Studio Defaults**: Set your favorite default AI engine, aspect ratio, camera motion, and audio auto-generation toggle.
- **Notifications**: In-app inbox receiving announcements, system updates, and generation status alerts.
- **GDPR Article 20 Data Portability**: Click **Export Data Archive** to download a complete JSON archive of all your prompts, creations, transactions, and metadata.
- **GDPR Article 17 Account Erasure**: Permanently erase your account, creations, uploaded reference media, and billing records from the platform.
