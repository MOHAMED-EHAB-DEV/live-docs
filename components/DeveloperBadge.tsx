"use client";

import React from "react";

interface DeveloperBadgeProps {
  variant?: "floating" | "footer";
  className?: string;
}

export const DeveloperBadge = ({ variant = "floating", className = "" }: DeveloperBadgeProps) => {
  if (variant === "footer") {
    return (
      <div className={`w-full py-6 flex items-center justify-center text-xs text-gray-500 gap-2 border-t border-dark-400/40 mt-8 ${className}`}>
        <span>Live Docs Workspace</span>
        <span>•</span>
        <a
          href="https://mohammedehab.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors group"
        >
          Crafted by Mohammed
          <svg
            className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <a
      href="https://mohammedehab.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 inset-e-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-200/80 hover:bg-dark-200 backdrop-blur-xl border border-dark-400/80 hover:border-blue-500/50 text-xs text-gray-400 hover:text-white shadow-2xl transition-all duration-200 hover:scale-105 group ${className}`}
      title="Visit Mohammed's Portfolio"
    >
      <span className="size-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
      <span>
        Made by <strong className="text-gray-200 font-semibold group-hover:text-blue-400 transition-colors">Mohammed</strong>
      </span>
      <svg
        className="size-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </a>
  );
};

export default DeveloperBadge;
