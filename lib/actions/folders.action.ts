"use server";

import { revalidatePath } from "next/cache";
import Folder, { IFolder } from "../models/folder";
import SubFolder from "../models/subFolder";
import { parseStringify } from "../utils";
import { processFolder } from "../server-utils";
import { liveblocks } from "../liveblocks";

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
  let returnedData = {
    isSub: false,
    folder: {},
  };
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

        returnedData = {
          isSub: true,
          folder: subFolder,
        };

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

        returnedData = {
          isSub: true,
          folder: NewSubFolder,
        };

        const subFolder = await SubFolder.findOne({
          _id: selectedFolder.folderId,
        });

        const subFolders = subFolder?.subFolders;
        const updatedSubFolders = [...subFolders, newSubFolder._id];

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
      returnedData = {
        isSub: false,
        folder: newFolder,
      };
    }

    // const folder = await Folder.findOne({ authorId: email });

    // revalidatePath("/");

    // return parseStringify(folder);

    revalidatePath("/");
    // if (returnedData.isSub) {
    //   const folder = await Folder.findOne({ _id: selectedFolder.folderId, authorId: email });

    //   if (folder?._id === returnedData?.folder?._id) {
    //     return parseStringify(folder);
    //   }

    //   const subFolders = folder?.subFolders as Array<Object>;

    //   for (const subFolder of subFolders) {
    //     if (subFolder === returnedData?.folder?._id) {

    //     }
    //   }
    // }
    const folders = await Folder.find({ authorId: email });

    const processedFolders: Object[] = [];

    for (let i = 0; i < folders?.length; i++) {
      const processedFolder: IFolder = await processFolder(folders[i]);

      processedFolders.push(processedFolder);
    }

    return parseStringify(processedFolders);
  } catch (error) {
    console.log(`Error happened while we adding a folder: ${error}`);
  }
};

export const deleteFolder = async ({
  folderId,
  email,
  isSubOperation,
}: {
  folderId: string;
  email: string;
  isSubOperation: Boolean;
}) => {
  try {
    const folder = await Folder.findOne({ _id: folderId });
    const subFolder = await SubFolder.findOne({ _id: folderId });

    if (folder) {
      await Folder.findOneAndDelete({ _id: folderId });

      for (let i = 0; i < folder?.documents.length; i++) {
        const roomId = folder?.documents[i]?.id;

        await liveblocks.deleteRoom(roomId);
      }

      for (let i = 0; i < folder?.subFolders.length; i++) {
        await deleteFolder({
          folderId: folder?.subFolders[i]._id as string,
          email,
          isSubOperation: true,
        });
      }
    } else if (subFolder) {
      await SubFolder.findOneAndDelete({ _id: folderId });
      for (let i = 0; i < subFolder?.documents.length; i++) {
        const roomId = subFolder?.documents[i]?.id;

        await liveblocks.deleteRoom(roomId);
      }
      for (let i = 0; i < subFolder?.subFolders.length; i++) {
        await deleteFolder({
          folderId: subFolder?.subFolders[i]._id as string,
          email,
          isSubOperation: true,
        });
      }
    }

    if (isSubOperation) {
      return;
    }

    const folders = await Folder.find({ authorId: email });

    const processedFolders: IFolder[] = [];

    for (let i = 0; i < folders?.length; i++) {
      const processedFolder: IFolder = await processFolder(folders[i]);

      processedFolders.push(processedFolder);
    }

    revalidatePath("/");

    return parseStringify(folders);
  } catch (error) {
    console.log(`Error while deleting folder: ${error}`);
  }
};

export const updateFolder = async ({
  folderId,
  folderName,
}: {
  folderId: string;
  folderName: string;
}) => {
  try {
    const folder = await Folder.findOne({ _id: folderId });
    const subFolder = await SubFolder.findOne({ _id: folderId });

    if (folder) {
      await Folder.findOneAndUpdate(
        { _id: folderId },
        {
          name: folderName,
        }
      );
    } else if (subFolder) {
      await SubFolder.findOneAndUpdate(
        { _id: folderId },
        {
          name: folderName,
        }
      );
    }

    revalidatePath("/");

    return true;
  } catch (error) {
    console.log(`Error while updating folder: ${error}`);

    return false;
  }
};
