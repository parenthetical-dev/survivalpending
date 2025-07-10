# Sanity CMS Setup for Survival Pending

This directory contains the Sanity Studio configuration for content moderation and story management.

## Setup Instructions

1. **Create a Sanity Project**
   - Go to [sanity.io](https://www.sanity.io) and create a new project
   - Choose the "Clean project with no predefined schemas" template
   - Note your project ID and dataset name

2. **Update Environment Variables**
   Add these to your `.env` file:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   SANITY_API_TOKEN="your-sanity-api-token"
   ```

3. **Generate API Token**
   - Go to your Sanity project dashboard
   - Navigate to Settings > API > Tokens
   - Create a new token with "Editor" permissions
   - Add it to your `.env` as `SANITY_API_TOKEN`

4. **Deploy Sanity Studio**
   ```bash
   cd sanity
   npx sanity deploy
   ```

## Accessing the Studio

- **Local Development**: Visit `/studio` in your Next.js app
- **Production**: After deployment, access at `https://your-app.com/studio`

## Schema Overview

The `story` schema includes:
- **storyId**: Reference to the database story
- **username**: Anonymous username of the submitter
- **content**: Original story text
- **contentSanitized**: AI-refined version
- **voiceId**: Selected voice for audio generation
- **audioUrl**: Link to generated audio file
- **status**: Moderation status (pending/approved/rejected)
- **sentimentFlags**: Crisis detection flags
- **categories**: Content categorization
- **tags**: Additional metadata
- **moderationNotes**: Internal notes for moderators

## Moderation Workflow

1. Stories are automatically synced to Sanity when submitted
2. All stories start with `status: pending`
3. Moderators can:
   - Review content and audio
   - Add categories and tags
   - Approve or reject stories
   - Add moderation notes
4. Only approved stories appear on the public homepage

## Integration with Next.js

- Stories are synced via the `/lib/sanity-sync.ts` helper
- The sync happens in the `/api/story/submit` endpoint
- Use `getApprovedStories()` to fetch stories for the homepage
- The `updateStoryStatus()` function handles approval/rejection

## Security Notes

- The Sanity API token should only be used server-side
- Public tokens (project ID, dataset) are safe for client-side use
- Studio access should be restricted to authorized moderators only