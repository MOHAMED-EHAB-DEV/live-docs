"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import { isBase64Image } from "@/lib/utils";
import Loader from "./Loader";
import { IUser } from "@/lib/models/user";
import { useUser } from "@/context/UserContext";

const UpdateProfile = ({
  user,
  onSaved,
}: {
  user: IUser;
  onSaved?: () => void;
}) => {
  const { setUser, setReload } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(
    user?.image ? (user.image as string) : "/assets/icons/userProfile.png"
  );
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const hasChanged =
      (user?.image || "/assets/icons/userProfile.png") !== image ||
      (user?.name || "") !== name.trim();
    setIsDisabled(!hasChanged || !name.trim());
  }, [image, name, user]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type: Please select an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large: Maximum size is 5MB.");
        return;
      }

      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setLoading(true);
    try {
      const base64String = await fileToBase64(file);
      const hasImageChanged = isBase64Image(base64String);

      if (hasImageChanged) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64String }),
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          setImage(data.url);
          toast.success("Profile photo uploaded to Cloudinary successfully!");
        } else {
          toast.error("Cloudinary upload failed. Please try again.");
        }
      } else {
        toast.error("Invalid image: The selected image is not valid.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to process the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage("/assets/icons/userProfile.png");
    toast.info("Profile photo reset to default");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDisabled || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          updates: { image, name: name.trim() },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data?.message || "Profile updated successfully");
        if (data?.user) {
          setUser(data.user);
        }
        setReload((prev) => !prev);
        if (onSaved) onSaved();
      } else {
        toast.error(data?.error || data?.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Submitting failed:", error);
      toast.error("Failed to process the update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* Profile Picture Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-dark-350/50 border border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={image}
              alt={name || "User Avatar"}
              width={72}
              height={72}
              className="h-18 w-18 object-cover rounded-full ring-2 ring-blue-500/40 bg-dark-400"
            />
            {loading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-xs">
                <Loader text="" size={22} />
              </div>
            )}
          </div>
          <div className="flex flex-col text-start">
            <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              JPG, PNG, WebP or GIF. Max 5MB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImage}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onUploadClick}
            disabled={loading || saving}
            className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-lg px-3.5 py-2 transition"
          >
            Change Photo
          </Button>
          {image !== "/assets/icons/userProfile.png" && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveImage}
              disabled={loading || saving}
              className="text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2 transition"
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 text-start">
          <label
            htmlFor="name"
            className="text-xs font-medium text-zinc-300 uppercase tracking-wider"
          >
            Display Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-dark-350 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-hidden"
          />
        </div>

        <div className="flex flex-col gap-2 text-start">
          <label
            htmlFor="email"
            className="text-xs font-medium text-zinc-300 uppercase tracking-wider flex items-center justify-between"
          >
            <span>Email Address</span>
            <span className="text-[10px] text-zinc-500 lowercase">Primary</span>
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full bg-dark-400/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed outline-hidden"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="submit"
          disabled={isDisabled || saving || loading}
          className="gradient-blue text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 min-w-36 flex items-center justify-center"
        >
          {saving ? (
            <Loader text="Saving Changes..." size={16} />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default UpdateProfile;
