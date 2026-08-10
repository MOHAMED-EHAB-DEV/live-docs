"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          ref={containerRef}
          className="relative flex items-center justify-center min-h-screen bg-dark-100 overflow-hidden font-sans"
        >
          {/* Ambient red/orange glows for error vibe */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-red-600/10 rounded-full blur-[120px] animate-pulse duration-1000" />
          <div className="absolute bottom-0 left-0 w-100 h-100 bg-orange-500/10 rounded-full blur-[100px] animate-pulse duration-1000 delay-500" />

          <div
            ref={contentRef}
            className="relative z-10 flex flex-col items-center text-center p-10 max-w-lg mx-auto bg-dark-200/80 backdrop-blur-xl border border-red-500/20 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              System Fault
            </h1>

            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              We've encountered an unexpected anomaly in our servers. Our
              engineering team has been notified.
            </p>

            <div className="flex w-full gap-3">
              <Button
                variant="destructive"
                size="lg"
                className="flex-1 font-medium bg-red-500/20 text-white hover:bg-red-500/30"
                onClick={() => reset()}
              >
                Try Again
              </Button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-medium text-white border-white/20 hover:bg-white/5"
                >
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
