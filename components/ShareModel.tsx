"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
import { useSocket } from "./editor/SocketProvider";

const ShareModel = ({
  documentId,
  documentTitle,
  creatorId,
  currentUserType,
}: Omit<ShareDocumentDialogProps, "collaborators">) => {
  const { user } = useUser();
  const { socket, isConnected } = useSocket();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCollaborators, setFetchingCollaborators] = useState(false);

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");

  useEffect(() => {
    if (open) {
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
      fetchCollaborators();
    }
  }, [open, documentId]);

  const shareDocumentHandler = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          userType,
          addedBy: user,
          updatedBy: user,
        }),
      });
      const data = await res.json();
      if (res.ok && data.collaborators) {
        setCollaborators(data.collaborators);
        toast.success(`Shared document with ${email}`);
        setEmail("");
      } else {
        toast.error(data.error || "Failed to share document");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to share document");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4 cursor-pointer"
          disabled={currentUserType !== "editor"}
        >
          <Image
            src="/assets/icons/share.svg"
            alt="Share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="me-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog">
        <DialogHeader className="flex flex-col gap-1 items-start">
          <DialogTitle className="text-xl font-bold text-white">
            Manage who can view this project
          </DialogTitle>
          <p className="text-zinc-400 text-sm font-normal">
            Select which users can view and edit this document
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <label htmlFor="email" className="text-blue-100 block text-sm">
            Email Address
          </label>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-xl bg-dark-400 pe-1">
              <Input
                id="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="share-input"
              />
              <UserTypeSelector
                userType={userType}
                setUserType={setUserType}
              />
            </div>
            <Button
              type="submit"
              onClick={shareDocumentHandler}
              className="gradient-blue flex h-full gap-1 px-5 cursor-pointer"
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Invite"}
            </Button>
          </div>

          <div className="flex flex-col my-2 space-y-2">
            {fetchingCollaborators ? (
              <div className="py-6 space-y-2">
                <div className="h-10 bg-dark-400/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-dark-400/60 rounded-xl animate-pulse" />
              </div>
            ) : (
              <ul className="flex flex-col space-y-2">
                {collaborators.map((collaborator) => (
                  <Collaborator
                    key={collaborator.user?._id || collaborator.user?.email || collaborator._id || collaborator.email}
                    documentId={documentId}
                    documentTitle={documentTitle}
                    creatorId={creatorId}
                    collaborator={collaborator}
                    onRemove={(removedEmail) => {
                      setCollaborators((prev) =>
                        prev.filter((c) => (c.user?.email || c.email) !== removedEmail)
                      );
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModel;
