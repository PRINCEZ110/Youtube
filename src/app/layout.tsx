import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { WatchLaterProvider } from "@/context/WatchLaterContext";
import { HistoryProvider } from "@/context/HistoryContext";
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
        <ReduxProvider>
          <ThemeProvider>
            <WatchLaterProvider>
              <HistoryProvider>{children}</HistoryProvider>
            </WatchLaterProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
