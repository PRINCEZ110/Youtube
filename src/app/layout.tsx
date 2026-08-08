import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { WatchLaterProvider } from "@/context/WatchLaterContext";
import { LikedProvider } from "@/context/LikedContext";
import { HistoryProvider } from "@/context/HistoryContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { FeedPrefsProvider } from "@/context/FeedPrefsContext";
import { CustomFeedsProvider } from "@/context/CustomFeedsContext";
import ThemeInit from "@/components/providers/ThemeInit";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
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
  description: "A YouTube clone powered by the real YouTube Data API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeInit />
      </head>
      <body className="min-h-full flex flex-col pb-14 lg:pb-0">
        <ReduxProvider>
          <ThemeProvider>
            <WatchLaterProvider>
              <LikedProvider>
<HistoryProvider>
                <SubscriptionsProvider>
                  <PlaybackProvider>
                  <FeedPrefsProvider>
                  <CustomFeedsProvider>{children}</CustomFeedsProvider>
                  </FeedPrefsProvider>
                  </PlaybackProvider>
                </SubscriptionsProvider>
              </HistoryProvider>
              </LikedProvider>
            </WatchLaterProvider>
          </ThemeProvider>
        </ReduxProvider>
        <MobileBottomNav />
      </body>
    </html>
  );
}