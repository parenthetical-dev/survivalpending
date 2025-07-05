import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { MetaPixelWrapper } from "@/components/MetaPixelWrapper";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAnalyticsWrapper } from "@/components/GoogleAnalyticsWrapper";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import FooterSection from "@/components/layout/FooterSection";


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
          <div className="min-h-screen flex flex-col relative">
            <main className="flex-grow pb-0 lg:pb-16">
              {children}
            </main>
            <FooterSection />
          </div>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
