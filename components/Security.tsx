import { useState } from "react";
import Image from "next/image";

import { Button } from "./ui/button";
import { DropdownMenuSeparator } from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DeleteUser } from "@/lib/actions/user.actions";

const Security = ({ user }: { user: IUser }) => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteUserHandler = async () => {
    setLoading(true);

    try {
      const data = await DeleteUser({ email: user?.email });

      if (data?.deleted) {
        toast({
          variant: "successive",
          description: "Successfully, Deleted Your Account",
        });

        return setTimeout(() => (window.location.href = "/sign-in"), 1000);
      } else {
        throw new Error("Account Deletion failed.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error Deleting Your Account",
      });
    }

    setLoading(false);
  };
  return (
    <>
      <div className="w-full h-full px-6 py-7 flex flex-col">
        <h1 className="text-white font-bold text-2xl m-0">Security</h1>
        <DropdownMenuSeparator className="h-[1px] w-full bg-[#2F2F33] my-4" />
        <div className="flex gap-9 items-center">
          <p className="text-white text-base font-bold">Delete Account</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="min-w-9 rounded-xl bg-transparent py-[6px] pl-3 pr-[12px] hover:text-white text-[#EF4444] transition-all"
              >
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="shad-dialog">
              <DialogHeader>
                <Image
                  src="/assets/icons/delete-modal.svg"
                  alt="delete"
                  width={48}
                  height={48}
                  className="mb-4"
                />
                <DialogTitle>Delete Your Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-5">
                <DialogClose asChild className="w-full bg-dark-400 text-white">
                  Cancel
                </DialogClose>

                <Button
                  variant="destructive"
                  onClick={deleteUserHandler}
                  className="gradient-red w-full"
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default Security;
