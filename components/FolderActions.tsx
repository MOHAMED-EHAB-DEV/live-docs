"use client";

import { useState, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

interface FolderActionsProps {
  folderId: string;
  folderName: string;
  authorEmail: string;
  onStartRename?: () => void;
  setFolders: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
}

const FolderActions = ({
  folderId,
  folderName,
  authorEmail,
  onStartRename,
  setFolders,
}: FolderActionsProps) => {
  const router = useRouter();
  const { user } = useUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add Document loading
  const [docLoading, setDocLoading] = useState(false);

  // Add Subfolder Modal
  const [subfolderOpen, setSubfolderOpen] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [subfolderLoading, setSubfolderLoading] = useState(false);

  // Delete Folder Modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddDocument = async () => {
    if (!user?.email) return;
    setDocLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          email: user.email,
          folderId,
        }),
      });

      const data = await res.json();
      if (data.success && data.document) {
        toast.success(`Document created in "${folderName}"`);
        router.push(`/documents/${data.document._id}`);
      } else {
        toast.error(data.error || "Failed to create document");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create document");
    } finally {
      setDocLoading(false);
    }
  };

  const handleCreateSubfolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subfolderName.trim() || !user?.email) return;

    setSubfolderLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subfolderName.trim(),
          email: user.email,
          parentFolderId: folderId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.folders) {
        setFolders((prev) => ({
          ...prev,
          folders: data.folders,
        }));
        toast.success(`Subfolder "${subfolderName.trim()}" created`);
        setSubfolderName("");
        setSubfolderOpen(false);
      } else {
        toast.error(data.error || "Failed to create subfolder");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create subfolder");
    } finally {
      setSubfolderLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/folders/${folderId}?email=${encodeURIComponent(authorEmail || user?.email || "")}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (res.ok) {
        setFolders((prev) => ({
          ...prev,
          folders: data.folders || [],
        }));
        toast.success(`Folder "${folderName}" deleted`);
        setDeleteOpen(false);
      } else {
        toast.error(data.error || "Failed to delete folder");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete folder");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <span className="sr-only">Open folder actions menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="bottom-right" className="w-48">
          <DropdownMenuItem
            onClick={handleAddDocument}
            disabled={docLoading}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/assets/icons/doc.svg"
              alt="doc"
              width={16}
              height={16}
            />
            <span>{docLoading ? "Creating doc..." : "Add Document"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setSubfolderOpen(true);
            }}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/assets/icons/folder.svg"
              alt="folder"
              width={16}
              height={16}
            />
            <span>Add Folder</span>
          </DropdownMenuItem>

          {onStartRename && (
            <DropdownMenuItem
              onClick={() => {
                setDropdownOpen(false);
                onStartRename();
              }}
              className="flex items-center gap-2.5"
            >
              <Image
                src="/assets/icons/edit.svg"
                alt="rename"
                width={14}
                height={14}
              />
              <span>Rename</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setDeleteOpen(true);
            }}
            className="flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-red-400"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            <span>Delete Folder</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Subfolder Dialog */}
      <Dialog open={subfolderOpen} onOpenChange={setSubfolderOpen}>
        <DialogContent className="shad-dialog">
          <DialogHeader className="flex flex-col gap-1 items-start text-start">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 mb-2">
              <Image
                src="/assets/icons/folder.svg"
                alt="Folder"
                width={28}
                height={28}
              />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Add Folder inside &ldquo;{folderName}&rdquo;
            </DialogTitle>
            <p className="text-sm text-zinc-400">
              Create a nested subfolder for organized document management.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreateSubfolder} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="subfolder-name"
                className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                Folder Name
              </label>
              <Input
                id="subfolder-name"
                type="text"
                autoFocus
                value={subfolderName}
                onChange={(e) => setSubfolderName(e.target.value)}
                placeholder="e.g. Sprint 1, Research..."
                className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
              />
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-start">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSubfolderOpen(false)}
                className="w-full sm:w-auto bg-dark-400 text-white hover:bg-dark-500"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={subfolderLoading || !subfolderName.trim()}
                className="gradient-blue w-full sm:w-auto text-white"
              >
                {subfolderLoading ? (
                  <Loader text="Creating..." size={16} />
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="shad-dialog">
          <DialogHeader className="flex flex-col gap-1 items-start text-start">
            <Image
              src="/assets/icons/delete-modal.svg"
              alt="delete"
              width={48}
              height={48}
              className="mb-3"
            />
            <DialogTitle className="text-xl font-bold text-white">
              Delete Folder
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-400 text-start">
            Are you sure you want to delete &ldquo;{folderName}&rdquo;? All nested documents and subfolders inside will be removed.
          </p>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              className="w-full sm:w-auto bg-dark-400 text-white hover:bg-dark-500"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteFolder}
              className="gradient-red w-full sm:w-auto text-white"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader text="Deleting..." size={16} />
              ) : (
                "Permanently Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FolderActions;
