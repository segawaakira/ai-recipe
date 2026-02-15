import { AuthGuard } from "@/components/auth-guard";
import { Toaster } from "@repo/ui/components/sonner";
import "@repo/ui/globals.css";
import { ThemeProvider } from "@repo/ui/providers/theme-provider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "./providers";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AIレシピ提案アプリ",
  description: "所有している食材からAIがおすすめレシピを提案します",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <AppProviders>
            <AuthGuard>{children}</AuthGuard>
          </AppProviders>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
