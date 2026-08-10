"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { useUser } from "@/context/UserContext";
import { useSocket } from "./editor/SocketProvider";

interface Notification {
  _id: string;
  documentId: string;
  documentTitle?: string;
  senderName?: string;
  senderEmail?: string;
  senderImage?: string;
  actionType?: "share" | "role_update" | "comment" | "general";
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => fetchNotifications());
    } else {
      setTimeout(fetchNotifications, 100);
    }

    // Polling fallback
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.email, fetchNotifications]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n._id !== notification._id);
        return [notification, ...filtered];
      });

      const toastKey = notification._id || `notif-${notification.documentId}-${notification.createdAt}`;
      toast.info(notification.message || "New document shared with you!", {
        toastId: toastKey,
        autoClose: 5000,
        pauseOnHover: true,
      });
    };

    (socket as any).on("new_notification", handleNewNotification);
    return () => {
      (socket as any).off("new_notification", handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (notificationId?: string) => {
    try {
      if (notificationId) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });
      } else if (user?.email) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, markAllRead: true }),
        });
      }
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} placement="bottom-end">
      <PopoverTrigger>
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-lg hover:bg-dark-400/80 transition-colors cursor-pointer active:scale-95"
          title="Notifications"
        >
          <Image
            src="/assets/icons/bell.svg"
            alt="inbox"
            width={24}
            height={24}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -inset-e-0.5 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-dark-200 animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-88 shadow-2xl rounded-2xl overflow-hidden p-0 border border-dark-400 bg-dark-200/95 backdrop-blur-2xl text-white z-160">
        <div className="flex flex-col w-full">
          <div className="p-3.5 border-b border-dark-400 bg-dark-300/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAsRead()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto w-full divide-y divide-dark-400/40">
            {loading ? (
              <div className="p-4 space-y-3">
                <div className="h-12 bg-dark-300 rounded-lg animate-pulse" />
                <div className="h-12 bg-dark-300 rounded-lg animate-pulse" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <div className="size-10 rounded-full bg-dark-400/50 flex items-center justify-center text-gray-500">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="font-medium text-gray-300">No notifications yet</span>
                <p className="text-[11px] text-gray-500 max-w-50">
                  When teammates share documents with you, they will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  href={`/documents/${notif.documentId}`}
                  className={`flex items-start gap-3 p-3.5 transition-colors group cursor-pointer ${
                    notif.isRead ? "hover:bg-dark-300/40 opacity-75 hover:opacity-100" : "bg-dark-300/60 hover:bg-dark-300/90"
                  }`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    setIsOpen(false);
                  }}
                >
                  <div className="relative shrink-0 mt-0.5">
                    {notif.senderImage ? (
                      <Image
                        src={notif.senderImage}
                        alt={notif.senderName || "User"}
                        width={32}
                        height={32}
                        className="size-8 rounded-full object-cover border border-dark-400"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold uppercase">
                        {(notif.senderName || notif.senderEmail || "U").slice(0, 2)}
                      </div>
                    )}
                    {!notif.isRead && (
                      <span className="absolute -top-0.5 -inset-e-0.5 size-2.5 rounded-full bg-blue-500 ring-2 ring-dark-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 group-hover:text-white transition-colors leading-relaxed wrap-break-word font-medium">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatTimestamp(notif.createdAt)}
                      </span>
                      {notif.documentTitle && (
                        <span className="text-[10px] text-blue-400/80 bg-blue-500/10 px-1.5 py-0.2 rounded font-medium truncate max-w-35">
                          {notif.documentTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;

