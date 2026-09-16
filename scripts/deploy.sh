#!/usr/bin/env bash
# Ships the API to Cloud Run and the web app to Firebase Hosting.
set -euo pipefail

PROJECT="${1:-}"
REGION="${REGION:-europe-west1}"
SERVICE="fitcore-api"

if [[ -z "$PROJECT" ]]; then
  echo "usage: scripts/deploy.sh <firebase-project-id>" >&2
  exit 1
fi

SA="fitcore-api@${PROJECT}.iam.gserviceaccount.com"
BUCKET="${STORAGE_BUCKET:-${PROJECT}.appspot.com}"

echo "==> API to Cloud Run"
gcloud run deploy "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --source server \
  --service-account "$SA" \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1 --memory 512Mi \
  --set-env-vars "Firebase__ProjectId=${PROJECT},Firebase__StorageBucket=${BUCKET},ASPNETCORE_ENVIRONMENT=Production" \
  --set-secrets "Anthropic__ApiKey=anthropic-api-key:latest"

# Cloud Run runs as the service account above, so no key file is shipped with the image.

echo "==> web app to Firebase Hosting"
# Hosting rewrites /api/** to Cloud Run, so the app talks to its own origin.
( cd client && npm ci && VITE_API_BASE=/ npm run build )
firebase deploy --only hosting --project "$PROJECT"

echo
echo "Hosting rewrites /api/** to the Cloud Run service, so the browser sees one origin"
echo "and VITE_API_BASE can stay empty in production."
