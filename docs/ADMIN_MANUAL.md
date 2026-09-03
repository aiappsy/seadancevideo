# 🛡️ MaxMotion AI — Complete Administrator & Operations Manual

This manual is the official operations guide for managing, configuring, monetizing, and scaling the **MaxMotion AI** generative video SaaS platform.

---

## Table of Contents
1. [Initial Admin Provisioning & Access Control](#1-initial-admin-provisioning--access-control)
2. [Admin Console Overview (`/admin`)](#2-admin-console-overview-admin)
3. [System Settings & The Master Key Vault (`/admin/settings`)](#3-system-settings--the-master-key-vault-adminsettings)
   - [General & Branding](#general--branding)
   - [AI Engines & Multi-Key Vault](#ai-engines--multi-key-vault)
   - [Credit Multipliers & Pricing Rates](#credit-multipliers--pricing-rates)
   - [Payment Gateways (Stripe & PayPal REST)](#payment-gateways-stripe--paypal-rest)
   - [High-Bandwidth Storage & $0 Egress (Cloudflare R2)](#high-bandwidth-storage--0-egress-cloudflare-r2)
   - [Legal & Compliance](#legal--compliance)
4. [Master Application API Key & External Integrations](#4-master-application-api-key--external-integrations)
5. [Live API Key Diagnostic Suite (`⚡ Test All Keys`)](#5-live-api-key-diagnostic-suite--test-all-keys)
6. [User & Account Management (`/admin/users`)](#6-user--account-management-adminusers)
7. [Subscription Plans & Credit Packages (`/admin/plans`)](#7-subscription-plans--credit-packages-adminplans)
8. [Communications, Broadcasts & Resend Email (`/admin/communication`)](#8-communications-broadcasts--resend-email-admincommunication)
9. [Profit & Margin Calculator (`/admin/calculator`)](#9-profit--margin-calculator-admincalculator)
10. [Cloud Run Production Deployment & Operations](#10-cloud-run-production-deployment--operations)

---

## 1. Initial Admin Provisioning & Access Control

MaxMotion AI uses role-based access control (RBAC) enforced in server-side middleware and API routes via [`src/lib/auth-admin.js`](file:///C:/Users/paul/Downloads/50apps-main/50apps-main/video_generation/seedance-2-generator/src/lib/auth-admin.js).

### Designating the Initial Super Admin
Set the following environment variable in your `.env.local` or Cloud Run environment:
```env
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
```
When this email signs in via Google OAuth or credentials:
1. The server automatically grants them the `admin` role in Firestore.
2. The golden **Admin** shield icon appears in the top navigation bar.
3. Access to `/admin` and all `/api/admin/*` endpoints is unlocked.
4. Admins can promote other users to the `admin` role directly from the [User Management Console (`/admin/users`)](/admin/users).

---

## 2. Admin Console Overview (`/admin`)

The Admin Dashboard provides real-time operational telemetry across four core sections:
- **System Metrics**: Total registered creators, total video generations, active subscriptions, and gross credit consumption.
- **Recent Generations**: Real-time monitor of live inference queues, engine distribution (Wan 2.1 vs Kling vs Seedance), and failure rates.
- **Quick Actions**: 1-click navigation to Settings, User Management, Plan Editor, Broadcast Communications, and the Profit Calculator.

---

## 3. System Settings & The Master Key Vault (`/admin/settings`)

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

## 4. Master Application API Key & External Integrations

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

## 5. Live API Key Diagnostic Suite (`⚡ Test All Keys`)

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

## 6. User & Account Management (`/admin/users`)

Manage all platform creators from a single administrative table:
- **Search & Filter**: Search by user email, display name, or user ID.
- **Credit Balance Adjustments**: Manually grant or deduct credits for refunds, promotions, or VIP support.
- **Role Assignment**: Elevate trusted team members to `admin` or revoke administrative rights.
- **Plan Overrides**: Assign custom subscription plans (e.g. *Enterprise*, *Agency Pro*).
- **Account Suspension**: Temporarily freeze abusive accounts.

---

## 7. Subscription Plans & Credit Packages (`/admin/plans`)

Manage your pricing tiers from `/admin/plans`:
- **Create Plan**: Set name (e.g. *Starter*, *Pro Creator*, *Studio Agency*), price, and recurring credit allocations.
- **Billing Intervals**: Support both monthly subscriptions and one-off credit top-ups.
- **Feature Badges**: Highlight *Popular* or *Best Value* tiers on the public `/pricing` page.
- **Stripe & PayPal Sync**: Link external Stripe Price IDs (`price_...`) to automate recurring renewal webhooks.

---

## 8. Communications, Broadcasts & Resend Email (`/admin/communication`)

Send system-wide or targeted messages from `/admin/communication`:
- **Broadcast Announcements**: Send updates about new models, downtime notices, or promotions to all registered users.
- **Targeted Direct Messages**: Send messages to a specific user by providing their user ID or email.
- **Real Transactional Email Delivery (via Resend)**:
  - Check the **Deliver via Email** toggle.
  - MaxMotion AI compiles an HTML-branded email and delivers it to user inboxes using the configured Resend API key.

---

## 9. Profit & Margin Calculator (`/admin/calculator`)

An in-app financial modeling tool designed to ensure healthy unit economics:
- **Input Parameters**: Model compute cost (e.g. Fal GPU rate vs ByteDance rate), retail credit price per pack, and average video duration.
- **Calculated Outputs**:
  - Net Gross Margin percentage (aim for 60%–75%).
  - Breakeven render count per subscription.
  - Cloudflare R2 vs Firebase Storage savings projection.

---

## 10. Cloud Run Production Deployment & Operations

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
