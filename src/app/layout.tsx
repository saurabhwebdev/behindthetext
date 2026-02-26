import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const extendaBold = localFont({
  src: "../../public/fonts/Extenda-80-Peta-trial.ttf",
  variable: "--font-extenda-bold",
  display: "swap",
});

const extendaLight = localFont({
  src: "../../public/fonts/Extenda-40-Hecto-trial.ttf",
  variable: "--font-extenda-light",
  display: "swap",
});

const SITE_URL = "https://behindthetext.site";
const SITE_NAME = "BehindTheText";
const SITE_DESCRIPTION =
  "Place text behind any image instantly with AI-powered depth estimation. Free online tool — no signup, no uploads to servers. Works 100% in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Place Text Behind Any Image | Free Online Tool`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "text behind image",
    "text behind image online",
    "text behind image generator",
    "text behind image effect",
    "text behind object",
    "put text behind image",
    "place text behind image",
    "text behind subject",
    "depth text effect",
    "text overlay tool",
    "behind the text",
    "behindthetext",
    "photo text editor",
    "image text editor online",
    "free text behind image tool",
    "AI depth estimation",
    "text behind person",
    "text behind photo",
    "typography behind image",
    "creative text effect",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Place Text Behind Any Image`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Place text behind any image with AI depth estimation`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Place Text Behind Any Image`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@behindthetext",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${extendaBold.variable} ${extendaLight.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
