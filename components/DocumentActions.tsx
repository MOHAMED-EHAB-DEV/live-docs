"use client";

import { useState, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
import { Input } from "@/components/ui/input";
import Loader from "./Loader";
import { useUser } from "@/context/UserContext";

interface DocumentActionsProps {
  documentId: string;
  documentTitle: string;
  creatorId?: string;
  currentUserType?: "editor" | "viewer";
  folderId?: string;
  setDocuments: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
}

function removeDocFromTree(folders: any[], docId: string): any[] {
  return folders.map((f) => ({
    ...f,
    documents: (f.documents || []).filter(
      (d: any) => d._id !== docId && d.id !== docId
    ),
    subFolders: f.subFolders ? removeDocFromTree(f.subFolders, docId) : [],
  }));
}

const DocumentActions = ({
  documentId,
  documentTitle,
  creatorId,
  currentUserType = "editor",
  folderId,
  setDocuments,
}: DocumentActionsProps) => {
  const { user } = useUser();

  // Dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Share Dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [fetchingCollaborators, setFetchingCollaborators] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCollaborators = async () => {
    setFetchingCollaborators(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/access`);
      const data = await res.json();
      if (data.collaborators) {
        setCollaborators(data.collaborators);
      }
    } catch (error) {
      console.error("Failed to load collaborators", error);
    } finally {
      setFetchingCollaborators(false);
    }
  };

  const handleOpenShare = () => {
    setDropdownOpen(false);
    setShareOpen(true);
    fetchCollaborators();
  };

  const handleShareSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shareEmail.trim()) return;

    setShareLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: shareEmail.trim().toLowerCase(),
          userType,
          addedBy: user,
          updatedBy: user,
        }),
      });
      const data = await res.json();
      if (res.ok && data.collaborators) {
        setCollaborators(data.collaborators);
        toast.success(`Shared document with ${shareEmail}`);
        setShareEmail("");
      } else {
        toast.error(data.error || "Failed to share document");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to share document");
    } finally {
      setShareLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      setDocuments((prev) => ({
        ...prev,
        documents: prev.documents.filter(
          (doc) => doc._id !== documentId && doc.id !== documentId
        ),
        folders: removeDocFromTree(prev.folders || [], documentId),
      }));

      toast.success("Document deleted");
      setDeleteOpen(false);
    } catch (error) {
      console.error("Delete document error:", error);
      toast.error("Failed to delete document");
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
            <span className="sr-only">Open actions menu</span>
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
          <DropdownMenuItem asChild>
            <Link
              href={`/documents/${documentId}`}
              className="flex items-center gap-2.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-blue-400"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Document
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleOpenShare}
            className="flex items-center gap-2.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-emerald-400"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </DropdownMenuItem>

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
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="shad-dialog">
          <DialogHeader className="flex flex-col gap-1 items-start text-start">
            <DialogTitle className="text-xl font-bold text-white">
              Manage Access
            </DialogTitle>
            <p className="text-zinc-400 text-sm font-normal">
              Select which users can view and edit &ldquo;{documentTitle}&rdquo;
            </p>
          </DialogHeader>

          <form onSubmit={handleShareSubmit} className="flex flex-col gap-4 mt-2">
            <label htmlFor="share-email" className="text-blue-100 block text-xs font-medium text-start">
              Invite by Email
            </label>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center rounded-xl bg-dark-400 pe-1">
                <Input
                  id="share-email"
                  placeholder="Enter user email..."
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="share-input"
                />
                <UserTypeSelector
                  userType={userType}
                  setUserType={setUserType}
                />
              </div>
              <Button
                type="submit"
                disabled={shareLoading || !shareEmail.trim()}
                className="gradient-blue flex h-full gap-1 px-5 cursor-pointer text-xs font-semibold"
              >
                {shareLoading ? "Inviting..." : "Invite"}
              </Button>
            </div>

            <div className="flex flex-col my-2 space-y-2">
              {fetchingCollaborators ? (
                <div className="py-6 space-y-2">
                  <div className="h-10 bg-dark-400/60 rounded-xl animate-pulse" />
                  <div className="h-10 bg-dark-400/60 rounded-xl animate-pulse" />
                </div>
              ) : (
                <ul className="flex flex-col space-y-2 max-h-56 overflow-y-auto">
                  {collaborators.map((collaborator) => (
                    <Collaborator
                      key={
                        collaborator.user?._id ||
                        collaborator.user?.email ||
                        collaborator._id ||
                        collaborator.email
                      }
                      documentId={documentId}
                      documentTitle={documentTitle}
                      creatorId={creatorId || ""}
                      collaborator={collaborator}
                      onRemove={(removedEmail) => {
                        setCollaborators((prev) =>
                          prev.filter(
                            (c) =>
                              (c.user?.email || c.email) !== removedEmail
                          )
                        );
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
              Delete Document
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-400 text-start">
            Are you sure you want to delete &ldquo;{documentTitle}&rdquo;? This action cannot be undone.
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
              onClick={handleDeleteSubmit}
              className="gradient-red w-full sm:w-auto text-white"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader text="Deleting..." size={16} />
              ) : (
                "Delete Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentActions;
