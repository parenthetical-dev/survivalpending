# Homepage Issues Analysis

## Summary of Findings

After examining the homepage component and related API routes, here are the potential issues identified:

### 1. **Story Loading API Issues**
- The `/api/featured-stories` endpoint fetches stories from Sanity CMS
- The `getFeaturedStories()` function has a fallback mechanism: it tries Sanity first, then falls back to Neon database
- **Potential Issue**: If Sanity is not properly configured or has no data, and the Neon database also has no approved stories with `showOnHomepage: true`, the featured stories section will be empty

### 2. **Animation/Background Issues**
- The `ScrollingStories` component creates the animated background with scrolling story cards
- It uses CSS animations with `@keyframes` for scrolling and fade-in effects
- **Potential Issue**: The component uses `style jsx` which might not be working properly if there's a configuration issue
- The opacity is set very low (0.15 for light mode, 0.07 for dark mode) which might make it hard to see

### 3. **Filter Functionality Problems**
- The filter functionality is in the `/stories` page, not the homepage
- Filters include: hasAudio, timeRange, categories, and selectedState
- **Potential Issue**: The geographic filtering depends on demographic data being present in the database

### 4. **Environment Variable Issues**
- The Sanity client configuration uses environment variables that may not be set:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `SANITY_API_PROJECT_ID`
  - `SANITY_API_WRITE_TOKEN`
- It defaults to project ID 'xh75mh7d' if not set
- **Potential Issue**: The dataset switches between 'development' and 'production' based on NODE_ENV

## Recommendations to Fix

### 1. Check Sanity Configuration
```bash
# Verify Sanity environment variables are set
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $SANITY_API_PROJECT_ID
echo $SANITY_API_WRITE_TOKEN
```

### 2. Verify Database Has Stories
```bash
# Check if there are any approved stories with showOnHomepage flag
npx prisma studio
# Look for stories with status: APPROVED and showOnHomepage: true
```

### 3. Test API Endpoints Directly
```bash
# Test featured stories endpoint
curl http://localhost:3000/api/featured-stories

# Test all stories endpoint
curl http://localhost:3000/api/stories
```

### 4. Fix ScrollingStories Animation
The `style jsx` in ScrollingStories might not be working. Consider moving the styles to a CSS module or inline styles.

### 5. Add Error Boundaries
Add error boundaries around the FeaturedStories and ScrollingStories components to catch and display any runtime errors.

### 6. Development Server Issue
There's a bus error when trying to run with Turbopack. Try running without it:
```json
// In package.json, change:
"dev": "next dev --turbopack"
// To:
"dev": "next dev"
```

## Quick Fixes to Try

1. **Populate test data**: Run `npm run db:add-stories` to add example stories
2. **Approve stories**: Run `npm run db:approve-stories` to approve them
3. **Check Sanity sync**: Run `npm run sync:status` to check sync status
4. **Clear and reset**: If needed, run `npm run db:reset` to start fresh

## Most Likely Issue

Based on the analysis, the most likely issue is that there are no approved stories in the database with `showOnHomepage: true`, causing the featured stories section to be empty. The ScrollingStories animation might also be too subtle (low opacity) to be noticeable.