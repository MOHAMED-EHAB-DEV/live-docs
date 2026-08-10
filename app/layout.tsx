import { Metadata } from "next";
import { Poppins as FontSans } from "next/font/google";

import "./globals.css";

import { cn } from "@/lib/utils";
import Provider from "./Provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const fontSans = FontSans({
  weight: ["400", "500", "600", "700", "800", "900"],
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn("min-h-screen font-sans antialiased overflow-x-hidden", fontSans.variable)}
      >
        <Provider>
          <ToastContainer position="bottom-right" theme="dark" />
          {children}
        </Provider>
      </body>
    </html>
  );
}
