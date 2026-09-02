#!/usr/bin/env bash
set -e

echo "=============================================================================="
echo "Deploying MaxMotion AI to Google Cloud Run"
echo "=============================================================================="

if ! command -v gcloud &> /dev/null; then
    echo "[ERROR] Google Cloud SDK (gcloud) is not installed."
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

GCP_PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
if [ -z "$GCP_PROJECT_ID" ]; then
    read -p "Enter your Google Cloud Project ID: " GCP_PROJECT_ID
fi

GCP_REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="maxmotion-ai"

echo "[INFO] Setting active project: $GCP_PROJECT_ID"
gcloud config set project "$GCP_PROJECT_ID"

echo "[INFO] Deploying to Cloud Run in region: $GCP_REGION..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$GCP_REGION" \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port 8080 \
    --set-env-vars NODE_ENV=production

echo "=============================================================================="
echo "[SUCCESS] MaxMotion AI successfully deployed!"
gcloud run services describe "$SERVICE_NAME" --region "$GCP_REGION" --format="value(status.url)"
echo "=============================================================================="
