"use client";

import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { cn, dateConverter } from "@/lib/utils";
import Toolbar from "@/components/Toolbar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "./ui/Input";
import EmptyState from "./EmptyState";
import DocumentActions from "./DocumentActions";
import FolderActions from "./FolderActions";
import DeleteFolderModel from "./DeleteFolderModel";
import { useUser } from "@/context/UserContext";
import { useSocket } from "./editor/SocketProvider";

const Documents = ({
  rDocuments,
}: {
  rDocuments: { documents: any[]; folders: any[] };
}) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const router = useRouter();

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const [sourceData, setSourceData] = useState<{
    documents: any[];
    folders: any[];
  }>({
    documents: rDocuments.documents || [],
    folders: rDocuments.folders || [],
  });

  const [roomDocuments, setRoomDocuments] = useState<{
    documents: any[];
    folders: any[];
  }>({
    documents: rDocuments.documents || [],
    folders: rDocuments.folders || [],
  });

  const [sortType, setSortType] = useState("date-newest");
  const [author, setAuthor] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedFolder, setSelectedFolder] = useState<{
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  }>({
    folderId: "",
    authorId: "",
    folderName: "",
    parentId: "",
  });

  const addDocumentHandler = async () => {
    if (!user?.email || !user?._id) return;
    setDocLoading(true);
    try {
      const payload: any = { userId: user._id, email: user.email };
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
      setDocLoading(false);
    }
  };

  useEffect(() => {
    setSourceData({
      documents: rDocuments.documents || [],
      folders: rDocuments.folders || [],
    });
  }, [rDocuments]);

  const refetchDocuments = useCallback(async () => {
    if (!user?.email || !user?._id) return;
    try {
      const res = await fetch(
        `/api/documents?email=${encodeURIComponent(user.email)}&userId=${user._id}`
      );
      const data = await res.json();
      if (data.success && data.documents) {
        setSourceData((prev) => ({
          ...prev,
          documents: data.documents,
        }));
      }
    } catch (err) {
      console.error("Failed to refetch documents:", err);
    }
  }, [user?.email, user?._id]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = () => {
      refetchDocuments();
    };
    (socket as any).on("new_notification", handleNewNotification);
    return () => {
      (socket as any).off("new_notification", handleNewNotification);
    };
  }, [socket, refetchDocuments]);

  useEffect(() => {
    let updatedDocuments = [...(sourceData.documents || [])];
    let updatedFolders = [...(sourceData.folders || [])];

    if (author) {
      updatedDocuments = updatedDocuments.filter(
        (doc) => doc.authorEmail === user?.email
      );
    }

    if (search) {
      const query = search.toLowerCase();
      updatedDocuments = updatedDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      );
      updatedFolders = updatedFolders.filter((folder) =>
        folder.name.toLowerCase().includes(query)
      );
    }

    switch (sortType) {
      case "alphabetical-asc":
        updatedDocuments = updatedDocuments.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        updatedFolders = updatedFolders.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
      case "alphabetical-desc":
        updatedDocuments = updatedDocuments.sort((a, b) =>
          b.title.localeCompare(a.title)
        );
        updatedFolders = updatedFolders.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;
      case "date-newest":
        updatedDocuments = updatedDocuments.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );
        updatedFolders = updatedFolders.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );
        break;
      case "date-oldest":
        updatedDocuments = updatedDocuments.sort(
          (a, b) =>
            new Date(a.updatedAt || a.createdAt).getTime() -
            new Date(b.updatedAt || b.createdAt).getTime()
        );
        updatedFolders = updatedFolders.sort(
          (a, b) =>
            new Date(a.updatedAt || a.createdAt).getTime() -
            new Date(b.updatedAt || b.createdAt).getTime()
        );
        break;
      default:
        break;
    }

    setRoomDocuments({ documents: updatedDocuments, folders: updatedFolders });
  }, [sortType, author, search, user?.email, sourceData]);

  const handleFolderClick = (folder: any) => {
    setSelectedFolder((prevSelected) =>
      prevSelected.folderId === folder.id
        ? { folderId: "", authorId: "", folderName: "", parentId: "" }
        : {
            folderId: folder.id,
            authorId: folder.authorId,
            folderName: folder.name,
          }
    );
    toggleFolder(folder.id);
  };

  const handleSubfolderClick = (subFolder: any, parentFolder: any) => {
    setSelectedFolder((prevSelected) =>
      prevSelected.folderId === subFolder.id
        ? { folderId: "", authorId: "", folderName: "", parentId: "" }
        : {
            folderId: subFolder.id,
            authorId: subFolder.authorId,
            folderName: subFolder.name,
            parentId: parentFolder.id,
          }
    );
    toggleFolder(subFolder.id);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  if (!user) return null;

  const hasItems =
    roomDocuments.documents.length > 0 || roomDocuments.folders.length > 0;

  return (
    <div className="document-list-container w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center">
      {/* Title Header */}
      <div className="w-full max-w-182.5 flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Documents & Folders
        </h2>
        <span className="text-xs text-zinc-400 font-medium">
          {roomDocuments.documents.length} document
          {roomDocuments.documents.length !== 1 ? "s" : ""}
          {roomDocuments.folders.length > 0 &&
            `, ${roomDocuments.folders.length} folder${
              roomDocuments.folders.length !== 1 ? "s" : ""
            }`}
        </span>
      </div>

      {/* Toolbar */}
      <Toolbar
        isDocuments={hasItems}
        sortType={sortType}
        setSortType={setSortType}
        author={author}
        setAuthor={setAuthor}
        search={search}
        setSearch={setSearch}
        userId={user?._id as unknown as string}
        email={user?.email}
        selectedFolder={selectedFolder}
        onClearFolder={() =>
          setSelectedFolder({
            folderId: "",
            authorId: "",
            folderName: "",
            parentId: "",
          })
        }
        setData={setSourceData}
        isFolderDialogOpen={isFolderDialogOpen}
        setIsFolderDialogOpen={setIsFolderDialogOpen}
        onAddDocument={addDocumentHandler}
        docLoading={docLoading}
      />

      {/* Document and Folder list */}
      {hasItems ? (
        <div className="flex flex-col w-full max-w-182.5 gap-2.5">
          {/* Folders */}
          {roomDocuments.folders.length > 0 && (
            <ul className="folder-ul m-0 flex flex-col gap-1.5">
              {roomDocuments.folders.map((folder: any) => {
                const folderKey = folder.id || folder._id?.toString() || folder.name;
                return (
                  <FolderListItem
                    folder={folder}
                    key={folderKey}
                    expandedFolders={expandedFolders}
                    handleFolderClick={handleFolderClick}
                    handleSubFolderClick={handleSubfolderClick}
                    selectedFolder={selectedFolder}
                    isSubFolder={false}
                    setFolders={setSourceData}
                  />
                );
              })}
            </ul>
          )}

          {/* Documents */}
          <ul className="document-ul m-0 flex flex-col gap-2">
            {roomDocuments.documents.map(
              ({ _id, id, title, createdAt, updatedAt, collaborators, authorEmail }: any) => (
                <DocumentListItem
                  id={_id || id}
                  title={title}
                  createdAt={createdAt}
                  updatedAt={updatedAt}
                  collaborators={collaborators}
                  authorEmail={authorEmail}
                  key={_id || id}
                  setDocuments={setSourceData}
                />
              )
            )}
          </ul>
        </div>
      ) : search ? (
        <EmptyState
          icon="search"
          title="No matching documents"
          description={`We couldn't find any documents or folders matching "${search}".`}
          actionText="Clear Search"
          onAction={() => setSearch("")}
        />
      ) : author ? (
        <EmptyState
          icon="doc"
          title="No personal documents"
          description="You haven't created any documents yet or none match your filter."
          actionText="Create Document"
          onAction={addDocumentHandler}
          secondaryActionText="Show All Documents"
          onSecondaryAction={() => setAuthor(false)}
          isLoading={docLoading}
        />
      ) : selectedFolder?.folderName ? (
        <EmptyState
          icon="folder"
          title={`"${selectedFolder.folderName}" is empty`}
          description="Get started by creating a new document or subfolder inside this folder."
          actionText="New Document"
          onAction={addDocumentHandler}
          secondaryActionText="New Subfolder"
          onSecondaryAction={() => setIsFolderDialogOpen(true)}
          isLoading={docLoading}
        />
      ) : (
        <EmptyState
          icon="doc"
          title="No documents or folders yet"
          description="Create your first document to start collaborating, or organize your workspace with folders."
          actionText="Create Document"
          onAction={addDocumentHandler}
          secondaryActionText="Create Folder"
          onSecondaryAction={() => setIsFolderDialogOpen(true)}
          isLoading={docLoading}
        />
      )}
    </div>
  );
};

