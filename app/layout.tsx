import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ENABLE_WAYIN_THEME } from "@/lib/theme-config";
import { VenueProvider } from "@/context/VenueContext";
// import { Analytics } from '@vercel/analytics/next'
import "./globals.css";

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WayIn - Discover Local Venues",
  description:
    "Discover and explore restaurants, bars, and venues near you with reviews and maps.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d3a4a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ENABLE_WAYIN_THEME ? "theme-wayin" : undefined}>
      <body className={`${_inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <VenueProvider>
          {children}
        </VenueProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
