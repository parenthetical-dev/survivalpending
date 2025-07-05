import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { MetaPixelWrapper } from "@/components/MetaPixelWrapper";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAnalyticsWrapper } from "@/components/GoogleAnalyticsWrapper";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"


const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Survival Pending | Document Your Truth. Before They Erase It.",
  description: "An anonymous platform for LGBTQ+ people to document their stories and experiences. Create an undeniable record of our lives, struggles, and resilience in this critical moment.",
  openGraph: {
    title: "Survival Pending | Document Your Truth. Before They Erase It.",
    description: "An anonymous platform for LGBTQ+ people to document their stories and experiences. Create an undeniable record of our lives, struggles, and resilience in this critical moment.",
    images: [
      {
        url: "/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Survival Pending | Document Your Truth. Before They Erase It.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Survival Pending | Document Your Truth. Before They Erase It.",
    description: "An anonymous platform for LGBTQ+ people to document their stories and experiences. Create an undeniable record of our lives, struggles, and resilience in this critical moment.",
    images: ["/ogimage.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId = process.env.META_PIXEL_ID;
  
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@300,301,400,401,500,501,600,601,700,701,800,801&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${jetbrainsMono.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <GoogleAnalytics />
        <Analytics/>
        {metaPixelId && <MetaPixelWrapper pixelId={metaPixelId} />}
        <AuthProvider>
          <GoogleAnalyticsWrapper />
          {/* Progress Pride Flag Bar */}
          <div className="fixed top-0 left-0 right-0 h-1 z-50 flex">
            {/* Classic rainbow stripes */}
            <div className="flex-1 bg-[#e40303]" /> {/* Red */}
            <div className="flex-1 bg-[#ff8c00]" /> {/* Orange */}
            <div className="flex-1 bg-[#ffed00]" /> {/* Yellow */}
            <div className="flex-1 bg-[#008026]" /> {/* Green */}
            <div className="flex-1 bg-[#004cff]" /> {/* Blue */}
            <div className="flex-1 bg-[#750787]" /> {/* Purple */}
            {/* Progress chevron colors */}
            <div className="flex-1 bg-[#5bcefa]" /> {/* Light blue (trans) */}
            <div className="flex-1 bg-[#f5a9b8]" /> {/* Pink (trans) */}
            <div className="flex-1 bg-white" /> {/* White (trans) */}
            <div className="flex-1 bg-[#784F17]" /> {/* Brown */}
            <div className="flex-1 bg-black" /> {/* Black */}
          </div>
          <div className="min-h-screen flex flex-col relative pt-1">
            <main className="flex-grow pb-0 md:pb-16">
              {children}
            </main>
            <footer className="hidden md:block fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-40">
              <div className="px-24 py-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>MMXXV</span>
                  <span 
                    className="inline-flex items-center text-sm font-black tracking-tight"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    Survival Pending
                    <span className="inline-block w-[2px] h-[0.8em] bg-current ml-[2px] animate-blink" />
                  </span>
                  <span>All Rights Reserved.</span>
                </div>
                <div className="flex items-center gap-6">
                  <a 
                    href="https://app.termly.io/policy-viewer/policy.html?policyUUID=61228498-eb21-4048-bf3a-00a9518e88c3" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a 
                    href="https://app.termly.io/policy-viewer/policy.html?policyUUID=69f226cd-4d1f-4513-b13e-7b7060379aac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
