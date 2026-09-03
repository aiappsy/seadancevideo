# 🛡️ MaxMotion AI — Complete Administrator & Operations Manual

> **Auto-Generated Documentation** — Last synchronized: `2026-09-03`
> Administrative access is strictly restricted to: `paljuritzen@gmail.com`

---

## Table of Contents
1. [Initial Admin Provisioning & Hardened Access Control](#1-initial-admin-provisioning--hardened-access-control)
2. [Zero Pre-Deployment Requirements & In-App Setup](#2-zero-pre-deployment-requirements--in-app-setup)
3. [Admin Console Overview (`/admin`)](#3-admin-console-overview-admin)
4. [System Settings & The Master Key Vault (`/admin/settings`)](#4-system-settings--the-master-key-vault-adminsettings)
   - [General & Branding](#general--branding)
   - [AI Engines & Multi-Key Vault](#ai-engines--multi-key-vault)
   - [Credit Multipliers & Pricing Rates](#credit-multipliers--pricing-rates)
   - [Payment Gateways (Stripe & PayPal REST)](#payment-gateways-stripe--paypal-rest)
   - [High-Bandwidth Storage & $0 Egress (Cloudflare R2)](#high-bandwidth-storage--0-egress-cloudflare-r2)
   - [Legal & Compliance](#legal--compliance)
5. [Master Application API Key & External Integrations](#5-master-application-api-key--external-integrations)
6. [Live API Key Diagnostic Suite (`⚡ Test All Keys`)](#6-live-api-key-diagnostic-suite--test-all-keys)
7. [User & Account Management (`/admin/users`)](#7-user--account-management-adminusers)
8. [Subscription Plans & Credit Packages (`/admin/plans`)](#8-subscription-plans--credit-packages-adminplans)
9. [Communications, Broadcasts & Resend Email (`/admin/communication`)](#9-communications-broadcasts--resend-email-admincommunication)
10. [Profit & Margin Calculator (`/admin/calculator`)](#10-profit--margin-calculator-admincalculator)
11. [Cloud Run Production Deployment & Operations](#11-cloud-run-production-deployment--operations)

---

## 1. Initial Admin Provisioning & Hardened Access Control

Administrative access to MaxMotion AI is cryptographically locked and enforced server-side.
Only the verified account:
```
paljuritzen@gmail.com
```
is permitted to view administrative dashboards, access `/admin/*` routes, or invoke administrative API endpoints (`/api/admin/*`). Any other user role or email attempting access is intercepted with HTTP 403 Forbidden.

---

## 2. Zero Pre-Deployment Requirements & In-App Setup

This application has been engineered to boot and run **without requiring any initial API keys or configuration secrets in `.env`**.

### How Zero-Env Deployment Works:
1. **Application Boots Immediately**: The server boots with resilient fallbacks for NextAuth JWT secrets, local application defaults, and dynamic settings.
2. **Immediate Super-Admin Login**: The designated super-admin (`paljuritzen@gmail.com`) logs in via Google Profile or Email Studio Pass.
3. **Configure Everything Inside the App**: Once logged in, the administrator visits [**Admin Settings (`/admin/settings`)**](/admin/settings) to configure all platform credentials:
   - Google OAuth credentials
   - Stripe & PayPal payment gateways
   - ByteDance / MuAPI, Fal.ai, and Gemini Flash API keys
   - ElevenLabs voiceover keys
   - Resend transactional email keys
   - Cloudflare R2 / S3 storage credentials
4. **Instant Persistence in Firestore**: All keys and rates are persisted dynamically to Google Cloud Firestore (`system_settings/config`) and immediately take effect platform-wide without redeploying the server.

---

## 3. Admin Console Overview (`/admin`)

The Admin Dashboard provides real-time operational telemetry across four core sections:
- **System Metrics**: Total registered creators, total video generations, active subscriptions, and gross credit consumption.
- **Recent Generations**: Real-time monitor of live inference queues, engine distribution (Wan 2.1 vs Kling vs Seedance), and failure rates.
- **Quick Actions**: 1-click navigation to Settings, User Management, Plan Editor, Broadcast Communications, and the Profit Calculator.

---

## 4. System Settings & The Master Key Vault (`/admin/settings`)

All platform settings are stored dynamically in the Firestore collection `system_settings/config`. Changes saved in the admin console take effect immediately across all users without requiring a redeployment or server restart.

### General & Branding
- **Application Name**: Rebrands the app title, navbar logo text, and email headers (e.g. `MaxMotion AI`).
- **Support Email**: Displayed on user invoices, footer links, and transactional emails.
- **Company Name & Legal Jurisdiction**: Automatically injected into the `/terms`, `/privacy`, and `/refund` legal documents.
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
- `T2V 720p High` (Default: 50 credits/sec)
- `T2V 720p Basic` (Default: 30 credits/sec)
- `Wan 2.1 Rate` (Default: 30 credits/sec)
- `Kling 1.5 Rate` (Default: 55 credits/sec)
- `Minimax Rate` (Default: 50 credits/sec)
- `4K Upscale Cost` (Default: 25 credits flat)
- `Audio Foley Synthesis Cost` (Default: 10 credits flat)

### Payment Gateways (Stripe & PayPal REST)

#### Stripe Gateway
1. Set **Enable Stripe** to **ON**.
2. Enter your `Publishable Key` (`pk_live_...` or `pk_test_...`) and `Secret Key` (`sk_live_...`).
3. Add the Webhook Secret (`whsec_...`) pointing to `https://yourdomain.com/api/stripe/webhook` to automate instant credit fulfillment.

#### PayPal REST Gateway
> **Best Practice**: The cleanest and most reliable PayPal integration uses just **Client ID** and **Client Secret**.
> MaxMotion AI uses PayPal REST API v2 Orders (`/v2/checkout/orders`). This server-side flow creates and captures orders directly without requiring complex webhook setups:
1. Set **Enable PayPal** to **ON**.
2. Select **Mode**: `Sandbox` (for testing) or `Live` (for real revenue).
3. Enter your **PayPal Client ID** from the [PayPal Developer Dashboard](https://developer.paypal.com).
4. Enter your **PayPal Client Secret**.
5. Save settings. PayPal one-click checkout is immediately active on the `/pricing` page.

### High-Bandwidth Storage & $0 Egress (Cloudflare R2)
While Firebase Storage is used for user avatars and thumbnails, streaming high-definition 4K videos at scale from Google Cloud Storage can incur substantial egress fees ($0.12/GB).

To eliminate egress bandwidth costs:
1. Navigate to the **Storage & Legal** tab.
2. Toggle **Cloudflare R2 / S3 Storage** to **ON**.
3. Enter:
   - **R2 Account ID**
   - **R2 Bucket Name**
   - **R2 Access Key ID** & **R2 Secret Access Key**
   - **Custom Public Domain / CDN URL** (e.g. `https://cdn.yourdomain.com`)
4. Completed video renders will stream directly through Cloudflare with **$0 egress fees**.

### Legal & Compliance
- **Cookie Banner Toggle**: Displays a compliant GDPR/CCPA cookie consent dialog to first-time visitors.
- **Data Retention Period**: Set auto-cleanup duration for temporary preview files (0 = retain indefinitely).

---

## 5. Master Application API Key & External Integrations

Located in **Admin Settings $\to$ MCP & Developer**:
- The **Master App API Key** (`mm_app_...`) allows your server infrastructure, microservices, mobile apps, or automation workflows (e.g. n8n, Make.com) to generate videos programmatically.
- **Server-to-Server Authentication**:
```bash
curl -X POST https://yourdomain.com/api/seedance \
  -H "Authorization: Bearer mm_app_YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cinematic aerial shot of Tokyo at night",
    "model": "wan-2.1",
    "aspectRatio": "16:9",
    "duration": 5
  }'
```
- **Key Rotation**: Click the **Rotate Key** button at any time if a key is compromised. The previous key is immediately invalidated.

---

## 6. Live API Key Diagnostic Suite (`⚡ Test All Keys`)

In the header of `/admin/settings`, click **⚡ Test All Keys**:
- Concurrently pings every configured provider:
  - **Google Gemini Flash**: Verifies model response and measures latency.
  - **Fal.ai**: Validates authorization and queue availability.
  - **MuAPI / ByteDance**: Tests endpoint responsiveness.
  - **ElevenLabs**: Checks voice synthesis authorization and account character quota.
  - **Resend**: Validates email sending authorization.
  - **Stripe & PayPal**: Verifies gateway credential presence and active status.
- Displays color-coded operational chips with roundtrip response times:
  - 🟢 **Operational** (`<latency>ms`)
  - ⚪ **Unconfigured** (key omitted)
  - 🔴 **Degraded / Error** (invalid key or upstream outage)

---

## 7. User & Account Management (`/admin/users`)

Manage all platform creators from a single administrative table:
- **Search & Filter**: Search by user email, display name, or user ID.
- **Credit Balance Adjustments**: Manually grant or deduct credits for refunds, promotions, or VIP support.
- **Role Assignment**: Elevate trusted team members or adjust privileges.
- **Plan Overrides**: Assign custom subscription plans (e.g. *Enterprise*, *Agency Pro*).
- **Account Suspension**: Temporarily freeze abusive accounts.

---

## 8. Subscription Plans & Credit Packages (`/admin/plans`)

Manage your pricing tiers from `/admin/plans`:
- **Create Plan**: Set name (e.g. *Starter*, *Pro Creator*, *Studio Agency*), price, and recurring credit allocations.
- **Billing Intervals**: Support both monthly subscriptions and one-off credit top-ups.
- **Feature Badges**: Highlight *Popular* or *Best Value* tiers on the public `/pricing` page.
- **Stripe & PayPal Sync**: Link external Stripe Price IDs (`price_...`) to automate recurring renewal webhooks.

---

## 9. Communications, Broadcasts & Resend Email (`/admin/communication`)

Send system-wide or targeted messages from `/admin/communication`:
- **Broadcast Announcements**: Send updates about new models, downtime notices, or promotions to all registered users.
- **Targeted Direct Messages**: Send messages to a specific user by providing their user ID or email.
- **Real Transactional Email Delivery (via Resend)**:
  - Check the **Deliver via Email** toggle.
  - MaxMotion AI compiles an HTML-branded email and delivers it to user inboxes using the configured Resend API key.

---

## 10. Profit & Margin Calculator (`/admin/calculator`)

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
- **Windows**: Run `deploy-cloudrun.bat`
- **macOS / Linux**: Run `./deploy-cloudrun.sh`

### Cloud Run Production Specs
- **Min Instances**: Set to `0` to enable automatic scale-to-zero when idle, resulting in **$0 standby cost**.
- **Max Instances**: `10`–`50` depending on traffic requirements.
- **Memory**: `2Gi`
- **CPU**: `1`
- **Port**: `8080`
- **Health Check Endpoint**: `/api/health` returns HTTP 200 and system uptime for Cloud Run load balancers.
