import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { MetaPixel } from "@/components/MetaPixel";
import "./globals.css";

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
        {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative">
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
