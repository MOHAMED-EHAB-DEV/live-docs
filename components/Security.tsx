"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import { IUser } from "@/lib/models/user";
import { useUser } from "@/context/UserContext";

const Security = ({ user }: { user: IUser }) => {
  const { setReload } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const hasPassword = Boolean(user?.hasPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (hasPassword && !currentPassword) {
      toast.error("Current password is required");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data?.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setReload((prev) => !prev);
      } else {
        toast.error(data?.error || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating your password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const deleteUserHandler = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/users?email=${encodeURIComponent(user?.email || "")}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Successfully deleted your account");
        setTimeout(() => (window.location.href = "/sign-in"), 1000);
      } else {
        throw new Error("Account deletion failed.");
      }
    } catch (error) {
      toast.error("Error deleting your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col text-start gap-1 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Security & Privacy
        </h2>
        <p className="text-sm text-zinc-400">
          Manage your password, authentication methods, and account security.
        </p>
      </div>

      {/* Password Management Section */}
      <div className="flex flex-col text-start gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            {hasPassword ? "Change Password" : "Set Account Password"}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {hasPassword
              ? "Update your existing password to maintain strong account protection."
              : "You do not have a password set. Set one to enable standard email and password login."}
          </p>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="flex flex-col gap-4 p-5 rounded-xl bg-dark-350/50 border border-white/5"
        >
          {hasPassword && (
            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="currentPassword"
                className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="newPassword"
                className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
              >
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="gradient-blue text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 min-w-36 flex items-center justify-center"
            >
              {passwordLoading ? (
                <Loader
                  text={hasPassword ? "Updating..." : "Setting..."}
                  size={16}
                />
              ) : hasPassword ? (
                "Update Password"
              ) : (
                "Set Password"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Authentication Details */}
      <div className="flex flex-col text-start gap-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-base font-semibold text-white">Authentication Method</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            How you verify your identity to access LiveDocs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-dark-350/50 border border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex flex-col text-start">
              <span className="text-sm font-medium text-white">
                {user?.provider === "google"
                  ? hasPassword
                    ? "Google OAuth & Password Authentication"
                    : "Google OAuth Single Sign-On"
                  : "Email & Password Authentication"}
              </span>
              <span className="text-xs text-zinc-400">
                Managed via {user?.email}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Session
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="flex flex-col text-start gap-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-base font-semibold text-red-400">Danger Zone</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Irreversible actions regarding your account and stored documents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-red-950/20 border border-red-500/20">
          <div className="flex flex-col text-start">
            <span className="text-sm font-semibold text-white">
              Delete Account
            </span>
            <span className="text-xs text-zinc-400 mt-0.5 max-w-md">
              Permanently delete your LiveDocs account, all your created documents, folders, and collaborator memberships.
            </span>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="gradient-red text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20 shrink-0"
              >
                Delete Account
              </Button>
            </DialogTrigger>

            <DialogContent className="shad-dialog">
              <DialogHeader className="flex flex-col gap-1 items-start text-start">
                <Image
                  src="/assets/icons/delete-modal.svg"
                  alt="delete"
                  width={48}
                  height={48}
                  className="mb-4"
                />
                <DialogTitle className="text-xl font-bold text-white">
                  Delete Your Account
                </DialogTitle>
              </DialogHeader>

              <p className="text-sm text-zinc-400 text-start">
                Are you absolutely sure you want to delete your account? All documents, comments, and workspace assets will be permanently removed. This action cannot be undone.
              </p>

              <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-start">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto bg-dark-400 text-white hover:bg-dark-500"
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={deleteUserHandler}
                  className="gradient-red w-full sm:w-auto text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader text="Deleting..." size={16} />
                  ) : (
                    "Permanently Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Security;
