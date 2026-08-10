"use client";

import Image from "next/image";
import UpdateProfile from "./UpdateProfile";
import { capitalizeFirstLetter } from "@/lib/utils";
import { IUser } from "@/lib/models/user";

const Profile = ({ user }: { user: IUser }) => {
  const provider = user?.provider || "google";

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col text-start gap-1 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Profile Details
        </h2>
        <p className="text-sm text-zinc-400">
          Manage your personal information, avatar, and public profile details.
        </p>
      </div>

      {/* Edit Profile Form */}
      <UpdateProfile user={user} />

      {/* Connected Accounts Section */}
      <div className="flex flex-col text-start gap-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-base font-semibold text-white">Connected Accounts</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Accounts and identity providers linked to your LiveDocs profile.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-350/50 border border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <Image
                src={`/assets/icons/${provider}-logo.svg`}
                alt={`${provider} logo`}
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-sm font-medium text-white">
                {capitalizeFirstLetter(provider)}
              </span>
              <span className="text-xs text-zinc-400">
                {user?.email}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
