import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { revalidatePath } from "next/cache";

import { Button } from "./ui/button";
import { UpdateUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { isBase64Image } from "@/lib/utils";
import Loader from "./Loader";
import { Label } from "./ui/label";

const UpdateProfile = ({
  user,
  setEditing,
}: {
  user: IUser;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(
    user.image ? (user.image as string) : "/assets/icons/userProfile.png"
  );
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(
      user?.image === image && user?.name === name && user?.email === email
    );
  }, [image, name, email, user]);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      toast({
        variant: "successive",
        description:
          "Profile photo updated successfully!\nPlease Reload the page to apply the changes.",
      });
    },
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.includes("image")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file.",
        });
        return;
      }

      setFiles([file]);

      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setLoading(true);
    try {
      const base64String = await fileToBase64(file);
      const hasImageChanged = isBase64Image(base64String);

      if (hasImageChanged) {
        const imgRes = await startUpload([file]);

        if (imgRes && imgRes[0]?.url) {
          const imageUrl = imgRes[0].url;
          setImage(imageUrl);
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "File upload failed. Please try again.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Invalid image",
          description: "The selected image is not valid.",
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the image. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveImage = async () => {
    try {
      setLoading(true);
      setImage("/assets/icons/userProfile.png");
      setLoading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the image. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const data = await UpdateUser({ image, email, name }, user?.email);

      setEditing(false);
      toast({
        variant: data?.updated ? "successive" : "destructive",
        description: data?.message,
      });
    } catch (error) {
      console.error("Submitting failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the the data. Please try again.",
      });
    }
  };

  return (
    <>
      <Label
        htmlFor="image"
        className="text-center sm:text-left w-full text-zinc-400"
      >
        Profile Picture
      </Label>
      <div className="flex gap-4 sm:gap-8 items-center w-full">
        <Image
          src={image}
          alt={user.name}
          width={64}
          height={64}
          className="object-cover rounded-full"
        />
        <div className="flex items-center h-fit justify-center gap-2">
          {loading && <Loader />}
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImage}
            className="hidden"
            name="image"
          />
          <Button onClick={onUploadClick}>Upload</Button>
          <Button onClick={handleRemoveImage}>Remove</Button>
        </div>
      </div>
      <Label
        htmlFor="name"
        className="text-center sm:text-left w-full text-zinc-400"
      >
        Profile Name
      </Label>
      <div className="flex items-center w-full h-full">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 w-[90%] h-full border-solid border-[#1F1F23] border-[1px] rounded-md placeholder-[#ffffff99] bg-[#2C3E50] text-white focus:ring-2 focus:ring-[#ffffff33]"
          name="name"
        />
      </div>
      <Label
        htmlFor="email"
        className="text-center sm:text-left w-full text-zinc-400"
      >
        Profile Email
      </Label>
      <div className="flex items-center w-full h-full">
        <Input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 w-[90%] h-full border-solid border-[#1F1F23] border-[1px] rounded-md placeholder-[#ffffff99] bg-[#2C3E50] text-white focus:ring-2 focus:ring-[#ffffff33]"
          name="email"
        />
      </div>

      <div className="flex items-center justify-end w-full">
        <Button
          className="flex items-center justify-center"
          disabled={isDisabled}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default UpdateProfile;
