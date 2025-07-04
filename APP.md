# Survival Pending - Application Architecture

## Mission
"Survival Pending" is a platform for capturing and preserving textual testimonies and stories from LGBTQ+ individuals across the United States. The platform serves as a witness to the retrenchment of LGBTQ+ rights and visibility, transforming written testimonies into audio narratives for greater visceral impact.

## Core Features

### 1. Anonymous Story Collection
- Users submit written testimonies/stories
- Stories are converted to audio using ElevenLabs
- Complete anonymity maintained throughout

### 2. Audio-First Experience
- Audio is the central asset
- Multiple voice options for customization
- Adds visceral impact beyond written text

### 3. Demographic Mapping
- Collect demographic data to understand regional and identity-based impacts
- Enable trend analysis and aggregation
- Balance data collection with user safety

## Technical Architecture

### Stack
- **Frontend**: Next.js (App Router)
- **Database**: Neon (PostgreSQL) + Prisma ORM
- **Authentication**: Custom semi-anonymous system
- **Audio Generation**: ElevenLabs API
- **Security**: CAPTCHA, AI-powered content moderation

### Authentication Flow
1. **Username Generation**
   - Auto-generated in format: `adjective_noun` (e.g., "brave_phoenix")
   - Users can cycle through options
   - No user-created usernames (prevents accidental self-identification)
   
2. **Password Creation**
   - User sets secure password
   - No email required
   
3. **CAPTCHA Verification**
   - Robust CAPTCHA before signup completion
   - Critical for preventing abuse without email verification

### Demographic Data Collection

#### Age Ranges (COPPA Compliant)
- 13-17
- 18-24
- 25-34
- 35-44
- 45-54
- 55-64
- 65+

#### Gender Identity
- Comprehensive list of options
- Include non-binary, genderfluid, two-spirit, etc.
- "Prefer not to say" option
- Custom text field option

#### Racial/Ethnic Identity
- Comprehensive list reflecting US demographics
- Multiple selection allowed
- "Prefer not to say" option
- Custom text field option

#### Location
- State-level only (no cities/zip codes)
- Urbanicity level:
  - Urban/City
  - Suburban
  - Rural
  - "Prefer not to say"

#### Data Collection Strategy
**Mandatory Fields** (minimal friction):
- Age range
- State

**Optional Fields** (with explanation of importance):
- Gender identity
- Racial/ethnic identity
- Urbanicity level

Include clear messaging: "We collect demographic data to understand how location and identity impact experiences. This helps us identify trends and better advocate for our community."

### Content Moderation System

#### Multi-Layer Approach
1. **AI Pre-Screening**
   - Immediate flag/quarantine of potentially harmful content
   - Check for:
     - Hate speech
     - Explicit violence
     - Doxxing attempts
     - Spam/abuse patterns
     - **Suicidal ideation** (triggers immediate resource display)
     - Self-harm content
   
2. **Admin Review Portal**
   - ALL stories require manual approval
   - Queue system for efficient review
   - Ability to:
     - Approve
     - Reject with reason
     - Request edits
     - Flag for further review

3. **Security Considerations**
   - Rate limiting on submissions
   - IP tracking for abuse patterns
   - Ability to quickly disable submissions during attacks
   - Regular backups of approved content
   - DDoS protection

### User Flow

1. **Landing Page**
   - Clear mission statement
   - 2-3 sample stories (audio + text)
   - Prominent "Share Your Story" CTA

2. **Authentication**
   - Generate username
   - Set password
   - Complete CAPTCHA

3. **Onboarding**
   - Explain platform purpose
   - **Safety briefing**: Quick exit button demo, crisis resources
   - Demographic collection with clear rationale
   - Privacy/safety assurances
   - Clear explanation of available support

4. **Story Submission**
   - **Safety reminder**: Quick exit and crisis resources visible
   - Text input (with character/word limits)
   - **Real-time sentiment monitoring** (background)
   - Voice selection for audio
   - Preview before submission
   - Clear notice about moderation process
   - Crisis intervention if concerning content detected

