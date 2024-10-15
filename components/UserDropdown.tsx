"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import Security from "./Security";

const UserDropdown = ({ user }: { user: IUser }) => {
  const [open, setOpen] = useState(false);
  const [sectionOpened, setSectionOpened] = useState("profile");

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/sign-in" });
  }, []);

  const renderSectionContent = () => {
    switch (sectionOpened) {
      case "profile":
        return <Profile user={user} />;
      case "security":
        return <Security user={user} />;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Image
          src={
            user.image
              ? (user.image as string)
              : "/assets/icons/userProfile.png"
          }
          alt={user.name}
          width={34}
          height={34}
          className="object-cover rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[23.5rem] bg-[#1f1f23] border-[#ffffff12]">
        <DropdownMenuLabel className="flex items-center justify-start py-4 px-5 gap-4">
          <Image
            src={
              user.image
                ? (user.image as string)
                : "/assets/icons/userProfile.png"
            }
            alt={user.name}
            width={34}
            height={34}
            className="object-cover rounded-full"
          />
          <div className="flex flex-col items-center justify-start w-full gap-1">
            <span className="text-base font-medium text-white w-full">
              {user.name}
            </span>
            <span className="text-base font-normal text-white w-full">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2F2F33] h-[0.5px]" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="text-[#AAAAAB] hover:bg-white hover:text-black px-5 py-4 transition rounded-sm w-full inline-flex items-center font-medium text-base gap-4">
            <Image
              src="/assets/icons/settings.svg"
              alt="Settings Icon"
              width={24}
              height={24}
            />
            Manage account
          </DialogTrigger>
          <DialogContent className="sm:w-[100rem] sm:max-w-6xl w-[21.5rem] max-w-96 sm:m-0 flex items-center justify-center flex-col sm:flex-row p-0 h-[90%] gap-0 bg-transparent">
            <Sidebar Open={sectionOpened} setOpen={setSectionOpened} />

            <div className="bg-[#1f1f23] sm:w-3/4 w-full h-full rounded-r-md sm:rounded-e-md">
              {renderSectionContent()}
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="py-4 cursor-pointer text-[#AAAAAB] w-full px-5 inline-flex items-center font-medium text-base gap-4"
        >
          <Image
            src="/assets/icons/signOut.svg"
            alt="SignOut Icon"
            width={24}
            height={24}
          />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
