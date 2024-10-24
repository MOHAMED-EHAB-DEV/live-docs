"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { processFolder } from "../server-utils";
import { redirect } from "next/navigation";
import { UpdateDocuments } from "./documents.action";
import Documents from "../models/document";
import Folder, { IFolder } from "../models/folder";
import SubFolder from "../models/subFolder";
import User from "../models/user";

export const createDocument = async ({
  userId,
  email,
  selectedFolder,
}: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });

    await UpdateDocuments({ email, id: room.id, selectedFolder });

    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You do not have access to this room");
    }

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log("Error happened while updating document", error);
  }
};

export const getDocuments = async (email: string) => {
  try {
    const documents = await Documents.findOne({ authorEmail: email });
    const folders = await Folder.find({ authorId: email });

    const processedDocuments: Object[] = [];

    if (documents) {
      for (let i = 0; i < documents?.documents?.length; i++) {
        const doc = documents?.documents[i];

        const processedDoc = await getDocument({
          roomId: doc?.id,
          userId: email,
        });

        processedDocuments.push(processedDoc);
      }
    }

    const processedFolders: IFolder[] = [];

    for (let i = 0; i < folders?.length; i++) {
      const processedFolder: IFolder = await processFolder(folders[i]);

      processedFolders.push(processedFolder);
    }

    return parseStringify({
      documents: processedDocuments,
      folders: processedFolders,
    });
  } catch (error) {
    console.log(`Error happened while getting rooms: ${error}`);
  }
};

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const UserExists = await User.findOne({ email });

    if (!UserExists) {
      throw new Error("This User doesn't exists");
    }

    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    const room = await liveblocks.updateRoom(roomId, { usersAccesses });
    const documentExists = await Documents.findOne({ authorEmail: email });

    if (documentExists) {
      const documents = documentExists?.documents;
      await Documents.findOneAndUpdate(
        { authorEmail: email },
        { documents: [...documents, { id: roomId }] }
      );
    }

    if (room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating room access: ${error}`);
  }
};

export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document");
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });

    const documents = await Documents.findOne({ authorEmail: email });

    if (documents) {
      const document = documents.documents;
      const updatedDocuments = document.filter((doc: any) => doc.id !== roomId);

      await Documents.findOneAndUpdate(
        { authorEmail: email },
        { documents: updatedDocuments }
      );
    }

    revalidatePath("/documents/${roomId");
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (
  roomId: string,
  users: Array<String>,
  isFolder?: Boolean,
  folderId?: string,
  isDashboard?: Boolean
) => {
  try {
    let returnedDocuments = [];
    await liveblocks.deleteRoom(roomId);

    users?.forEach(async (item) => {
      if (isFolder) {
        console.log(isFolder, "Folder");
        const folder = await Folder.findOne({
          authorId: isDashboard ? item : item?.email,
          _id: folderId,
        });
        const subFolder = await SubFolder.findOne({
          authorId: isDashboard ? item : item?.email,
          _id: folderId,
        });

        if (folder) {
          const filteredDocuments = folder?.documents?.filter(
            (doc) => doc?.id !== roomId
          );

          await Folder.findOneAndUpdate(
            { authorId: isDashboard ? item : item?.email, _id: folderId },
            {
              documents: filteredDocuments,
            }
          );
        } else if (subFolder) {
          const filteredDocuments = subFolder?.documents?.filter(
            (doc) => doc?.id !== roomId
          );

          await SubFolder.findOneAndUpdate(
            { authorId: isDashboard ? item : item?.email, _id: folderId },
            {
              documents: filteredDocuments,
            }
          );
        }
      } else {
        const documents = await Documents.findOne({ authorEmail: isDashboard ? item : item?.email });
        if (documents) {
          const document = documents.documents;
          const updatedDocuments = document.filter(
            (doc: any) => doc.id !== roomId
          );
          returnedDocuments = updatedDocuments;

          await Documents.findOneAndUpdate(
            { authorEmail: isDashboard ? item : item?.email },
            { documents: updatedDocuments }
          );
        }
      }
    });

    revalidatePath("/");

    if (isDashboard) {
      return parseStringify(returnedDocuments);
    } else {
      redirect("/");
    }
  } catch (error) {
    console.log(`Error happened while deleting a document: ${error}`);
  }
};
