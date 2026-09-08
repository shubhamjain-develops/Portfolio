import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/data/content";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

/**
 * Fonts are self-hosted rather than pulled from Google. Nothing leaves the
 * visitor's browser to a third party, there's no extra DNS/TLS round trip on
 * first paint, and the site builds fine with no network access.
 */
const display = localFont({
  src: [
    { path: "../fonts/Sora-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Sora-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Sora-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const sans = localFont({
  src: [
    { path: "../fonts/IBMPlexSans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/IBMPlexSans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/IBMPlexSans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const mono = localFont({
  src: [
    { path: "../fonts/IBMPlexMono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/IBMPlexMono-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/IBMPlexMono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const description = `${site.role} in ${site.location}. ${site.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description,
  keywords: [
    "Shubham Jain",
    "Full-Stack Engineer",
    "AI-Native Engineering",
    ".NET",
    "Angular",
    "PostgreSQL",
    "Azure",
    "Bengaluru",
    "Software Engineer",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    title: `${site.name} — ${site.role}`,
    description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#080b10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-medium focus:text-accent-ink"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
