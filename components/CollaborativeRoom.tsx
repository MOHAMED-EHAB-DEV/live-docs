"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import UserDropdown from "@/components/UserDropdown";
import { Input } from "@/components/ui/Input";
import { SocketProvider, useSocket } from "@/components/editor/SocketProvider";
import Header from "@/components/Header";
import ActiveCollaborators from "./ActiveCollaborators";
import Notifications from "@/components/Notifications";
// import DeveloperBadge from "./DeveloperBadge";
import { useUser } from "@/context/UserContext";

const Editor = dynamic(
  () => import("@/components/editor/Editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-5xl mx-auto flex flex-col bg-dark-200/80 backdrop-blur-xl rounded-2xl shadow-xl border border-dark-400 mt-4 p-8 min-h-125 animate-pulse">
        <div className="h-10 bg-dark-300 rounded-xl w-full mb-6" />
        <div className="h-8 bg-dark-300 rounded-lg w-1/3 mb-4" />
        <div className="h-4 bg-dark-300/60 rounded w-3/4 mb-3" />
        <div className="h-4 bg-dark-300/60 rounded w-1/2 mb-3" />
        <div className="h-32 bg-dark-300/40 rounded-xl w-full mt-6" />
      </div>
    ),
  }
);

const Comments = dynamic(() => import("./Comments"), {
  ssr: false,
  loading: () => (
    <div className="w-full p-4 border border-dark-400 rounded-xl bg-dark-200/80 animate-pulse h-64" />
  ),
});

const ShareModel = dynamic(() => import("./ShareModel"), {
  ssr: false,
});

const RoomContent = ({
  documentId,
  document: doc,
  currentUserType,
}: {
  documentId: string;
  document: any;
  currentUserType: "editor" | "viewer";
}) => {
  const [mobileCommentsOpen, setMobileCommentsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(doc?.title || "Untitled Document");
  const { user: currentUser } = useUser();
  const { socket, isConnected } = useSocket();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync title updates from other clients via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveTitle = ({ title }: { title: string }) => {
      if (title && title !== documentTitle) {
        setDocumentTitle(title);
      }
    };

    const handleNewComment = (comment: any) => {
      if (comment.authorEmail !== currentUser?.email) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    (socket as any).on("receive_title_update", handleReceiveTitle);
    (socket as any).on("receive_comment", handleNewComment);

    return () => {
      (socket as any).off("receive_title_update", handleReceiveTitle);
      (socket as any).off("receive_comment", handleNewComment);
    };
  }, [socket, isConnected, documentTitle, currentUser?.email]);

  const updateDocumentTitle = async (title: string) => {
    try {
      if (socket && isConnected) {
        (socket as any).emit("update_title", { documentId, title });
      }

      await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (documentTitle !== doc.title) {
          await updateDocumentTitle(documentTitle);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
      setEditing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        if (documentTitle !== doc.title) {
          updateDocumentTitle(documentTitle);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [documentId, documentTitle, doc.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="collaborative-room min-h-screen pb-12 relative">
      <Header>
        <div
          ref={containerRef}
          className="flex w-fit items-center justify-between gap-2"
        >
          {editing && !loading ? (
            <Input
              type="text"
              value={documentTitle}
              ref={inputRef}
              placeholder="Enter title"
              onChange={(e) => setDocumentTitle(e.target.value)}
              onKeyDown={updateTitleHandler}
              disabled={!editing}
              className="document-title-input"
            />
          ) : (
            <p className="document-title">{documentTitle}</p>
          )}

          {currentUserType === "editor" && !editing && (
            <Image
              src="/assets/icons/edit.svg"
              alt="edit"
              width={24}
              height={24}
              onClick={() => setEditing(true)}
              className="pointer"
            />
          )}

          {currentUserType !== "editor" && !editing && (
            <p className="view-only-tag">View Only</p>
          )}

          {loading && <p className="text-sm text-gray-400">Saving...</p>}
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <ActiveCollaborators authorId={currentUser?.email || ""} />
          <ShareModel
            documentId={documentId}
            documentTitle={documentTitle || doc?.title || "Untitled Document"}
            creatorId={doc?.authorEmail || ""}
            currentUserType={currentUserType}
          />
          <Notifications />
          {currentUser && <UserDropdown />}
        </div>
      </Header>

      <div className="flex w-full max-w-7xl mx-auto gap-4 px-3 sm:px-4 items-start mt-2">
        <div className="flex-1 min-w-0 w-full">
          <Editor
            roomId={documentId}
            currentUserType={currentUserType}
            currentUserEmail={currentUser?.email || ""}
            initialContent={doc?.content || ""}
          />
        </div>
        <div className="w-80 hidden lg:flex flex-col shrink-0 sticky top-24 max-h-[calc(100vh-7rem)]">
          <Comments
            documentId={documentId}
            currentUserEmail={currentUser?.email || ""}
            unreadCount={unreadCount}
            onRead={() => setUnreadCount(0)}
          />
        </div>
      </div>

      {/* Floating Comments Button on Mobile & Tablets */}
      <button
        type="button"
        onClick={() => {
          setMobileCommentsOpen(!mobileCommentsOpen);
          setUnreadCount(0);
        }}
        className="fixed bottom-5 inset-e-5 z-40 lg:hidden flex items-center justify-center size-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl transition-all active:scale-95 cursor-pointer border border-blue-400/40"
        title="Open Comments"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -inset-e-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Comments Drawer / Modal */}
      {mobileCommentsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setMobileCommentsOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[85vh] bg-dark-200 border-t border-dark-400 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-4 border-b border-dark-400">
              <h3 className="text-base font-semibold text-white">Comments & Thread</h3>
              <button
                type="button"
                onClick={() => setMobileCommentsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-dark-300 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <Comments
                documentId={documentId}
                currentUserEmail={currentUser?.email || ""}
                unreadCount={0}
                onRead={() => setUnreadCount(0)}
                autoScrollToLatest={true}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CollaborativeRoom = ({
  documentId,
  document: doc,
  users,
  folderId,
}: CollaborativeRoomProps) => {
  const { user: currentUser } = useUser();
  const collaboratorMatch = doc?.collaborators?.find(
    (c: any) => c.user?.email === currentUser?.email
  );
  const currentUserType: "editor" | "viewer" =
    currentUser?.email === doc?.authorEmail
      ? "editor"
      : collaboratorMatch?.userType === "editor"
      ? "editor"
      : "viewer";

  return (
    <SocketProvider
      email={currentUser?.email || ""}
      user={currentUser}
      documentId={documentId}
    >
      <RoomContent
        documentId={documentId}
        document={doc}
        currentUserType={currentUserType}
      />
    </SocketProvider>
  );
};

export default CollaborativeRoom;
