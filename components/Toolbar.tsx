"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useTheme, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "./ui/label";
import Search from "./Search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDocument } from "@/lib/actions/room.action";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createFolder } from "@/lib/actions/folders.action";

const sortOptions = [
  { label: "Alphabetical (A-Z)", value: "alphabetical-asc" },
  { label: "Alphabetical (Z-A)", value: "alphabetical-desc" },
  { label: "Date (Newest First)", value: "date-newest" },
  { label: "Date (Oldest First)", value: "date-oldest" },
  { label: "Most Viewed", value: "most-viewed" },
  { label: "Recently Edited", value: "recently-edited" },
];

const Toolbar = ({
  isDocuments,
  sortType,
  setSortType,
  isDropdownOpen,
  setIsDropdownOpen,
  author,
  setAuthor,
  search,
  setSearch,
  email,
  userId,
  selectedFolder,
}: {
  isDocuments: Boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  sortType: string;
  setSortType: Dispatch<SetStateAction<string>>;
  isDropdownOpen: Boolean;
  setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
  author: Boolean;
  setAuthor: Dispatch<SetStateAction<boolean>>;
  email: string;
  userId: string;
  selectedFolder: {
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  };
}) => {
  const [Open, setOpen] = useState(false);
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const [folderName, setFolderName] = useState("");

  const router = useRouter();

  const theme = useTheme();
  const lgScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const arrowImage = isDropdownOpen
    ? "/assets/icons/up-arrow.svg"
    : "/assets/icons/down-arrow.svg";
  const arrowImage2 = Open
    ? "/assets/icons/up-arrow.svg"
    : "/assets/icons/down-arrow.svg";

  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({ userId, email, selectedFolder });
      if (room) router.push(`/documents/${room.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const addFolderHandler = async () => {
    try {
      const folder = await createFolder({ email, name: folderName, selectedFolder });

      setFolderName("");
      setIsDialogOpened(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`w-full max-w-[730px] flex ${
        lgScreen ? "flex-row" : "flex-col"
      } items-center justify-evenly gap-1 ${
        isDocuments ? "border-none" : "border-[#2F2F33] border-b-0 border"
      } rounded-md`}
    >
      {lgScreen ? (
        <>
          <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
            <DropdownMenuTrigger className="flex border-0 items-center w-fit justify-between gap-2 px-4 py-2 focus:ring-transparent outline-none">
              <span>
                {sortOptions.find((option) => option.value === sortType)?.label}
              </span>
              <Image
                src={arrowImage}
                alt={isDropdownOpen ? "Dropdown Open" : "Dropdown Closed"}
                width={16}
                height={16}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortType(option.value)}
                  className="text-white"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Search search={search} setSearch={setSearch} />
          <div className="flex items-center gap-2 w-fit">
            <Checkbox
              checked={author as CheckedState}
              onCheckedChange={() => setAuthor((v) => !v)}
              id="author"
              className="data-[state=checked]:bg-slate-50 data-[state=checked]:text-slate-900 rounded-xl border-slate-200"
            />
            <Label htmlFor="author">Filtered by Author(You)</Label>
          </div>
          <DropdownMenu onOpenChange={(open) => setOpen(open)}>
            <DropdownMenuTrigger className="flex border-0 items-center w-fit justify-between gap-2 px-4 py-2 focus:ring-transparent outline-none">
              <span>
                <Image
                  src="/assets/icons/add.svg"
                  alt="add"
                  width={24}
                  height={24}
                />
              </span>
              <Image
                src={arrowImage2}
                alt={Open ? "Dropdown Open" : "Dropdown Closed"}
                width={16}
                height={16}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black">
              <Dialog
                open={isDialogOpened}
                onOpenChange={(open) => setIsDialogOpened(open)}
              >
                <DialogTrigger className="text-white w-full hover:text-black hover:bg-white text-base font-medium p-2 flex items-center gap-2">
                  <Image
                    src="/assets/icons/folder.svg"
                    alt="Folder Icon"
                    width={16}
                    height={16}
                  />
                  Folder
                </DialogTrigger>
                <DialogContent className="shad-dialog">
                  <DialogHeader>
                    <DialogTitle>Add Folder</DialogTitle>
                    <DialogDescription>
                      To add folder, please enter the name of the folder
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-start gap-2">
                    <Input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter Folder Name"
                      className="bg-slate-900 text-slate-50 w-3/4 self-start"
                    />
                    <Button
                      onClick={addFolderHandler}
                      className="w-1/4 self-end hover:bg-transparent"
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <DropdownMenuItem
                onClick={addDocumentHandler}
                className="text-white cursor-pointer text-base font-medium p-2 flex items-center justify-center gap-2"
              >
                <Image
                  src="/assets/icons/doc.svg"
                  alt="Document"
                  width={16}
                  height={16}
                />
                Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Search search={search} setSearch={setSearch} />
          <div className="flex items-center">
            <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
              <DropdownMenuTrigger className="flex border-0 items-center w-fit justify-between gap-2 px-4 py-2 focus:ring-transparent outline-none">
                <span>
                  {
                    sortOptions.find((option) => option.value === sortType)
                      ?.label
                  }
                </span>
                <Image
                  src={arrowImage}
                  alt={isDropdownOpen ? "Dropdown Open" : "Dropdown Closed"}
                  width={16}
                  height={16}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortType(option.value)}
                    className="text-white"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2 w-fit">
              <Checkbox
                checked={author as CheckedState}
                onCheckedChange={() => setAuthor((v) => !v)}
                id="author"
                className="data-[state=checked]:bg-slate-50 data-[state=checked]:text-slate-900 rounded-xl border-slate-200"
              />
              <Label htmlFor="author">Filtered by Author</Label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Toolbar;
