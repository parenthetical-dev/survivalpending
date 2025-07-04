# Survival Pending

A platform for capturing and preserving LGBTQ+ stories and testimonies across the United States, transforming written narratives into powerful audio experiences.

## Mission

Survival Pending serves as a witness to the retrenchment of LGBTQ+ rights and visibility in the United States. By collecting anonymous stories and converting them to audio using AI voices, we create a visceral, human archive of experiences that might otherwise go unheard.

## Features

- **Anonymous Story Collection**: Share your story without revealing your identity
- **Audio Transformation**: Every story is converted to audio for greater emotional impact
- **Demographic Insights**: Understand how location and identity affect LGBTQ+ experiences
- **Privacy-First**: No email required, auto-generated usernames, complete anonymity
- **Moderated & Safe**: AI-powered pre-screening and human review ensure a safe space

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Audio**: ElevenLabs API
- **Authentication**: Custom anonymous auth system
- **Security**: CAPTCHA, content moderation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- ElevenLabs API key (for audio generation)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/survivalpending.git
cd survivalpending
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
DATABASE_URL="your-neon-database-url"
DIRECT_URL="your-neon-direct-url"
ELEVENLABS_API_KEY="your-api-key"
NEXTAUTH_SECRET="generate-a-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

See [APP.md](./APP.md) for detailed application architecture, security considerations, and development roadmap.

## Contributing

This project has an urgent mission. If you'd like to contribute:

1. Read our [APP.md](./APP.md) for architecture details
2. Check open issues or create one
3. Submit PRs with clear descriptions
4. Ensure all content moderation tests pass

## Security

Given the sensitive nature of this platform:

- All stories require manual approval
- AI pre-screening for harmful content
- Rate limiting and abuse prevention
- No PII collection
- Encrypted passwords and secure sessions

## Privacy

- No email addresses required
- Auto-generated anonymous usernames
- State-level location only
- Optional demographic information
- Clear data usage explanations

## Support

If you or someone you know needs support:

- [The Trevor Project](https://www.thetrevorproject.org/): 1-866-488-7386
- [PFLAG](https://pflag.org/): Support for LGBTQ+ people and their families
- [GLAAD](https://www.glaad.org/): Media advocacy and resources

## License

This project is open source under the MIT License. Stories submitted remain the property of their anonymous authors.

---

Built with urgency, care, and hope for our community.