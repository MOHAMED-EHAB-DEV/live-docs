"use server";

import { IFolder } from "./models/folder";
import SubFolder from "./models/subFolder";
import { getDocument } from "./actions/room.action";

export const processFolder = async (folder: any): Promise<IFolder> => {
  const processedFolder = {
    id: folder?._id?.toString(),
    name: folder?.name,
    updatedAt: folder?.updatedAt,
    authorId: folder.authorId,
    documents: [],
    subFolders: [],
  };

  if (folder?.documents?.length > 0) {
    for (let i = 0; i < folder?.documents?.length; i++) {
      const doc = folder?.documents[i];

      const processedDoc = await getDocument({
        roomId: doc?.id,
        userId: folder.authorId,
      });

      processedFolder.documents.push(processedDoc);
    }
  }

  if (folder?.subFolders?.length > 0) {
    for (let i = 0; i < folder?.subFolders?.length; i++) {
      const subFolder = await SubFolder.findOne({
        _id: folder.subFolders[i],
      });
      if (subFolder) {
        const processedSubFolder = await processFolder(subFolder);
        processedFolder.subFolders.push(processedSubFolder);
      }
    }
  }

  return processedFolder;
};
