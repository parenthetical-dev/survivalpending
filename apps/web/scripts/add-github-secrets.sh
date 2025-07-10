#!/bin/bash

# Script to add GitHub Actions secrets from .env.local
# Run this from your local machine with appropriate permissions

echo "Uploading GitHub Actions secrets from .env.local..."

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Not authenticated with GitHub CLI. Please run: gh auth login"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found!"
    echo "Please ensure you're running this script from the project root directory."
    exit 1
fi

# Function to extract value from .env.local
get_env_value() {
    local key=$1
    local value=$(grep "^$key=" .env.local | cut -d '=' -f2-)
    # Remove quotes if present
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    echo "$value"
}

# Function to set secret from .env.local
set_secret_from_env() {
    local name=$1
    local value=$(get_env_value "$name")
    
    if [ -n "$value" ]; then
        echo "Setting $name..."
        echo "$value" | gh secret set "$name"
        echo "✓ $name set successfully"
    else
        echo "⚠ $name not found in .env.local, skipping..."
    fi
}

echo ""
echo "Reading values from .env.local and uploading to GitHub Actions secrets..."
echo ""

# List of all possible secrets to upload
secrets=(
    "DATABASE_URL"
    "JWT_SECRET"
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
    "TURNSTILE_SECRET_KEY"
    "GROQ_API_KEY"
    "ANTHROPIC_API_KEY"
    "ELEVENLABS_API_KEY"
    "BLOB_READ_WRITE_TOKEN"
    "SENTRY_AUTH_TOKEN"
    "PIRSCH_ACCESS_TOKEN"
    "NEXT_PUBLIC_META_PIXEL_ID"
    "META_ACCESS_TOKEN"
    "META_TEST_EVENT_CODE"
    "SANITY_WEBHOOK_SECRET"
    "NEXT_PUBLIC_BASE_URL"
)

# Upload each secret
for secret in "${secrets[@]}"; do
    set_secret_from_env "$secret"
done

echo ""
echo "✅ GitHub Actions secrets upload complete!"
echo ""
echo "Secrets uploaded from .env.local to GitHub Actions."
echo "You can verify them at: https://github.com/parenthetical-dev/survivalpending/settings/secrets/actions"