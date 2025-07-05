# Meta CAPI Integration Summary

## Overview
Integrated Meta Conversion API (CAPI) tracking into the Survival Pending platform to track user journey and conversions.

## Changes Made

### 1. Demographics Submission (`/app/api/user/demographics/route.ts`)
- Added `trackStartTrial` import from `/lib/meta-capi`
- Tracks **StartTrial** event when user completes onboarding by submitting demographics
- Passes user ID and demographic data (ageRange, state, urbanicity)

### 2. Story Submission (`/app/api/story/submit/route.ts`)
- Added `trackPurchase` import from `/lib/meta-capi`
- Tracks **Purchase** event when user successfully submits a story
- Passes user ID, story ID, and sentiment analysis data (riskLevel, hasCrisisContent, categories)

### 3. AI Refinement (`/app/api/ai/refine/route.ts`)
- Added `trackInitiateCheckout` import from `/lib/meta-capi`
- Tracks **InitiateCheckout** event with stage "refine" when user uses AI refinement

### 4. Voice Preview (`/app/api/voice/preview/route.ts`)
- Added `trackInitiateCheckout` import from `/lib/meta-capi`
- Tracks **InitiateCheckout** event with stage "voice" when user previews voice options

### 5. Voice Generation (`/app/api/voice/generate/route.ts`)
- Added `trackInitiateCheckout` import from `/lib/meta-capi`
- Tracks **InitiateCheckout** event with stage "preview" when user generates full audio

## Event Flow

1. User signs up → No tracking (happens before demographics)
2. User completes onboarding (demographics) → **StartTrial**
3. User writes story → No tracking (client-side only)
4. User uses AI refinement → **InitiateCheckout** (stage: refine)
5. User selects voice → **InitiateCheckout** (stage: voice)
6. User previews audio → **InitiateCheckout** (stage: preview)
7. User submits story → **Purchase**

## Environment Variables Required
```
META_PIXEL_ID=your_pixel_id
META_ACCESS_TOKEN=your_access_token
META_TEST_EVENT_CODE=your_test_code (optional, for development)
```

## Data Privacy
- User IDs are hashed before sending to Meta
- No PII is sent directly
- Demographic data is sent as custom parameters without identifying information
- IP addresses and user agents are captured for attribution