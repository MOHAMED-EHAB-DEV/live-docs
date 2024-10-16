"use server";

import { connectToDatabase } from "../database";
import Documents from "../models/document";
import { getUser } from "./user.actions";
import Folder from "../models/folder";
import SubFolder from "../models/subFolder";

export const UpdateDocuments = async ({
  email,
  id,
  selectedFolder,
}: {
  email: string;
  id: string;
  selectedFolder: {
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  };
}) => {
  try {
    await connectToDatabase();

    const userExists = await getUser({ email });
    if (!userExists) {
      return {
        message: "User Doesn't Exists",
        updated: false,
      };
    }

    if (selectedFolder.folderId) {
      const folderExists = await Folder.findOne({
        _id: selectedFolder.folderId,
      });
      const subFolderExists = await SubFolder.findOne({
        _id: selectedFolder.folderId,
      });
      if (folderExists) {
        const folderDocuments = folderExists?.documents;
        const updatedFolderDocuments = [...folderDocuments, { id }];

        await Folder.findOneAndUpdate(
          { _id: selectedFolder?.folderId },
          {
            documents: updatedFolderDocuments,
          }
        );
      } else if (subFolderExists) {
        const subFolderDocuments = subFolderExists?.documents;
        const updatedFolderDocuments = [...subFolderDocuments, { id }];

        await SubFolder.findOneAndUpdate(
          { _id: selectedFolder?.folderId },
          {
            documents: updatedFolderDocuments,
          }
        );
      }
    } else {
      const DocumentExists = await Documents.findOne({ authorEmail: email });

      if (DocumentExists) {
        const documents = DocumentExists?.documents;
        const updatedDocuments = [...documents, { id }];

        await Documents.findOneAndUpdate(
          { authorEmail: email },
          { documents: updatedDocuments }
        );
      } else {
        const Document = new Documents({
          authorEmail: email,
          documents: [{ id }],
        });

        await Document.save();
      }
    }

    return {
      message: "Documents Updated",
      updated: true,
    };
  } catch (error) {
    console.log(`Error Updating Documents: ${error}`);
    return {
      message: `Error Updating Documents`,
      updated: false,
    };
  }
};
