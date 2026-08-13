"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

function removeDocFromTree(folders: any[], docId: string): any[] {
  return folders.map((f) => ({
    ...f,
    documents: (f.documents || []).filter(
      (d: any) => d._id !== docId && d.id !== docId
    ),
    subFolders: f.subFolders ? removeDocFromTree(f.subFolders, docId) : [],
  }));
}

const DeleteModel = ({
  documentId,
  folderId,
  setDocuments,
  isDashboard,
}: {
  documentId: string;
  folderId?: string;
  setDocuments: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
  isDashboard: Boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteDocumentHandler = async () => {
    setLoading(true);

    try {
      // Calling our Next.js API route to delete the document
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      if (isDashboard) {
        setDocuments((prev) => {
          return {
            ...prev,
            documents: prev.documents.filter((doc) => doc._id !== documentId && doc.id !== documentId),
            folders: removeDocFromTree(prev.folders || [], documentId),
          };
        });
      }

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
          <DialogTitle className="text-xl font-bold">Delete document</DialogTitle>
        </DialogHeader>
        
        <p className="text-zinc-400">
          Are you sure you want to delete this document? This action cannot
          be undone.
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
            onClick={deleteDocumentHandler}
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

export default DeleteModel;

