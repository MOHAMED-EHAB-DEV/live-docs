"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Search from "./Search";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import Loader from "./Loader";
import { toast } from "react-toastify";

const sortOptions = [
  { label: "Newest First", value: "date-newest" },
  { label: "Oldest First", value: "date-oldest" },
  { label: "Alphabetical (A-Z)", value: "alphabetical-asc" },
  { label: "Alphabetical (Z-A)", value: "alphabetical-desc" },
];

interface ToolbarProps {
  isDocuments: Boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  sortType: string;
  setSortType: Dispatch<SetStateAction<string>>;
  isDropdownOpen?: Boolean;
  setIsDropdownOpen?: Dispatch<SetStateAction<boolean>>;
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
  onClearFolder?: () => void;
  setData: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
  isFolderDialogOpen?: boolean;
  setIsFolderDialogOpen?: Dispatch<SetStateAction<boolean>>;
  onAddDocument?: () => void;
  docLoading?: boolean;
}

const Toolbar = ({
  search,
  setSearch,
  sortType,
  setSortType,
  author,
  setAuthor,
  email,
  userId,
  selectedFolder,
  onClearFolder,
  setData,
  isFolderDialogOpen: externalFolderDialogOpen,
  setIsFolderDialogOpen: externalSetFolderDialogOpen,
  onAddDocument,
  docLoading: externalDocLoading,
}: ToolbarProps) => {
  const router = useRouter();

  // Modal and Action state
  const [localFolderDialogOpen, setLocalFolderDialogOpen] = useState(false);
  const isFolderDialogOpen = externalFolderDialogOpen !== undefined ? externalFolderDialogOpen : localFolderDialogOpen;
  const setIsFolderDialogOpen = externalSetFolderDialogOpen || setLocalFolderDialogOpen;

  const [folderName, setFolderName] = useState("");
  const [folderLoading, setFolderLoading] = useState(false);
  const [localDocLoading, setLocalDocLoading] = useState(false);
  const docLoading = externalDocLoading !== undefined ? externalDocLoading : localDocLoading;
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const addDocumentHandler = async () => {
    if (onAddDocument) {
      onAddDocument();
      return;
    }
    setLocalDocLoading(true);
    try {
      const payload: any = { userId, email };
      if (selectedFolder?.folderId) {
        payload.folderId = selectedFolder.folderId;
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.document) {
        router.push(`/documents/${data.document._id}`);
      } else {
        toast.error(data.error || "Failed to create document");
      }
    } catch (error) {
      console.error("Create document error:", error);
      toast.error("Failed to create document");
    } finally {
      setLocalDocLoading(false);
    }
  };

  const addFolderHandler = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setFolderLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
          name: folderName.trim(),
          parentFolderId: selectedFolder?.folderId || null,
          parentFolderName: selectedFolder?.folderName || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setData((prev) => ({
          ...prev,
          folders: data.folders || [],
        }));
        toast.success(`Folder "${folderName.trim()}" created`);
        setFolderName("");
        setIsFolderDialogOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create folder");
      }
    } catch (err) {
      console.error("Create folder error:", err);
      toast.error("Failed to create folder");
    } finally {
      setFolderLoading(false);
    }
  };

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortType)?.label ||
    "Newest First";

  return (
    <div className="w-full max-w-182.5 flex flex-col gap-4 mb-4">
      {/* Top bar: Search + Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <Search search={search} setSearch={setSearch} className="w-full" />
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu open={addMenuOpen} onOpenChange={setAddMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                className="gradient-blue text-white text-sm font-semibold h-10 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition flex items-center gap-2"
                disabled={docLoading}
              >
                {docLoading ? (
                  <Loader text="Creating..." size={16} />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 transition-transform duration-200 ${
                        addMenuOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="bottom-right" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setAddMenuOpen(false);
                  addDocumentHandler();
                }}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/assets/icons/doc.svg"
                  alt="Doc"
                  width={16}
                  height={16}
                />
                <span>New Document</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setAddMenuOpen(false);
                  setIsFolderDialogOpen(true);
                }}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/assets/icons/folder.svg"
                  alt="Folder"
                  width={16}
                  height={16}
                />
                <span>New Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        {/* Customized Checkbox: Author Filter */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="author-filter"
            checked={Boolean(author)}
            onCheckedChange={(checked) => setAuthor(checked)}
            label="Created by me"
          />
          {selectedFolder?.folderName && (
            <div className="inline-flex items-center gap-1.5 ps-2.5 pe-1.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
              <Image
                src="/assets/icons/folder.svg"
                alt="folder"
                width={12}
                height={12}
              />
              <span className="max-w-35 truncate">{selectedFolder.folderName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFolder?.();
                }}
                className="p-0.5 rounded-full text-blue-300 hover:text-white hover:bg-blue-500/30 transition cursor-pointer"
                title="Remove folder filter"
                aria-label="Remove folder filter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Sort Selector with animations */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-400">Sort by:</span>
          <DropdownMenu open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-3 rounded-xl border border-dark-400 bg-dark-300/80 text-xs font-medium text-blue-100 hover:bg-dark-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
              >
                <span>{currentSortLabel}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    sortMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="bottom-right" className="w-48">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setSortType(option.value);
                    setSortMenuOpen(false);
                  }}
                  className={`flex items-center justify-between ${
                    sortType === option.value
                      ? "bg-blue-500/15 text-blue-400 font-medium"
                      : ""
                  }`}
                >
                  <span>{option.label}</span>
                  {sortType === option.value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-blue-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Folder Dialog (Top-level, does NOT unmount or close on typing) */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
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
              Create New Folder
            </DialogTitle>
            <p className="text-sm text-zinc-400">
              Organize your LiveDocs documents into structured folders.
            </p>
          </DialogHeader>

          <form onSubmit={addFolderHandler} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="folder-name-input"
                className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                Folder Name
              </label>
              <Input
                id="folder-name-input"
                type="text"
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Work Projects, Notes..."
                className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
              />
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-start">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFolderName("");
                  setIsFolderDialogOpen(false);
                }}
                className="w-full sm:w-auto bg-dark-400 text-white hover:bg-dark-500"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={folderLoading || !folderName.trim()}
                className="gradient-blue w-full sm:w-auto text-white"
              >
                {folderLoading ? (
                  <Loader text="Creating..." size={16} />
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Toolbar;
