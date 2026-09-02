# 🚀 Google Cloud Run Deployment Guide

This application is containerized and optimized for **Google Cloud Run** using Next.js Standalone mode and **Cloud Firestore** via the Firebase Admin SDK.

---

## Prerequisites

1. Install the [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install).
2. Authenticate and set your GCP/Firebase project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
   *(e.g., one of your existing Firebase projects: `bizmaster-abfed`, `postpro-auth-777`, `the-law-of-success`, `webcrafter-2de07`, or a new project)*.

---

## Step 1: Enable Google Cloud APIs

Ensure the necessary APIs are enabled for your project:
```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## Step 2: Verify Firestore in Native Mode

If you haven't enabled Firestore in your Firebase / GCP project yet:
1. Open the [Firebase Console](https://console.firebase.google.com/) or Google Cloud Console.
2. Select **Firestore Database** > **Create database**.
3. Choose **Native mode** and select your preferred location (e.g. `nam5 (us-central)`).

---

## Step 3: Deploy Directly to Cloud Run

You do **not** need Docker installed locally! Google Cloud Build will automatically read the provided `Dockerfile` and build the container in the cloud:

```bash
gcloud run deploy seedance-2-generator \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars NEXTAUTH_SECRET="your_generated_secret_string",\
GOOGLE_CLIENT_ID="your_google_client_id",\
GOOGLE_CLIENT_SECRET="your_google_client_secret",\
SEEDANCE_V2_API_KEY="your_muapi_seedance_key",\
STRIPE_SECRET_KEY="sk_live_...",\
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_...",\
STRIPE_WEBHOOK_SECRET="whsec_..."
```

> **Note on Service Accounts**: On Cloud Run, the application automatically uses Application Default Credentials (ADC) to read and write to Firestore without needing private key JSON files! Just ensure the default Cloud Run service account has the **Cloud Datastore User** or **Firebase Admin** role.

---

## Step 4: Post-Deployment Configuration

Once deployed, Cloud Run will output your service URL (e.g. `https://seedance-2-generator-xxxx-uc.a.run.app`):

1. **Update `NEXTAUTH_URL` and `WEBHOOK_URL`**:
   ```bash
   gcloud run services update seedance-2-generator \
     --region us-central1 \
     --update-env-vars NEXTAUTH_URL="https://YOUR_SERVICE_URL",WEBHOOK_URL="https://YOUR_SERVICE_URL"
   ```

2. **Google OAuth Authorized Redirect URIs**:
   - Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
   - Edit your OAuth 2.0 Client ID.
   - Under **Authorized redirect URIs**, add:
     ```
     https://YOUR_SERVICE_URL/api/auth/callback/google
     ```

3. **Stripe Webhook**:
   - In your [Stripe Dashboard](https://dashboard.stripe.com/webhooks), add an endpoint:
     ```
     https://YOUR_SERVICE_URL/api/webhook/stripe
     ```
   - Listen for event: `checkout.session.completed`.

---

## Health Check Endpoint

Cloud Run automatically checks container health using:
- **Path**: `/api/health`
- **Response**: `{"status":"ok","uptime":...,"service":"seedance-2-generator"}`
