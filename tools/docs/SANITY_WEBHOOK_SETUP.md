# Sanity Webhook Setup Guide

## Overview

This guide explains how to properly configure Sanity webhooks to sync story moderation status between Sanity CMS and your Neon database.

## Prerequisites

1. Access to your Sanity project management dashboard
2. `SANITY_WEBHOOK_SECRET` environment variable set in your application

## Setup Instructions

### 1. Generate a Webhook Secret

First, generate a secure webhook secret:

```bash
openssl rand -hex 32
```

Add this to your environment variables:
```env
SANITY_WEBHOOK_SECRET=your-generated-secret-here
```

### 2. Configure Webhook in Sanity

1. Go to your Sanity project management: `https://www.sanity.io/manage/project/YOUR_PROJECT_ID/api/webhooks`
2. Click "Create Webhook"
3. Configure with these settings:

   **Name**: `survival-pending-sync-production` (or `-development` for dev)
   
   **URL**: 
   - Production: `https://survivalpending.com/api/webhooks/sanity`
   - Development: `https://your-dev-url.vercel.app/api/webhooks/sanity`
   
   **Dataset**: `production` (or `development`)
   
   **Trigger on**: 
   - ✅ Create
   - ✅ Update
   - ❌ Delete (not needed)
   
   **Filter**: `_type == "story"`
   
   **Projection** (optional but recommended):
   ```groq
   {
     _type,
     _id,
     storyId,
     status,
     moderatorNotes,
     tags,
     categories,
     approvedAt,
     rejectedAt,
     "moderatorId": select(
       defined(approvedBy) => approvedBy,
       defined(rejectedBy) => rejectedBy,
       null
     )
   }
   ```
   
   **Secret**: Paste the secret you generated in step 1
   
   **HTTP Method**: POST
   
   **Headers**: Leave empty (Sanity will add the signature header automatically)

### 3. Test the Webhook

After creating the webhook:

1. Make a test change to a story in Sanity Studio
2. Check the webhook logs in Sanity dashboard
3. Check your application logs for webhook processing

## Troubleshooting

### "Invalid signature" Errors

If you're seeing 401 errors with "Invalid signature":

1. **Verify the secret matches**: The secret in your environment variable must exactly match the one in Sanity
2. **Check for whitespace**: Ensure no extra spaces or newlines in the secret
3. **Verify header name**: The signature comes in the `sanity-webhook-signature` header

### Debugging Tips

The webhook route logs helpful debugging information:
- Missing signature headers
- Available headers (to see what Sanity is sending)
- Secret length (to verify it's loaded)

Check your application logs for these details.

### Common Issues

1. **Wrong header name**: Sanity sends the signature in `sanity-webhook-signature`, not a custom header
2. **Body parsing**: The webhook uses the raw request body for signature verification
3. **Environment variables**: Ensure `SANITY_WEBHOOK_SECRET` is available in your deployment

## Security Notes

- Never commit the webhook secret to version control
- Use different secrets for different environments
- The signature verification ensures requests are genuinely from Sanity
- Failed signature verifications return 401 to prevent unauthorized updates

## Reference

- [Sanity Webhook Documentation](https://www.sanity.io/docs/webhooks)
- [@sanity/webhook package](https://www.npmjs.com/package/@sanity/webhook)