import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Anton: heavy condensed grotesque for the drop wordmark and posters.
const displayFont = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

// Archivo: workhorse body face, same family spirit as the display without competing.
const bodyFont = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
});

// Spline Sans Mono: care-label / product data face.
const monoFont = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Base URL for absolute asset links in the embed/OG metadata. Falls back to a
// placeholder for local dev; set NEXT_PUBLIC_APP_URL to the real domain.
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hoodie-drop.example";

// Farcaster mini app embed. When the app URL is shared in a cast, the host
// reads this tag to render a launch card.
// Docs: https://miniapps.farcaster.xyz/docs/guides/sharing
const miniappEmbed = {
  version: "1",
  imageUrl: `${appUrl}/embed.png`,
  button: {
    title: "Play Hoodie Drop",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: "Hoodie Drop",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#1a1a1d",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Hoodie Drop",
  description: "Catch coins, dodge rug bags, climb the ledger.",
  openGraph: {
    title: "Hoodie Drop",
    description: "Catch coins, dodge rug bags, climb the ledger.",
    images: ["/embed.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniappEmbed),
    // Kept for backward compatibility with older Farcaster clients.
    "fc:frame": JSON.stringify(miniappEmbed),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#16130f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full overflow-hidden`}
    >
      <body className="min-h-full overflow-hidden flex flex-col bg-bone text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
