"use client";

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";

import { cn, dateConverter } from "@/lib/utils";
import DeleteModel from "@/components/DeleteModel";
import Toolbar from "@/components/Toolbar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DeleteFolderModel from "./DeleteFolderModel";
import { Input } from "./ui/input";
import { updateFolder } from "@/lib/actions/folders.action";

const Documents = ({
  rDocuments,
  user,
}: {
  rDocuments: { documents: any[]; folders: any[] };
  user: IUser;
}) => {
  const [roomDocuments, setRoomDocuments] = useState<{
    documents: any[];
    folders: any[];
  }>({ documents: rDocuments.documents, folders: rDocuments.folders });

  const [sortType, setSortType] = useState("date-newest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  useEffect(() => {
    let updatedDocuments = rDocuments.documents || [];
    let updatedFolders = rDocuments.folders || [];

    if (author) {
      updatedDocuments = updatedDocuments.filter(
        (doc) => doc.metadata.email === user.email
      );
    }

    if (search) {
      updatedDocuments = updatedDocuments.filter((doc) =>
        doc.metadata.title.toLowerCase().includes(search.toLowerCase())
      );
      updatedFolders = updatedFolders.filter((folder) =>
        folder.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortType) {
      case "alphabetical-asc":
        updatedDocuments = updatedDocuments.sort((a, b) =>
          a.metadata.title.localeCompare(b.metadata.title)
        );
        updatedFolders = updatedFolders.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
      case "alphabetical-desc":
        updatedDocuments = updatedDocuments.sort((a, b) =>
          b.metadata.title.localeCompare(a.metadata.title)
        );
        updatedFolders = updatedFolders.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;
      case "date-newest":
        updatedDocuments = updatedDocuments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        updatedFolders = updatedFolders.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case "date-oldest":
        updatedDocuments = updatedDocuments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        updatedFolders = updatedFolders.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      default:
        break;
    }

    setRoomDocuments({ documents: updatedDocuments, folders: updatedFolders });
  }, [sortType, author, search, user._id]);

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

  return (
    <>
      {roomDocuments.documents.length > 0 ||
      roomDocuments.folders.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All Documents and Folders</h3>
          </div>
          <Toolbar
            isDocuments={true}
            sortType={sortType}
            setSortType={setSortType}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            author={author}
            setAuthor={setAuthor}
            search={search}
            setSearch={setSearch}
            userId={user._id as string}
            email={user.email}
            selectedFolder={selectedFolder}
            setData={setRoomDocuments}
          />

          <div className="flex flex-col w-full max-w-[730px] gap-2">
            <ul className="folder-ul">
              {roomDocuments.folders.map((folder: any) => (
                <FolderListItem
                  folder={folder}
                  key={folder.id}
                  expandedFolders={expandedFolders}
                  handleFolderClick={handleFolderClick}
                  handleSubFolderClick={handleSubfolderClick}
                  selectedFolder={selectedFolder}
                  isSubFolder={false}
                  setFolders={setRoomDocuments}
                />
              ))}
            </ul>
            <ul className="document-ul">
              {roomDocuments.documents.map(
                ({ id, metadata, createdAt, usersAccesses }: any) => (
                  <DocumentListItem
                    id={id}
                    metadata={metadata}
                    createdAt={createdAt}
                    usersAccesses={usersAccesses}
                    key={id}
                    setDocuments={setRoomDocuments}
                  />
                )
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-[730px]">
          <div className="document-list-title mb-2">
            <h3 className="text-28-semibold">All Documents and Folders</h3>
          </div>
          <Toolbar
            isDocuments={false}
            sortType={sortType}
            setSortType={setSortType}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            author={author}
            setAuthor={setAuthor}
            search={search}
            setSearch={setSearch}
            userId={user._id as string}
            email={user.email}
            selectedFolder={selectedFolder}
            setData={setRoomDocuments}
          />
          <div className="document-list-empty">
            <h4 className="sm:text-base text-base font-normal text-[#ffffffa6] w-full text-center">
              Looks like it&apos;s empty here! Tap the &apos;+&apos; icon to
              create a folder or document.
            </h4>
          </div>
        </div>
      )}
    </>
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
  const inputRef = useRef<HTMLDivElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (folderName !== folder?.name) {
          const updatedFolder = await updateFolder({
            folderId: folder?.id,
            folderName,
          });
          if (updatedFolder) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        updateFolder({
          folderId: folder?.id,
          folderName,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [folderName]);

  return (
    <li>
      <Collapsible
        open={expandedFolders[folder.id]}
        onOpenChange={() =>
          isSubFolder
            ? handleFolderClick(folder, parentFolder)
            : handleFolderClick(folder)
        }
      >
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-between gap-2 sm:gap-4 folder-list-item",
              `${
                folder.id === selectedFolder?.folderId
                  ? "bg-slate-200 bg-opacity-30"
                  : ""
              }`
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <Image
                src={
                  expandedFolders[folder.id]
                    ? "/assets/icons/up-arrow.svg"
                    : "/assets/icons/down-arrow.svg"
                }
                alt={
                  expandedFolders[folder.id]
                    ? "Dropdown Open"
                    : "Dropdown Closed"
                }
                width={12}
                height={12}
              />
              <div className="hidden rounded-md bg-dark-500 p-1 sm:block">
                <Image
                  src="/assets/icons/folder.svg"
                  alt="folder"
                  width={14}
                  height={14}
                />
              </div>
              <div
                ref={containerRef}
                className="flex w-fit items-center justify-center gap-2"
              >
                {editing && !loading ? (
                  <Input
                    type="text"
                    value={folderName}
                    ref={inputRef}
                    placeholder="Enter title"
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={updateTitleHandler}
                    disabled={!editing}
                    className="folder-name-input"
                  />
                ) : (
                  <>
                    <p className="line-clamp-1 text-sm sm:text-base">
                      {folderName}
                    </p>
                  </>
                )}

                {!editing && (
                  <Image
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={12}
                    height={12}
                    onClick={() => setEditing(true)}
                    className="cursor-pointer"
                  />
                )}

                {loading && <p className="text-sm text-gray-400">Saving...</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 sm:gap-3">
              <p className="text-xs sm:text-sm w-20 sm:w-fit font-light text-blue-100">
                Last Updated {dateConverter(folder.updatedAt)}
              </p>
              <DeleteFolderModel
                folderId={folder?.id}
                email={folder?.authorId}
                setFolders={setFolders}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="subfolder-document-ul">
            {folder?.documents?.length || folder?.subFolders?.length ? (
              <>
                {folder.subFolders?.map((subfolder: any) => (
                  <FolderListItem
                    key={subfolder.id}
                    folder={subfolder}
                    handleFolderClick={handleSubFolderClick}
                    expandedFolders={expandedFolders}
                    handleSubFolderClick={handleSubFolderClick}
                    selectedFolder={selectedFolder}
                    isSubFolder={true}
                    parentFolder={folder}
                    setFolders={setFolders}
                  />
                ))}

                {folder.documents?.map((doc: any) => (
                  <DocumentListItem
                    key={doc.id}
                    id={doc.id}
                    metadata={doc.metadata}
                    createdAt={doc.createdAt}
                    usersAccesses={doc.usersAccesses}
                    folderId={folder.id}
                    setDocuments={setFolders}
                  />
                ))}
              </>
            ) : (
              <h4 className="sm:text-base text-base font-normal text-[#ffffffa6] w-full text-center">
                Looks like it&apos;s empty here! Tap the &apos;+&apos; icon to
                create a folder or document.
              </h4>
            )}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

const DocumentListItem = ({
  id,
  metadata,
  createdAt,
  usersAccesses,
  folderId,
  setDocuments
}: any) => {
  return (
    <li className="document-list-item">
      <Link
        href={`/documents/${id}`}
        className="flex flex-1 items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="hidden rounded-md bg-dark-500 p-1 sm:block">
            <Image
              src="/assets/icons/doc.svg"
              alt="file"
              width={20}
              height={20}
            />
          </div>
          <p className="line-clamp-1 text-md">{metadata.title}</p>
        </div>
        <p className="text-sm font-light text-blue-100">
          Created At {dateConverter(createdAt)}
        </p>
      </Link>
      <DeleteModel
        roomId={id}
        users={Object.keys(usersAccesses)}
        folderId={folderId}
        setDocuments={setDocuments}
        isDashboard={true}
      />
    </li>
  );
};

export default Documents;
