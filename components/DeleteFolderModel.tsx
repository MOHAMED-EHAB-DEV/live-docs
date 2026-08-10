"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const DeleteFolderModel = ({
  folderId,
  email,
  setFolders,
}: {
  folderId: string;
  email: string;
  setFolders: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteFolderHandler = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/folders/${folderId}?email=${email}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      const data = await response.json();

      setFolders((prev) => {
        return {
          ...prev,
          folders: data.folders || [],
        };
      });

      setOpen(false);
    } catch (error) {
      console.log("Error notif:", error);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="min-w-9 rounded-xl p-2 transition-all"
        >
          <Image
            src="/assets/icons/delete.svg"
            alt="delete"
            width={20}
            height={20}
            className="mt-1"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader className="flex flex-col gap-1 items-start">
          <Image
            src="/assets/icons/delete-modal.svg"
            alt="delete"
            width={48}
            height={48}
            className="mb-4"
          />
          <DialogTitle className="text-xl font-bold">Delete Folder</DialogTitle>
        </DialogHeader>
        
        <p className="text-zinc-400">
          Are you sure you want to delete this folder? This action cannot be
          undone (All Its Documents will be deleted).
        </p>

        <DialogFooter className="mt-5 sm:justify-start">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto bg-dark-400 text-white"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={deleteFolderHandler}
            className="gradient-red w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFolderModel;

