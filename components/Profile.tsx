import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import UpdateProfile from "./UpdateProfile";
import { capitalizeFirstLetter } from "@/lib/utils";

const Profile = ({ user }: { user: IUser }) => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="w-full h-full px-6 py-7 flex flex-col items-start">
      <h1 className="text-white font-bold text-2xl m-0">Profile Details</h1>
      <DropdownMenuSeparator className="h-[1px] w-full bg-[#2F2F33] my-4" />
      <div className="flex flex-col items-center text-left gap-1 w-full h-fit">
        <h4 className="text-base font-medium w-full m-0">Profile</h4>
        {editing ? (
          <div className="flex flex-col gap-3 justify-start items-center py-4 px-5 pl-7 rounded-lg border-solid border-[#ffffff12] border-[1px] w-full h-fit">
            <div className="flex items-center justify-between gap-3 w-full">
              <h3 className="text-white font-bold text-base w-full sm:text-left text-center">
                Update Profile
              </h3>
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={() => setEditing(false)}
              />
            </div>
            <UpdateProfile user={user} setEditing={setEditing} />
          </div>
        ) : (
          <div className="flex items-center w-full pr-2 gap-5 justify-between">
            <div className="flex items-center justify-center gap-3 px-3 py-2">
              <Image
                src={
                  user.image
                    ? (user.image as string)
                    : "/assets/icons/userProfile.png"
                }
                alt={user.name}
                width={24}
                height={24}
                className="object-cover rounded-full"
              />
              <span className="font-medium text-sm sm:text-base text-white truncate">
                {user.name as string}
              </span>
            </div>
            <Button
              onClick={() => setEditing(true)}
              className="text-[#3374ff] bg-transparent hover:bg-[#ffffff12] rounded-[0.375rem] text-base font-medium py-3 w-fit"
            >
              Update Profile
            </Button>
          </div>
        )}
      </div>
      <DropdownMenuSeparator className="h-[1px] w-full bg-[#2F2F33] my-4" />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <h3 className="text-white font-bold text-base m-0">Connected accounts</h3>
        <div className="flex items-center justify-center gap-2">
          <Image
            src={`/assets/icons/${user?.provider}-logo.svg`}
            alt="Google Icon"
            width={16}
            height={16}
          />
          <p className="text-white text-base font-normal">
            {capitalizeFirstLetter(user?.provider as string)}
          </p>
          <span className="text-base text-[#ffffffa6] font-normal truncate">
            • {user?.email}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
