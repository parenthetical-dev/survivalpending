# Survival Pending - Development Progress

## Project Overview
"Survival Pending" is an LGBTQ+ story documentation platform that captures anonymous testimonies and converts them to audio using AI voices. The platform prioritizes complete anonymity, urgency, and emotional impact.

## What's Complete

### Authentication & User Management
- ✅ Semi-anonymous auth with auto-generated usernames (adjective_noun_1234 format)
- ✅ JWT-based authentication system
- ✅ Cloudflare Turnstile integration with dev mode bypass
- ✅ Login/signup pages with shadcn/ui components
- ✅ Custom fonts: Switzer (body), JetBrains Mono (usernames)

### Onboarding Flow
- ✅ 5-step onboarding process
- ✅ Credentials download requirement after signup
- ✅ Safety information and quick exit instructions
- ✅ Demographic collection (anonymous, optional)
- ✅ Crisis resources (Trans Lifeline, Trevor Project)

### Story Submission
- ✅ Multi-stage submission flow: Write → Refine → Voice → Preview
- ✅ WriteStage: 1000 character limit, auto-save, idle prompts
- ✅ RefineStage: Claude 3.5 Sonnet integration for optional improvements
- ✅ VoiceStage: 8 voice options with preview capability
- ✅ PreviewStage: Full audio preview with playback controls
- ✅ Quick exit button (3x ESC or click)

### API Endpoints
- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/login` - User authentication
- ✅ `/api/username/generate` - Username generation
- ✅ `/api/ai/refine` - Story refinement suggestions
- ✅ `/api/voice/preview` - Voice preview (short samples)
- ✅ `/api/voice/generate` - Full audio generation
- ✅ `/api/story/submit` - Story submission with sentiment analysis

### Database Schema
- ✅ User model with anonymous profiles
- ✅ UserDemographics for optional data collection
- ✅ Story model with sentiment flags
- ✅ CrisisInterventionLog for tracking support

## What Needs to Be Done

### Critical Features
- ❌ ElevenLabs API integration (currently returns dummy audio in dev)
- ✅ Cloud storage for audio files (Vercel Blob implemented)
- ❌ Homepage with 2-3 sample stories
- ❌ Admin moderation portal
- ❌ Crisis intervention flow (when high-risk content detected)

### Infrastructure
- ❌ Production environment variables
- ❌ Rate limiting with Upstash Redis
- ❌ Vercel Edge Config for emergency controls
- ❌ Error tracking (Sentry recommended)
- ❌ Analytics (privacy-preserving)

### Security & Privacy
- ❌ Content moderation queue
- ❌ Automated crisis detection and intervention
- ❌ Data retention policies
- ❌ Export/deletion capabilities

### UI/UX Polish
- ❌ Loading states and skeletons
- ❌ Mobile responsiveness testing
- ❌ Accessibility audit
- ❌ Dark mode refinements

## Environment Variables Needed
```
DATABASE_URL=          # Neon PostgreSQL
GROQ_API_KEY=         # For username generation
ANTHROPIC_API_KEY=    # For content refinement
ELEVENLABS_API_KEY=   # For text-to-speech
TURNSTILE_SECRET_KEY= # For captcha verification
JWT_SECRET=           # For auth tokens
BLOB_READ_WRITE_TOKEN=# For Vercel Blob storage

# Production only:
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linting
npx prisma studio # View database
```

## Key Design Decisions
1. **No email/password recovery** - Complete anonymity
2. **AI voices only** - No human voice recordings
3. **90-second limit** - ~1000 characters
4. **Immediate crisis support** - Automated detection
5. **Quick exit** - 3x ESC or button click
6. **Local storage** - Draft auto-save

## Next Steps Priority
1. Set up ElevenLabs API key and test audio generation
2. Build homepage with sample stories
3. Add crisis intervention flow
4. Deploy to production

## Notes for Future Development
- The RefineStage AI should preserve authentic voice while improving clarity
- Voice selection includes diverse options for different story tones
- All timestamps use UTC for consistency
- Session tokens expire after 24 hours
- Draft stories persist in localStorage until submitted