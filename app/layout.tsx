import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Survival Pending - Share Your Story",
  description: "A safe space for LGBTQ+ individuals to share their stories anonymously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@300,301,400,401,500,501,600,601,700,701,800,801&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative">
            <main className="flex-grow pb-16">
              {children}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-40">
              <div className="px-4 md:px-24 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 gap-2 md:gap-0">
                <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                  <span className="hidden md:inline">MMXXV</span>
                  <span 
                    className="inline-flex items-center text-xs md:text-sm font-black tracking-tight"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    Survival Pending
                    <span className="inline-block w-[2px] h-[0.8em] bg-current ml-[2px] animate-blink" />
                  </span>
                  <span className="hidden md:inline">All Rights Reserved.</span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Terms
                  </Link>
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
