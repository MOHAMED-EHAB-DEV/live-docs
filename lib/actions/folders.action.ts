"use server";

import { revalidatePath } from "next/cache";
import Folder from "../models/folder";
import SubFolder from "../models/subFolder";
import { parseStringify } from "../utils";

export const createFolder = async ({
  email,
  name,
  selectedFolder,
}: {
  email: string;
  name: string;
  selectedFolder: {
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  };
}) => {
  try {
    if (selectedFolder?.folderId) {
      const selectedFolderExists = await Folder.findOne({
        _id: selectedFolder?.folderId,
      });
      if (selectedFolderExists) {
        const subFolder = new SubFolder({
          name,
          authorId: email,
          documents: [],
          subFolder: [],
          parentId: selectedFolder.folderId,
        });

        const newSubFolder = await subFolder.save();

        const selectedFolderSubFolders = selectedFolderExists.subFolders;
        const updatedSelectedFolderSubFolders = [
          ...selectedFolderSubFolders,
          newSubFolder?._id,
        ];

        await Folder.findOneAndUpdate(
          {
            _id: selectedFolder?.folderId,
          },
          {
            subFolders: updatedSelectedFolderSubFolders,
          }
        );
      } else {
        const NewSubFolder = new SubFolder({
          name,
          authorId: email,
          documents: [],
          subFolder: [],
          parentId: selectedFolder.folderId,
        });

        const newSubFolder = await NewSubFolder.save();

        const subFolder = await SubFolder.findOne({
          _id: selectedFolder.folderId,
        });

        const subFolders = subFolder?.subFolders;
        const updatedSubFolders = [
          ...subFolders,
          newSubFolder._id,
        ];

        await SubFolder.findOneAndUpdate(
          { authorId: email, _id: selectedFolder?.folderId },
          {
            subFolders: updatedSubFolders,
          }
        );
      }
    } else {
      const newFolder = new Folder({
        name,
        authorId: email,
        documents: [],
        subFolder: {},
      });

      await newFolder.save();
    }

    const folder = await Folder.findOne({ authorId: email });

    revalidatePath("/");

    return parseStringify(folder);
  } catch (error) {
    console.log(`Error happened while we adding a folder: ${error}`);
  }
};
