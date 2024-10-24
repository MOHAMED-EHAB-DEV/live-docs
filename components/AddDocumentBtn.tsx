"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { createDocument } from "@/lib/actions/room.action";

const AddDocumentBtn = ({ userId, email, isEmpty }: AddDocumentBtnProps) => {
  const router = useRouter();
  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({ userId, email });
      if (room) router.push(`/documents/${room.id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button
      type="submit"
      onClick={addDocumentHandler}
      className="gradient-blue flex gap-1 shadow-md"
    >
      <Image src="/assets/icons/add.svg" alt="add" width={24} height={24} />
      <p className="hidden sm:block">Start A Blank Document{isEmpty && "(Outside All Folders)"}</p>
    </Button>
  );
};

export default AddDocumentBtn;
