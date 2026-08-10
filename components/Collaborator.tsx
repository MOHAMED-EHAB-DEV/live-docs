import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { useSocket } from "./editor/SocketProvider";

const Collaborator = ({
  documentId,
  documentTitle,
  creatorId,
  collaborator,
  onRemove,
}: CollaboratorProps) => {
  const { user } = useUser();
  const { socket, isConnected } = useSocket();
  const [userType, setUserType] = useState<UserType>(collaborator.userType || "viewer");
  const [loading, setLoading] = useState(false);

  const targetEmail = collaborator.user?.email || collaborator.email;

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          userType: type,
          addedBy: user,
          updatedBy: user,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated role for ${targetEmail}`);
      } else {
        toast.error(data.error || "Failed to update permissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions");
    }

    setLoading(false);
  };

  const removeCollaboratorHandler = async (emailToRemove: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/access?email=${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Removed ${emailToRemove}`);
        if (onRemove) {
          onRemove(emailToRemove);
        }
      } else {
        toast.error("Failed to remove collaborator");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove collaborator");
    }

    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2 items-center">
        <Image
          src={collaborator.user?.image || collaborator.user?.avatar || collaborator.avatar || "/assets/images/logo.png"}
          alt={collaborator.user?.name || collaborator.name || (collaborator.user?.email || collaborator.email || "User")}
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        <div className="flex flex-col gap-0.5">
          <p className="line-clamp-1 text-sm font-semibold leading-4 m-0 text-white">
            {collaborator.user?.name || collaborator.name || (collaborator.user?.email || collaborator.email || "").split("@")[0] || "User"}{" "}
            <span className="text-10-regular ps-2 text-blue-100">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-xs font-light text-blue-100/70 m-0">
            {collaborator.user?.email || collaborator.email}
          </p>
          {collaborator.addedBy && (
            <p className="text-[10px] text-blue-100/40 m-0">
              Added by {collaborator.addedBy.name || collaborator.addedBy.email || "Collaborator"}
            </p>
          )}
        </div>
      </div>
      {creatorId === (collaborator.user?.email || collaborator.email) ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center gap-2">
          <UserTypeSelector
            userType={userType as UserType}
            setUserType={setUserType}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"
            onClick={() => removeCollaboratorHandler(collaborator.user?.email || collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
