# Deployment Checklist for Cron Jobs

## ✅ Completed
- [x] Database migration from dev to prod (20 users, 8 stories migrated)
- [x] Created sync system between Neon and Sanity
- [x] Added cron job configuration in `vercel.json`
- [x] Created webhook endpoints for Sanity
- [x] Generated CRON_SECRET: `99a295018bee1aadadb3badb9519f9bcd2b45640766252847aa9d008c1cf427d`

## 📋 Required Environment Variables for Vercel

Add these to your Vercel project settings:

### 1. Cron Job Authentication
```
CRON_SECRET=99a295018bee1aadadb3badb9519f9bcd2b45640766252847aa9d008c1cf427d
```

### 2. Sanity Webhook Secret (generate a new one)
```
SANITY_WEBHOOK_SECRET=<generate-a-new-secret>
```

### 3. Database URLs (if not already set)
```
DATABASE_URL=<your-production-neon-url>
DATABASE_URL_PROD=<your-production-database-url>
```

### 4. Sanity Configuration (if different from dev)
```
SANITY_ADMIN_TOKEN=<your-sanity-admin-token>
```

## 🚀 Deployment Steps

1. **Add Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all the variables listed above

2. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "Add Neon-Sanity sync system with cron jobs"
   git push origin dev
   ```

3. **Verify Cron Job Registration**
   - After deployment, check Vercel Dashboard → Functions → Cron
   - You should see `/api/cron/sync` scheduled for "*/15 * * * *" (every 15 minutes)

4. **Setup Sanity Webhooks**
   - Run `npm run webhooks:setup` to get webhook configuration
   - Go to Sanity Studio → API → Webhooks
   - Add webhooks for both dev and prod environments
   - Use the SANITY_WEBHOOK_SECRET you set in Vercel

5. **Test the System**
   - Test webhook: Submit a story and moderate it in Sanity
   - Test cron: Wait 15 minutes or trigger manually via Vercel dashboard
   - Test manual sync: Use the admin API endpoints

## 📊 Monitoring

- **Cron Logs**: Vercel Dashboard → Functions → Logs → Filter by `/api/cron/sync`
- **Webhook Logs**: Vercel Dashboard → Functions → Logs → Filter by `/api/webhooks/sanity`
- **Sync Status**: Check via admin API or database directly

## 🔧 Useful Commands

```bash
# Check migration status
node scripts/check-migration.js

# Manual sync (after deployment)
curl -X POST https://your-app.vercel.app/api/admin/sync \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"environment": "production", "direction": "bidirectional"}'

# Check sync status
curl https://your-app.vercel.app/api/admin/sync \
  -H "Authorization: Bearer <your-jwt-token>"
```

## ⚠️ Important Notes

1. The cron job will run every 15 minutes once deployed
2. Sanity webhooks provide real-time updates for moderation changes
3. The system maintains bidirectional sync between Neon and Sanity
4. Production database now has all dev data (20 users, 8 stories)