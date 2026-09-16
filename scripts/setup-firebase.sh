#!/usr/bin/env bash
# Sets up the Firebase side of FitCore: APIs, service account, rules, indexes.
# Idempotent — safe to run again after a failure.
set -euo pipefail

PROJECT="${1:-}"
REGION="${REGION:-europe-west1}"

if [[ -z "$PROJECT" ]]; then
  echo "usage: scripts/setup-firebase.sh <firebase-project-id>" >&2
  exit 1
fi

need() { command -v "$1" >/dev/null || { echo "missing: $1" >&2; exit 1; }; }
need gcloud
need firebase

echo "==> project $PROJECT"
gcloud config set project "$PROJECT" >/dev/null

echo "==> enabling the APIs the stack needs"
gcloud services enable \
  firestore.googleapis.com \
  storage.googleapis.com \
  identitytoolkit.googleapis.com \
  iamcredentials.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

echo "==> Firestore in native mode (skipped when it already exists)"
gcloud firestore databases create --location="$REGION" 2>/dev/null || echo "    already there"

SA="fitcore-api@${PROJECT}.iam.gserviceaccount.com"
echo "==> service account $SA"
gcloud iam service-accounts create fitcore-api \
  --display-name "FitCore API" 2>/dev/null || echo "    already there"

# Firestore and Storage only — the API never needs project-wide rights.
for role in roles/datastore.user roles/storage.objectAdmin roles/firebaseauth.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role "$role" --condition=None >/dev/null
done

echo "==> signing a key into ./secrets/service-account.json"
mkdir -p secrets
if [[ ! -f secrets/service-account.json ]]; then
  gcloud iam service-accounts keys create secrets/service-account.json --iam-account "$SA"
else
  echo "    a key is already there; delete it first to rotate"
fi

echo "==> rules and indexes"
[[ -f .firebaserc ]] || sed "s/your-firebase-project-id/$PROJECT/" .firebaserc.example > .firebaserc
firebase deploy --only firestore:rules,firestore:indexes,storage:rules --project "$PROJECT"

cat <<NEXT

Done. What is left is in the console, because it cannot be scripted:
  1. Authentication -> Sign-in method -> enable Email/Password.
  2. Storage -> create the default bucket (${PROJECT}.appspot.com).
  3. Copy the web app config into client/.env.local:
       VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
       VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID

Then deploy: scripts/deploy.sh ${PROJECT}
NEXT
