@echo off
setlocal

echo ==============================================================================
echo Deploying MaxMotion AI to Google Cloud Run
echo ==============================================================================

:: Check if gcloud is installed
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Google Cloud SDK (gcloud) is not installed or not on PATH.
    echo Download and install it from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

:: Prompt for GCP Project ID if not set
if "%GCP_PROJECT_ID%"=="" (
    set /p GCP_PROJECT_ID="Enter your Google Cloud Project ID: "
)

if "%GCP_REGION%"=="" (
    set GCP_REGION=us-central1
)

set SERVICE_NAME=maxmotion-ai

echo [INFO] Setting active project: %GCP_PROJECT_ID%
call gcloud config set project %GCP_PROJECT_ID%

echo [INFO] Submitting build to Google Cloud Build and deploying to Cloud Run...
call gcloud run deploy %SERVICE_NAME% ^
    --source . ^
    --region %GCP_REGION% ^
    --platform managed ^
    --allow-unauthenticated ^
    --memory 2Gi ^
    --cpu 1 ^
    --min-instances 0 ^
    --max-instances 10 ^
    --port 8080 ^
    --set-env-vars NODE_ENV=production

if %errorlevel% equ 0 (
    echo ==============================================================================
    echo [SUCCESS] MaxMotion AI successfully deployed to Google Cloud Run!
    call gcloud run services describe %SERVICE_NAME% --region %GCP_REGION% --format="value(status.url)"
    echo ==============================================================================
) else (
    echo [ERROR] Cloud Run deployment encountered an error.
)

endlocal
