"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import DeveloperBadge from "@/components/DeveloperBadge";
import {
  heroData,
  comparisonData,
  bentoFeatures,
  techStackData,
  faqData,
} from "@/constants/landing";

export default function LandingPage() {
  const { user } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"collab" | "code" | "comments">(
    "collab",
  );
  const [demoCodeLang, setDemoCodeLang] = useState<
    "javascript" | "python" | "rust"
  >("javascript");

  // Simulated typing in Hero preview
  const [typedText, setTypedText] = useState(
    "Architecture Draft for Live Sync v2",
  );
  useEffect(() => {
    const full =
      "Building real-time distributed collaboration with sub-10ms CRDT synchronization...";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= full.length) {
        setTypedText(full.slice(0, idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-dark-100 min-h-screen text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
      {/* 1. Glassmorphism Top Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-dark-100/80 backdrop-blur-xl border-b border-dark-400/60 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="size-8 transition-transform group-hover:scale-110"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              Live<span className="text-blue-500">Docs</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold">
              v2.0
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-300">
          <a href="#features" className="hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-blue-400 transition-colors">
            Interactive Demo
          </a>
          <a
            href="#comparison"
            className="hover:text-blue-400 transition-colors"
          >
            Comparison
          </a>
          <a href="#tech" className="hover:text-blue-400 transition-colors">
            Architecture
          </a>
          <a href="#faq" className="hover:text-blue-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 h-9 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Dashboard →
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-300 hover:text-white h-9 px-3 cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 h-9 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section with Glowing Accents */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background glow halos */}
        <div className="absolute top-1/4 inset-s-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-160 h-96 sm:h-160 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 inset-e-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-8 shadow-sm">
          <span className="size-2 rounded-full bg-blue-400 animate-ping" />
          <span>{heroData.badge}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 max-w-5xl leading-[1.08]">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-400">
            {heroData.titleLine1}
          </span>{" "}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500">
            {heroData.titleLine2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mb-10 leading-relaxed">
          {heroData.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16 w-full sm:w-auto">
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
              >
                Open Workspace Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
                >
                  {heroData.ctaPrimary}
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-semibold border-dark-400 hover:bg-dark-300 text-gray-200 cursor-pointer"
                >
                  {heroData.ctaSecondary}
                </Button>
              </a>
            </>
          )}
        </div>

        {/* LIVE SIMULATED EDITOR MOCKUP */}
        <div className="w-full max-w-5xl rounded-2xl border border-dark-400/80 bg-dark-200/90 shadow-2xl backdrop-blur-2xl overflow-hidden text-start p-4 sm:p-6 transition-all duration-500 hover:border-blue-500/40 relative group">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-dark-400/80 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-medium text-gray-400 font-mono ms-2">
                realtime-sync-demo.doc
              </span>
            </div>

            {/* Active Collaborators Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                <div
                  className="size-7 rounded-full bg-blue-600 border-2 border-dark-200 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  title="Alex (Editing)"
                >
                  AL
                </div>
                <div
                  className="size-7 rounded-full bg-purple-600 border-2 border-dark-200 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  title="Sarah (Online)"
                >
                  SA
                </div>
                <div
                  className="size-7 rounded-full bg-emerald-600 border-2 border-dark-200 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  title="Mohammed (Owner)"
                >
                  MO
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-semibold">
                ● 3 Online
              </span>
            </div>
          </div>

          {/* Simulated Toolbar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-dark-300/80 rounded-xl border border-dark-400/60 mb-6 text-xs text-gray-300 overflow-x-auto">
            <span className="px-2 py-1 rounded bg-dark-400 font-semibold text-white">
              Paragraph
            </span>
            <span className="px-2 py-1 rounded hover:bg-dark-400/60">
              Heading 1
            </span>
            <div className="w-px h-4 bg-dark-400 mx-1" />
            <span className="p-1.5 rounded bg-blue-600 text-white font-bold">
              B
            </span>
            <span className="p-1.5 rounded hover:bg-dark-400/60 italic font-serif">
              I
            </span>
            <span className="p-1.5 rounded hover:bg-dark-400/60 underline">
              U
            </span>
            <span className="p-1.5 rounded hover:bg-dark-400/60 font-mono text-[10px]">
              &lt;/&gt;
            </span>
            <div className="w-px h-4 bg-dark-400 mx-1" />
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px]">
              JavaScript
            </span>
          </div>

          {/* Content Canvas */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{typedText}</span>
              <span className="inline-block w-2.5 h-6 bg-blue-400 animate-pulse" />
            </h2>

            {/* Blockquote with decorative styling */}
            <div className="p-3 border-s-4 border-blue-500 bg-blue-500/10 rounded-e-lg text-sm text-blue-100 italic">
              “Conflict-free synchronization guarantees zero data loss across
              concurrent editing sessions.”
            </div>

            {/* Code Block with Syntax Tokens */}
            <div className="rounded-xl border border-dark-400/80 bg-[#1e1e1e] p-4 font-mono text-xs overflow-x-auto text-gray-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 text-[11px] text-gray-400">
                <span className="text-blue-400 font-semibold">engine.ts</span>
                <span className="text-gray-400">VS Code Dark</span>
              </div>
              <pre className="leading-relaxed">
                <span className="text-[#569cd6] font-semibold">import</span>{" "}
                &#123; Doc, applyUpdate &#125;{" "}
                <span className="text-[#569cd6] font-semibold">from</span>{" "}
                <span className="text-[#ce9178]">&quot;yjs&quot;</span>;<br />
                <span className="text-[#569cd6] font-semibold">const</span> ydoc
                = <span className="text-[#569cd6] font-semibold">new</span>{" "}
                <span className="text-[#4ec9b0]">Doc</span>();
                <br />
                <span className="text-[#6a9955] italic">
                  &#47;&#47; Broadcast instant delta updates with sub-10ms
                  latency
                </span>
                <br />
                ydoc.<span className="text-[#dcdcaa]">on</span>(
                <span className="text-[#ce9178]">&apos;update&apos;</span>,
                (update) =&gt; socket.
                <span className="text-[#dcdcaa]">emit</span>(
                <span className="text-[#ce9178]">&apos;sync&apos;</span>,
                update));
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem vs. Solution Section */}
      <section
        id="comparison"
        className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-dark-400/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {comparisonData.title}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            {comparisonData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way Card */}
          <div className="p-8 rounded-2xl border border-red-500/20 bg-dark-200/50 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold mb-6">
                ✕ Traditional Experience
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                {comparisonData.oldWay.title}
              </h3>
              <ul className="space-y-4">
                {comparisonData.oldWay.points.map((pt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-400"
                  >
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">
                      ✕
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* New Way Card */}
          <div className="p-8 rounded-2xl border border-blue-500/40 bg-linear-to-br from-blue-900/20 to-dark-200/80 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-e-0 size-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                ✓ The Live Docs Way
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                {comparisonData.newWay.title}
              </h3>
              <ul className="space-y-4">
                {comparisonData.newWay.points.map((pt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-blue-100 font-medium"
                  >
                    <span className="text-blue-400 font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bento Grid Feature Showcase */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-dark-400/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Engineered for Modern Teams
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Every feature is crafted for speed, visual clarity, and frictionless
            collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bentoFeatures.map((item) => (
            <div
              key={item.id}
              className={`p-8 rounded-2xl border bg-dark-200/70 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${item.span} ${item.accent}`}
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-dark-400 text-xs font-mono font-semibold text-blue-300 mb-4">
                  {item.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Demo Tabs Playground */}
      <section
        id="demo"
        className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-dark-400/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Test Live Capabilities
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Explore interactive simulated features right inside your browser.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("collab")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "collab"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-dark-300 text-gray-400 hover:text-white"
            }`}
          >
            Multiplayer Presence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-dark-300 text-gray-400 hover:text-white"
            }`}
          >
            AST Code Highlighting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "comments"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-dark-300 text-gray-400 hover:text-white"
            }`}
          >
            Live Threaded Comments
          </button>
        </div>

        {/* Tab Content Preview Card */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl border border-dark-400 bg-dark-200/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {activeTab === "collab" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark-400">
                <span className="text-xs font-semibold text-blue-400">
                  Live Presence Simulation
                </span>
                <span className="text-xs text-green-400 font-mono">
                  Sync latency: 4ms
                </span>
              </div>
              <div className="p-4 rounded-xl bg-dark-300/80 border border-dark-400 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-blue-500 text-white text-[11px] font-bold">
                    Alex
                  </span>
                  <span className="text-xs text-gray-300 font-mono">
                    cursor pos: Line 14, Col 2
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500 text-white text-[11px] font-bold">
                    Sarah
                  </span>
                  <span className="text-xs text-gray-300 font-mono">
                    cursor pos: Line 22, Col 8
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Multiplayer edits stream over optimized binary WebSockets with
                  zero cursor jump.
                </p>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark-400">
                <span className="text-xs font-semibold text-blue-400">
                  Interactive Language Parser
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoCodeLang("javascript")}
                    className={`px-2 py-1 rounded text-xs font-mono ${demoCodeLang === "javascript" ? "bg-blue-600 text-white" : "bg-dark-400 text-gray-400"}`}
                  >
                    JS
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCodeLang("python")}
                    className={`px-2 py-1 rounded text-xs font-mono ${demoCodeLang === "python" ? "bg-blue-600 text-white" : "bg-dark-400 text-gray-400"}`}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCodeLang("rust")}
                    className={`px-2 py-1 rounded text-xs font-mono ${demoCodeLang === "rust" ? "bg-blue-600 text-white" : "bg-dark-400 text-gray-400"}`}
                  >
                    Rust
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#1e1e1e] font-mono text-xs text-gray-300">
                {demoCodeLang === "javascript" && (
                  <pre>
                    <span className="text-[#569cd6]">const</span> calculateSync
                    = (<span className="text-[#9cdcfe]">doc</span>) =&gt; doc.
                    <span className="text-[#dcdcaa]">getXmlFragment</span>(
                    <span className="text-[#ce9178]">&quot;content&quot;</span>
                    );
                  </pre>
                )}
                {demoCodeLang === "python" && (
                  <pre>
                    <span className="text-[#569cd6]">def</span>{" "}
                    <span className="text-[#dcdcaa]">calculate_sync</span>(
                    <span className="text-[#9cdcfe]">doc</span>):
                    <br /> <span className="text-[#569cd6]">return</span> doc.
                    <span className="text-[#dcdcaa]">get_xml_fragment</span>(
                    <span className="text-[#ce9178]">&quot;content&quot;</span>)
                  </pre>
                )}
                {demoCodeLang === "rust" && (
                  <pre>
                    <span className="text-[#569cd6]">fn</span>{" "}
                    <span className="text-[#dcdcaa]">calculate_sync</span>(
                    <span className="text-[#9cdcfe]">doc</span>: &amp;Doc) -&gt;{" "}
                    <span className="text-[#4ec9b0]">Result</span>
                    &lt;XmlFragment, Error&gt; &#123;
                    <br /> doc.
                    <span className="text-[#dcdcaa]">get_xml_fragment</span>(
                    <span className="text-[#ce9178]">&quot;content&quot;</span>)
                    <br />
                    &#125;
                  </pre>
                )}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark-400">
                <span className="text-xs font-semibold text-blue-400">
                  Real-Time Thread Simulation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                  2 Unread
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 bg-dark-300 rounded-lg border border-dark-400">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-300">
                      alex@company.com
                    </span>
                    <span className="text-[10px] text-gray-500">1 min ago</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Should we add syntax highlighting for Go and SQL as well?
                  </p>
                </div>
                <div className="p-3 bg-dark-300 rounded-lg border border-dark-400">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-300">
                      sarah@company.com
                    </span>
                    <span className="text-[10px] text-gray-500">Just now</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Already included in the latest AST parser update!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Modern Tech Stack & Architecture */}
      <section
        id="tech"
        className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-dark-400/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Built on Battle-Tested Tech
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Engineered for high concurrency, zero latency, and rock-solid
            persistence.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStackData.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-dark-200/80 border border-dark-400/80 flex flex-col items-center text-center justify-center hover:border-blue-500/50 transition-colors"
            >
              <span className="text-sm font-bold text-white mb-1">
                {item.name}
              </span>
              <span className="text-[11px] text-gray-400 leading-tight">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section
        id="faq"
        className="py-24 px-4 sm:px-6 max-w-4xl mx-auto border-t border-dark-400/60"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Everything you need to know about the Live Docs platform.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-dark-400/80 bg-dark-200/70 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 text-start font-semibold text-sm sm:text-base text-white flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <span className="text-blue-400 font-bold text-lg ms-4">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Final High-Converting CTA Section */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="p-10 sm:p-16 rounded-3xl border border-blue-500/40 bg-linear-to-br from-blue-900/30 via-dark-200 to-dark-100 backdrop-blur-2xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to Experience Instant Collaboration?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Create your first living document in seconds with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
                >
                  Go to Dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 cursor-pointer"
                  >
                    Start Collaborating Free
                  </Button>
                </Link>
                <a
                  href="https://mohammedehab.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-sm font-semibold border-dark-400 text-gray-300 hover:text-white hover:bg-dark-300 cursor-pointer"
                  >
                    Developer Portfolio ↗
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. Modern Footer with Mohammed's Portfolio Credit */}
      <footer className="border-t border-dark-400/60 py-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={20}
            height={20}
            className="size-5"
          />
          <span className="font-bold text-white">Live Docs</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://mohammedehab.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 transition-colors group"
          >
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>
              Designed & Built by{" "}
              <strong className="text-white">Mohammed</strong>
            </span>
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
      </footer>

      {/* Floating Developer Badge (Main Page) */}
      <DeveloperBadge variant="floating" />
    </div>
  );
}
