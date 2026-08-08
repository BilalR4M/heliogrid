import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const display = IBM_Plex_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const hud = IBM_Plex_Mono({
  variable: "--font-hud",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HelioGrid Complex",
  description:
    "A fictional 2.1GW flagship solar facility, built as an interactive 3D/VR portfolio experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${hud.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-terminal-bg font-sans text-terminal-text">
        {children}
      </body>
    </html>
  );
}