const FolderListItem = ({
  folder,
  handleFolderClick,
  expandedFolders,
  handleSubFolderClick,
  selectedFolder,
  isSubFolder,
  parentFolder,
  setFolders,
}: {
  folder: any;
  handleFolderClick: (folder: any, parentFolder?: any) => void;
  expandedFolders: {
    [key: string]: boolean;
  };
  handleSubFolderClick: (subFolder: any, parentFolder: any) => void;
  selectedFolder: {
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  } | null;
  isSubFolder: Boolean;
  parentFolder?: any;
  setFolders: Dispatch<
    SetStateAction<{
      documents: any[];
      folders: any[];
    }>
  >;
}) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState(folder?.name);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        if (folderName !== folder?.name) {
          const res = await fetch(`/api/folders/${folder?.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: folderName }),
          });

          if (res.ok) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        if (folderName !== folder?.name) {
          fetch(`/api/folders/${folder?.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: folderName }),
          });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [folderName, folder?.id, folder?.name]);

  const currentFolderId = folder?.id || folder?._id?.toString();

  return (
    <li className="w-full">
      <Collapsible
        open={expandedFolders[currentFolderId]}
        onOpenChange={() =>
          isSubFolder
            ? handleFolderClick(folder, parentFolder)
            : handleFolderClick(folder)
        }
      >
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-between gap-3 p-3.5 rounded-xl bg-dark-200/80 hover:bg-dark-300/80 border border-white/5 transition cursor-pointer group shadow-sm",
              currentFolderId === selectedFolder?.folderId &&
                "border-blue-500/40 bg-blue-500/10"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  expandedFolders[currentFolderId] ? "rotate-90" : ""
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                  clipRule="evenodd"
                />
              </svg>

              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Image
                  src="/assets/icons/folder.svg"
                  alt="folder"
                  width={16}
                  height={16}
                />
              </div>

              <div
                ref={containerRef}
                onClick={(e) => editing && e.stopPropagation()}
                className="flex items-center gap-2 min-w-0"
              >
                {editing && !loading ? (
                  <Input
                    type="text"
                    value={folderName}
                    ref={inputRef}
                    autoFocus
                    placeholder="Enter folder title"
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={updateTitleHandler}
                    className="h-7 text-sm bg-dark-350 border border-white/10 px-2 rounded-md"
                  />
                ) : (
                  <p className="truncate text-sm font-medium text-white">
                    {folderName}
                  </p>
                )}

                {!editing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition p-1"
                  >
                    <Image
                      src="/assets/icons/edit.svg"
                      alt="edit"
                      width={12}
                      height={12}
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Normal/Desktop: Show Updated At, Mobile: Hidden */}
              <p className="hidden sm:block text-xs text-zinc-400">
                Updated {dateConverter(folder.updatedAt || folder.createdAt)}
              </p>
              <FolderActions
                folderId={folder?.id}
                folderName={folder?.name || folderName}
                authorEmail={folder?.authorId}
                onStartRename={() => setEditing(true)}
                setFolders={setFolders}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="subfolder-document-ul ps-6 flex flex-col gap-1.5 mt-1.5">
            {folder?.documents?.length || folder?.subFolders?.length ? (
              <>
                {folder.subFolders?.map((subfolder: any) => {
                  const subKey = subfolder.id || subfolder._id?.toString() || subfolder.name;
                  return (
                    <FolderListItem
                      key={subKey}
                      folder={subfolder}
                      handleFolderClick={handleSubFolderClick}
                      expandedFolders={expandedFolders}
                      handleSubFolderClick={handleSubFolderClick}
                      selectedFolder={selectedFolder}
                      isSubFolder={true}
                      parentFolder={folder}
                      setFolders={setFolders}
                    />
                  );
                })}

                {folder.documents?.map((doc: any) => (
                  <DocumentListItem
                    key={doc._id || doc.id}
                    id={doc._id || doc.id}
                    title={doc.title}
                    createdAt={doc.createdAt}
                    updatedAt={doc.updatedAt}
                    collaborators={doc.collaborators}
                    authorEmail={doc.authorEmail}
                    folderId={folder.id}
                    setDocuments={setFolders}
                  />
                ))}
              </>
            ) : (
              <div className="ps-2 py-1">
                <EmptyState
                  icon="folder"
                  title="Folder is empty"
                  description="No documents or subfolders inside this folder."
                />
              </div>
            )}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

const DocumentListItem = ({
  id,
  title,
  createdAt,
  updatedAt,
  collaborators,
  authorEmail,
  folderId,
  setDocuments,
}: any) => {
  return (
    <li className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-dark-200/80 hover:bg-dark-300/80 border border-white/5 transition group shadow-sm">
      <Link
        href={`/documents/${id}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <div className="p-1.5 rounded-lg bg-dark-350 text-blue-400 group-hover:bg-blue-500/10 transition shrink-0">
          <Image
            src="/assets/icons/doc.svg"
            alt="document"
            width={18}
            height={18}
          />
        </div>
        <p className="truncate text-sm font-medium text-white group-hover:text-blue-300 transition">
          {title || "Untitled Document"}
        </p>
      </Link>

      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile: Removed/Hidden date | Normal Desktop: Show Updated At */}
        <p className="hidden sm:block text-xs text-zinc-400 font-normal">
          Updated {dateConverter(updatedAt || createdAt)}
        </p>

        {/* More Actions Dropdown (Share, Open, Delete) */}
        <DocumentActions
          documentId={id}
          documentTitle={title || "Untitled Document"}
          folderId={folderId}
          setDocuments={setDocuments}
        />
      </div>
    </li>
  );
};

export default Documents;
