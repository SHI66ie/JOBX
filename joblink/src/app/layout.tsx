import type { Metadata } from "next";
import { Geist_Mono, Google_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

const googleSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://jomponline.com",
  ),
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_TAGLINE} Pursue remote career paths, connect with top companies, and access AI-powered recruitment tools on ${APP_NAME}.`,
  keywords: ["Remote jobs", "Software engineer jobs", "Tech hiring", "Global talent", "JOMP", "Job portal"],
  authors: [{ name: "JOMP Technologies" }],
  creator: "JOMP",
  publisher: "JOMP",
  icons: {
    icon: "/brand/JOMP_Monogram_Navy.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jomponline.com",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: `${APP_TAGLINE} Connect with top talent and companies on JOMP.`,
    siteName: APP_NAME,
    images: [
      {
        url: "/brand/JOMP_Monogram_Navy.svg",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - ${APP_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: `${APP_TAGLINE} Connect with top talent and companies on JOMP.`,
    creator: "@jomponline",
    images: ["/brand/JOMP_Monogram_Navy.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${googleSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
