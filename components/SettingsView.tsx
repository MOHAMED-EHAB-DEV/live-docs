"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Profile from "./Profile";
import Security from "./Security";
import Loader from "./Loader";

interface SettingsViewProps {
  initialTab?: "profile" | "security";
}

const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = "profile" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const tabQuery = searchParams.get("tab");
  const defaultTab =
    initialTab ||
    (tabQuery === "security" || pathname.includes("/security")
      ? "security"
      : "profile");

  const [activeTab, setActiveTab] = useState<"profile" | "security">(defaultTab);

  useEffect(() => {
    if (pathname.includes("/security") || tabQuery === "security") {
      setActiveTab("security");
    } else if (pathname.includes("/profile") || tabQuery === "profile") {
      setActiveTab("profile");
    }
  }, [pathname, tabQuery]);

  const handleTabChange = (tab: "profile" | "security") => {
    setActiveTab(tab);
    if (pathname === "/settings") {
      router.push(`/settings?tab=${tab}`, { scroll: false });
    } else {
      router.push(`/settings/${tab}`, { scroll: false });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader text="Loading account settings..." size={32} />
      </div>
    );
  }

  const userImage = user.image
    ? (user.image as string)
    : "/assets/icons/userProfile.png";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition w-fit group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col text-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage your personal information, avatar, connected accounts, and security preferences.
            </p>
          </div>

          {/* User mini badge */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-dark-200/80 border border-white/10 w-fit">
            <Image
              src={userImage}
              alt={user.name || "User"}
              width={36}
              height={36}
              className="h-9 w-9 object-cover rounded-full ring-2 ring-blue-500/30"
            />
            <div className="flex flex-col text-start min-w-0">
              <span className="text-xs font-semibold text-white truncate max-w-35">
                {user.name}
              </span>
              <span className="text-[11px] text-zinc-400 truncate max-w-35">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar / Tabs */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-2 p-2 rounded-2xl bg-dark-200/60 backdrop-blur-xl border border-white/10 overflow-x-auto lg:overflow-visible">
          <button
            type="button"
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-start shrink-0 lg:shrink ${
              activeTab === "profile"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-5 h-5 ${
                activeTab === "profile" ? "text-blue-400" : "text-zinc-400"
              }`}
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="flex flex-col">
              <span>Profile Details</span>
              <span className="text-[11px] text-zinc-500 hidden lg:block">
                Name, photo, connected auth
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-start shrink-0 lg:shrink ${
              activeTab === "security"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-5 h-5 ${
                activeTab === "security" ? "text-blue-400" : "text-zinc-400"
              }`}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div className="flex flex-col">
              <span>Security & Privacy</span>
              <span className="text-[11px] text-zinc-500 hidden lg:block">
                Authentication, danger zone
              </span>
            </div>
          </button>
        </aside>

        {/* Content Pane */}
        <main className="lg:col-span-9 p-6 sm:p-8 rounded-2xl bg-dark-200/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          {activeTab === "profile" ? (
            <Profile user={user} />
          ) : (
            <Security user={user} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsView;
