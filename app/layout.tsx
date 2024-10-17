import { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { Analytics } from "@vercel/analytics/react";

import { ourFileRouter } from "@/app/api/uploadthing/core";

import "./globals.css";

import { cn } from "@/lib/utils";
import Provider from "./Provider";
import SessionProviderC from "./SessionProvider";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LiveDocs",
  description: "Your go-to collaborative editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderC>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <Provider>
            <Analytics />
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            {children}
            <Toaster />
          </Provider>
        </body>
      </html>
    </SessionProviderC>
  );
}
