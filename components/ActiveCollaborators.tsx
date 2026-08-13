"use client";

import Image from "next/image";
import { useSocket } from "./editor/SocketProvider";
import { Tooltip } from "@/components/ui/tooltip";

const ActiveCollaborators = ({ authorId }: { authorId: string }) => {
  const { activeUsers } = useSocket();

  if (!activeUsers || activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <ul className="flex items-center pe-0.5">
        {activeUsers.map(({ email, name, avatar, image }, index) => {
          const displayName = name || (email ? email.split("@")[0] : "User");
          const userImg = image || avatar || "/assets/images/doc.png";
          const isCurrent = authorId === email;

          return (
            <li
              key={email || index}
              className="-ms-2 first:ms-0 relative transition-all duration-200 ease-out hover:ms-1 hover:me-1 hover:z-30 hover:scale-105"
            >
              <Tooltip
                position="bottom"
                className="px-2 py-0.5 text-[11px] font-medium z-160"
                content={
                  <p>
                    {isCurrent ? `${displayName} (You)` : displayName}
                  </p>
                }
              >
                <div className="relative size-7 rounded-full ring-2 ring-dark-200 overflow-hidden bg-dark-400 flex items-center justify-center cursor-pointer shadow-sm transition-all duration-200">
                  {userImg && !userImg.includes("doc.png") ? (
                    <Image
                      src={userImg}
                      alt={displayName}
                      width={28}
                      height={28}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-white uppercase">
                      {displayName.charAt(0)}
                    </span>
                  )}
                </div>
              </Tooltip>
            </li>
          );
        })}
      </ul>

      {/* Online Count Badge */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold shadow-xs select-none">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
        <span>{activeUsers.length} <span className="hidden sm:inline">online</span></span>
      </div>
    </div>
  );
};

export default ActiveCollaborators;
