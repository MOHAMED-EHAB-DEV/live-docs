"use server";

import SubFolder from "./models/subFolder";
import Documents from "./models/document";

export const processFolder = async (folder: any): Promise<any> => {
  if (!folder) return null;
  const processedFolder = {
    id: folder?._id?.toString(),
    name: folder?.name,
    updatedAt: folder?.updatedAt,
    authorId: folder.authorId,
    documents: [] as any[],
    subFolders: [] as any[],
  };

  if (folder?.documents?.length > 0) {
    for (let i = 0; i < folder?.documents?.length; i++) {
      const docId = folder?.documents[i];
      const processedDoc = await Documents.findById(docId).lean();
      if (processedDoc) {
        processedFolder.documents.push({
          ...processedDoc,
          id: (processedDoc as any)._id.toString(),
        });
      }
    }
  }

  if (folder?.subFolders?.length > 0) {
    for (let i = 0; i < folder?.subFolders?.length; i++) {
      const subFolder = await SubFolder.findById(folder.subFolders[i]).lean();
      if (subFolder) {
        const processedSubFolder = await processFolder(subFolder);
        processedFolder.subFolders.push(processedSubFolder);
      }
    }
  }

  return processedFolder;
};