5. **Post-Submission**
   - Confirmation message
   - Explanation of review timeline
   - Option to edit while pending

### Database Schema (Preliminary)

```
User
- id
- username (unique)
- password_hash
- created_at
- last_login
- is_banned

UserDemographics
- user_id (FK)
- age_range
- state
- gender_identity (optional)
- racial_identity (optional)
- urbanicity (optional)
- created_at

Story
- id
- user_id (FK)
- content_text
- content_sanitized (for display)
- audio_url
- voice_id
- status (pending/approved/rejected/flagged)
- moderation_notes
- sentiment_flags (JSON - tracks any crisis indicators)
- created_at
- approved_at
- approved_by

CrisisInterventionLog
- id
- user_id (FK)
- story_id (FK, nullable)
- trigger_type (submission/viewing/other)
- intervention_shown
- resources_clicked
- timestamp

ModerationLog
- id
- story_id (FK)
- moderator_id (FK)
- action
- reason
- timestamp

Admin
- id
- username
- password_hash
- permissions
- created_at
```

### Security & Privacy Measures

1. **Data Protection**
   - No PII collection
   - Encrypted passwords
   - Secure session management
   - HTTPS only

2. **Content Security**
   - Sanitize all inputs
   - XSS protection
   - SQL injection prevention
   - Rate limiting

3. **Operational Security**
   - Admin access controls
   - Audit logging
   - Regular security updates
   - Incident response plan

### Safety Features

1. **Quick Exit Button**
   - Persistent floating button (all pages)
   - Keyboard shortcut (ESC key 3x rapidly)
   - Immediately redirects to innocuous site (e.g., Google.com)
   - Clears session/form data
   - Visible during onboarding with explanation

2. **Crisis Intervention System**
   - Real-time sentiment analysis during story composition
   - Flags for suicidal ideation keywords/phrases
   - Immediate intervention with resources
   - Non-intrusive but persistent help offers
   - Trained moderator alerts for severe cases

3. **Resource Integration**
   - Crisis hotlines prominently displayed
   - 24/7 chat support links
   - Local resource finder
   - Clear messaging during onboarding about available help

### Launch Priorities

**Phase 1 (Immediate - Today)**
- Basic auth system with username generation
- Story submission form
- Database setup
- Basic admin review interface
- Simple homepage with sample stories
- Quick exit button implementation
- Crisis resource integration
- Basic sentiment analysis for crisis detection

**Phase 2 (Next Week)**
- ElevenLabs integration
- Enhanced moderation tools
- AI pre-screening
- Improved UI/UX

**Phase 3 (Future)**
- Browse/explore functionality
- Search and filtering
- Data visualization
- Community features

### Compliance Considerations

- COPPA compliance for 13-17 age group
- Clear privacy policy
- Terms of service
- Content guidelines
- Moderation transparency

### Deployment

- Environment variables for sensitive data
- Secure production database
- CDN for audio files
- Monitoring and alerting
- Regular backups

### Confirmed Stack

  Core Services ✅

  - Database: Neon PostgreSQL
  - AI: Anthropic API + Groq API
  - Auth: NextAuth with custom implementation
  - Captcha: Cloudflare Turnstile
  - Audio: ElevenLabs API

  Infrastructure ✅

  - Redis: Upstash KV (rate limiting, sessions)
  - Edge Config: For emergency controls
  - Blob Storage: Vercel Blob (for audio files)
  - CMS: Sanity (for managed content)
  - Monitoring: Sentry + Checkly

  Security Features ✅

  - Turnstile for bot protection
  - Redis for rate limiting
  - Edge Config for emergency shutdowns
  - Sentry for error tracking

  This is a robust stack! You have everything needed:
  - Content management (Sanity)
  - Performance monitoring (Checkly)
  - Error tracking (Sentry)
  - Rate limiting (Upstash)
  - Emergency controls (Edge Config)