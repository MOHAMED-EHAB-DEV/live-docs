"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFolder } from "@/lib/actions/folders.action";

const DeleteFolderModel = ({
  folderId,
  email,
  setFolders
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
      const folders = await deleteFolder({ folderId, email, isSubOperation: false });
      
      setFolders((prev) => {
        return {
          ...prev,
          folders,
        }
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
        <Button className="min-w-9 rounded-xl bg-transparent p-2 transition-all">
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
        <DialogHeader>
          <Image
            src="/assets/icons/delete-modal.svg"
            alt="delete"
            width={48}
            height={48}
            className="mb-4"
          />
          <DialogTitle>Delete Folder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this folder? This action cannot be
            undone(All Its Documents will be deleted).
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5">
          <DialogClose asChild className="w-full bg-dark-400 text-white">
            Cancel
          </DialogClose>

          <Button
            variant="destructive"
            onClick={deleteFolderHandler}
            className="gradient-red w-full"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFolderModel;
