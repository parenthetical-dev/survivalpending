'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ContactModal from '@/components/developer/ContactModal';
import {
  ArrowLeft,
  Terminal,
  Book,
  GitBranch,
  Lock,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Rocket,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
} from 'lucide-react';

const navItems = [
  {
    id: 'quickstart',
    label: 'Quick Start',
    icon: Rocket,
    description: 'Get up and running',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Book,
    description: 'Technical overview',
  },
  {
    id: 'contributing',
    label: 'Contributing',
    icon: Users,
    description: 'How to help',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Best practices',
  },
  {
    id: 'license',
    label: 'License',
    icon: Lock,
    description: 'Terms and usage',
  },
];

export default function DeveloperPage() {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ children, language = 'bash', copyText }: { children: string, language?: string, copyText?: string }) => (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{children}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(copyText || children, 'code')}
      >
        {copiedSection === 'code' ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  // Navigation Component
  const DeveloperNav = () => (
    <nav className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-[120px]">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full group flex items-start gap-3 rounded-lg px-3 py-3 transition-all text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isActive && 'bg-gray-100 dark:bg-gray-800',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 mt-0.5 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
                  )}
                />
                <div className="space-y-1">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight transition-colors',
                      isActive
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100',
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      'text-xs leading-tight transition-colors',
                      isActive
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400',
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* GitHub Link */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <a
            href="https://github.com/yourusername/survivalpending"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors w-full text-left"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px] md:pt-[80px]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex gap-8">
            {/* Left navigation */}
            <DeveloperNav />

            {/* Main content */}
            <div className="flex-1">
              {/* Header */}
              <div className="space-y-4 mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
                  Help build the platform protecting LGBTQ+ voices.
                </h1>
              </div>

              {/* Content sections */}
              {activeSection === 'quickstart' && (
                <div className="space-y-8">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8 space-y-4">
                    <p className="text-base sm:text-lg leading-relaxed">
                      Survival Pending is open source software built with urgency and care.
                      Every contribution helps protect and amplify LGBTQ+ voices during critical times.
                    </p>
                    <p className="text-lg sm:text-xl font-bold">
                      Your code could help someone share their story safely.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="font-bold text-lg">Getting Started</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">Prerequisites</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          <li>Node.js 18+ and npm</li>
                          <li>PostgreSQL database (we recommend Neon)</li>
                          <li>Required API keys (see Environment Setup)</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">1. Clone the repository</h3>
                        <CodeBlock>
{`git clone https://github.com/yourusername/survivalpending.git
cd survivalpending`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">2. Install dependencies</h3>
                        <CodeBlock>npm install</CodeBlock>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">3. Set up environment variables</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Create a `.env.local` file:
                        </p>
                        <CodeBlock language="env">
{`# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="generate-a-secure-secret"

# AI Services
ANTHROPIC_API_KEY="your-claude-api-key"
GROQ_API_KEY="your-groq-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"

# Security
TURNSTILE_SECRET_KEY="your-cloudflare-turnstile-key"

# Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">4. Initialize the database</h3>
                        <CodeBlock>
{`npx prisma generate
npx prisma db push`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">5. Run the development server</h3>
                        <CodeBlock>npm run dev</CodeBlock>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Open <Link href="http://localhost:3000" className="text-blue-600 hover:underline">http://localhost:3000</Link> to see the application.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h2 className="font-bold text-lg">Available Scripts</h2>
                    </div>
                    <CodeBlock language="bash">
{`npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run sync:dev    # Sync development data
npm run sync:prod   # Sync production data`}
                    </CodeBlock>
                  </div>
                </div>
              )}

              {activeSection === 'architecture' && (
                <div className="space-y-8">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
                    <h2 className="font-bold text-lg mb-4">Tech Stack</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Frontend</h3>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Next.js 15 with App Router</li>
                          <li>• TypeScript for type safety</li>
                          <li>• Tailwind CSS for styling</li>
                          <li>• shadcn/ui component library</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Backend</h3>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• PostgreSQL with Prisma ORM</li>
                          <li>• JWT authentication</li>
                          <li>• Vercel Edge Functions</li>
                          <li>• Sanity CMS (optional)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">AI Integration</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <strong>Claude 3.5 Sonnet</strong> - Story refinement while preserving authentic voice
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <strong>ElevenLabs</strong> - Text-to-speech for anonymous audio generation
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <strong>Groq</strong> - Fast username generation
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Project Structure</h2>
                    <CodeBlock language="plaintext">
{`survivalpending/
├── app/                    # Next.js app router pages
│   ├── (authenticated)/    # Protected routes
│   ├── api/               # API endpoints
│   └── ...                # Public pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── story/            # Story creation flow
│   ├── safety/           # Safety features
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── scripts/              # Deployment scripts`}
                    </CodeBlock>
                  </div>
                </div>
              )}

              {activeSection === 'contributing' && (
                <div className="space-y-8">
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 sm:p-8">
                    <h2 className="font-bold text-lg mb-4">Our Mission</h2>
                    <p className="text-base leading-relaxed">
                      Before contributing, understand that Survival Pending is a safe space for LGBTQ+ individuals
                      to share their stories anonymously. Every contribution helps protect and amplify these voices.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Code of Conduct</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Respect the sensitive nature of the project</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Prioritize user safety and privacy in all decisions</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Be inclusive and welcoming to all contributors</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Listen to feedback from LGBTQ+ community members</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">High Priority</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Accessibility improvements</li>
                        <li>• Security enhancements</li>
                        <li>• Crisis support features</li>
                        <li>• Performance optimizations</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                      <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3">Medium Priority</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Internationalization</li>
                        <li>• UI/UX improvements</li>
                        <li>• Documentation</li>
                        <li>• Testing coverage</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">What NOT to Do</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>Remove or weaken any privacy/security features</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>Add tracking that could identify users</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>Modify the anonymous authentication system</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>Use real user data in examples or tests</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-8">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 sm:p-8">
                    <h2 className="font-bold text-lg mb-4">Security is Critical</h2>
                    <p className="text-base leading-relaxed">
                      Given the sensitive nature of this platform, security is our top priority.
                      Every feature must be designed with user safety in mind.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Security Features</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Anonymous Authentication</strong> - No email required, auto-generated usernames
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Quick Exit</strong> - Press ESC 3 times to immediately leave the site
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Content Moderation</strong> - AI pre-screening and human review
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Encrypted Storage</strong> - All sensitive data is encrypted
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Best Practices</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Never log sensitive information</div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Always validate and sanitize user input</div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Use environment variables for secrets</div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>Follow OWASP security guidelines</div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Reporting Security Issues</h2>
                    <p className="text-base mb-4">
                      If you discover a security vulnerability, please report it responsibly:
                    </p>
                    <a href="mailto:security@survivalpending.com">
                      <Button>
                        Report Security Issue
                      </Button>
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Do not create public issues for security problems.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'license' && (
                <div className="space-y-8">
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 sm:p-8">
                    <h2 className="font-bold text-lg mb-4">Modified MIT License</h2>
                    <p className="text-base leading-relaxed">
                      This project uses a custom license that allows contributions but prevents commercial derivatives
                      to protect the mission and community.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">✅ You CAN:</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Contribute to this project</li>
                        <li>• Use for personal/educational purposes</li>
                        <li>• Deploy your own instance for your community</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">❌ You CANNOT:</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Create commercial derivatives</li>
                        <li>• Remove attribution</li>
                        <li>• Use for harmful purposes</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h2 className="font-bold text-lg mb-4">Additional Terms</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>User-submitted content remains the property of anonymous authors</div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>The name "Survival Pending" requires permission for use</div>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>Deployments must maintain privacy and safety standards</div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <p className="text-base mb-4">
                      For questions about commercial licensing or community deployments:
                    </p>
                    <a href="mailto:license@survivalpending.com">
                      <Button variant="outline">
                        Contact About Licensing
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}