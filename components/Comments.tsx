"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "./editor/SocketProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommentsProps {
  documentId: string;
  currentUserEmail: string;
  onRead?: () => void;
  unreadCount?: number;
  autoScrollToLatest?: boolean;
  isMobile?: boolean;
}

const Comments = ({
  documentId,
  currentUserEmail,
  onRead,
  unreadCount = 0,
  autoScrollToLatest = false,
  isMobile = false,
}: CommentsProps) => {
  const { socket, isConnected } = useSocket();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    commentsEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Fetch existing comments
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/comments`);
        const data = await res.json();
        if (data.comments) {
          setComments(data.comments);
          if (autoScrollToLatest || isMobile) {
            setTimeout(() => scrollToBottom("auto"), 100);
          }
        }
      } catch (error) {
        console.error("Failed to load comments", error);
      }
    };
    fetchComments();
  }, [documentId, autoScrollToLatest, isMobile]);

  // Auto-scroll when opened in mobile or on new comments
  useEffect(() => {
    if (autoScrollToLatest || isMobile) {
      setTimeout(() => scrollToBottom("smooth"), 150);
    }
  }, [autoScrollToLatest, isMobile, comments.length]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveComment = (comment: any) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
      if (autoScrollToLatest || isMobile) {
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    };

    const handleReceiveDelete = ({ commentId }: { commentId: string }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    (socket as any).on("receive_comment", handleReceiveComment);
    (socket as any).on("receive_comment_delete", handleReceiveDelete);

    return () => {
      (socket as any).off("receive_comment", handleReceiveComment);
      (socket as any).off("receive_comment_delete", handleReceiveDelete);
    };
  }, [socket, isConnected, autoScrollToLatest, isMobile]);

  const handlePost = async () => {
    if (!newComment.trim() || isPosting) return;

    const tempComment = newComment.trim();
    setNewComment("");
    setIsPosting(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorEmail: currentUserEmail, content: tempComment }),
      });
      const data = await res.json();

      if (data.success && data.newComment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.newComment._id)) return prev;
          return [...prev, data.newComment];
        });

        setTimeout(() => scrollToBottom("smooth"), 100);

        if (socket && isConnected) {
          (socket as any).emit("add_comment", {
            ...data.newComment,
            documentId,
          });
        }
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        if (socket && isConnected) {
          (socket as any).emit("delete_comment", { commentId, documentId });
        }
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <div
      onClick={onRead}
      className={`w-full flex flex-col gap-3 p-4 border border-dark-400 rounded-xl bg-dark-200/80 backdrop-blur-xl shadow-xl ${
        isMobile ? "h-full flex-1" : "max-h-[calc(100vh-8rem)] flex-1"
      }`}
    >
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-blue-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Comments</h3>
          <span className="text-xs text-gray-400 font-mono">({comments.length})</span>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold animate-pulse">
            {unreadCount} new
          </span>
        )}
      </div>

      <div
        ref={commentsContainerRef}
        className="flex flex-col gap-2.5 flex-1 overflow-y-auto pe-1 min-h-30"
      >
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="p-3 bg-dark-300/80 hover:bg-dark-300 rounded-lg shadow-sm border border-dark-400/80 flex flex-col gap-1 transition-colors group shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-200 truncate max-w-45">
                {comment.authorEmail}
              </span>
              {comment.authorEmail === currentUserEmail && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment._id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                  title="Delete comment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-200 wrap-break-word leading-relaxed">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-8 opacity-40">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>No comments yet. Start the conversation!</span>
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>

      <div className="flex gap-2 w-full mt-auto pt-2 border-t border-dark-400 shrink-0">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          onFocus={onRead}
          className="flex-1 text-xs h-9 bg-dark-300 border-dark-400 text-white placeholder:text-gray-500"
        />
        <Button
          size="sm"
          onClick={handlePost}
          disabled={!newComment.trim() || isPosting}
          variant="default"
          className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shrink-0"
        >
          {isPosting ? "..." : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default Comments;
