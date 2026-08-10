"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import "./globals.css";

const MagneticElement = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const { clientX, clientY } = e;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      const radius = 200;

      if (distance < radius) {
        const pullStrength = 0.5;
        setPosition({
          x: distanceX * pullStrength,
          y: distanceY * pullStrength,
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition:
          position.x === 0 && position.y === 0
            ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
            : "transform 0.1s linear",
      }}
    >
      {children}
    </div>
  );
};

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 30 - 15,
        y: (e.clientY / window.innerHeight) * 30 - 15,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen min-w-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden px-4">
      <title>Page Not Found | MHD Store Premium Templates</title>
      {/* Background ambient light */}
      <div
        className="absolute w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: isMounted
            ? `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
            : "translate(0px, 0px)",
        }}
      />

      <div className="relative z-10 text-center w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* 404 Container */}
        <div
          className="flex items-center justify-center gap-2 md:gap-8 mb-12 transition-transform duration-300 ease-out select-none"
          style={{
            transform: isMounted
              ? `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`
              : "translate(0px, 0px)",
          }}
        >
          {/* Left 4 */}
          <MagneticElement>
            <span className="block text-[120px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-600 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform duration-300 cursor-default">
              4
            </span>
          </MagneticElement>

          {/* Creative '0' */}
          <MagneticElement className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center shrink-0">
            {/* Outer rotating ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(168, 85, 247, 0.1)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#paint-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="120 144"
                className="animate-[spin_3s_linear_infinite]"
                style={{ transformOrigin: "center" }}
              />
              <defs>
                <linearGradient
                  id="paint-gradient"
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                >
                  <stop stopColor="#c084fc" />
                  <stop offset="0.5" stopColor="#d946ef" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner rotating shapes */}
            <svg
              className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] animate-[spin_12s_linear_infinite_reverse]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="url(#inner-gradient)"
                strokeWidth="2"
                strokeDasharray="20 10 5 10"
              />
              <defs>
                <linearGradient
                  id="inner-gradient"
                  x1="100"
                  y1="100"
                  x2="0"
                  y2="0"
                >
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#e879f9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Core glow */}
            <div className="absolute w-6 h-6 md:w-10 md:h-10 bg-fuchsia-500 rounded-full animate-ping opacity-60 mix-blend-screen" />
            <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-white rounded-full shadow-[0_0_30px_10px_rgba(217,70,239,0.8)]" />
          </MagneticElement>

          {/* Right 4 */}
          <MagneticElement>
            <span className="block text-[120px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-bl from-purple-400 via-fuchsia-500 to-indigo-600 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-110 transition-transform duration-300 cursor-default">
              4
            </span>
          </MagneticElement>
        </div>

        {/* Text Content */}
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Lost in Space
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
            The page you are looking for has drifted into the void, or perhaps
            it never existed at all.
          </p>

          {/* Action Button */}
          <div className="pt-8">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Inner shine */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <span className="relative flex items-center gap-3">
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Return to Base
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
    </div>
  );
}
