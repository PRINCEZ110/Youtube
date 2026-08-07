import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { WatchLaterProvider } from "@/context/WatchLaterContext";
import { HistoryProvider } from "@/context/HistoryContext";
import { LikedProvider } from "@/context/LikedContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A YouTube clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ReduxProvider>
          <ThemeProvider>
            <WatchLaterProvider>
              <HistoryProvider>
                <LikedProvider>
                  <PlaylistProvider>
                <div id="main-content" className="flex flex-1 flex-col">
                  {children}
                </div>
                  </PlaylistProvider>
                </LikedProvider>
              </HistoryProvider>
            </WatchLaterProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
