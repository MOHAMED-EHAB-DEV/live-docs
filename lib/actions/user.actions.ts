"use server";

import User from "../models/user";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";
import { connectToDatabase } from "../database";
import Documents from "../models/document";
import { revalidatePath } from "next/cache";
import { deleteFolder } from "./folders.action";
import { deleteDocument } from "./room.action";
import Folder from "../models/folder";

export const getUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    await connectToDatabase();
    const data = await User.find();

    const users = data.map((user) => ({
      id: `${user?._id}`,
      name: user.name,
      email: user.email,
      avatar: user.image,
    }));

    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    return parseStringify(sortedUsers);
  } catch (error) {
    console.log(`Error getting users: ${error}`);
  }
};

export const getUser = async ({ email }: { email: string }) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });

    return user
      ? {
          _id: `${user?._id}`,
          name: user?.name,
          email: user?.email,
          image: user?.image,
          provider: user?.provider,
          createdAt: user?.createdAt,
          verified: user?.verified,
        }
      : undefined;
  } catch (error) {
    console.log(`Error getting a user: ${error}`);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
};

export const UpdateUser = async (
  {
    name,
    email,
    image,
  }: {
    name: string;
    email: string;
    image: string;
  },
  actualEmail: string
) => {
  try {
    await connectToDatabase();

    const userExists = await getUser({ email: actualEmail });
    if (!userExists) {
      return {
        message: "User Doesn't Exists",
        updated: false,
      };
    }

    const user = await User.findOneAndUpdate(
      { email: actualEmail },
      { name, email, image }
    );

    revalidatePath("/");

    return {
      message: "User Successfully Updated",
      updated: true,
      user,
    };
  } catch (error) {
    console.log(`Error Updating User: ${error}`);
    return {
      message: `Error Updating User`,
      updated: false,
    };
  }
};

export const DeleteUser = async ({ email }: { email: string }) => {
  try {
    await connectToDatabase();

    const deletedUser = await User.findOneAndDelete({ email });
    const folders = await Folder.find({ authorId: email });

    folders?.forEach(async (folder) => {
      const id = folder?._id?.toString();

      await deleteFolder({
        folderId: id as string,
        email,
        isSubOperation: true,
      });
    });

    await DeleteDocumentUser(email);

    return {
      message: "Account deleted",
      deleted: true,
      user: deletedUser,
    };
  } catch (error) {
    console.log(`Error deleting your user: ${error}`);
  }
};

export const DeleteDocumentUser = async (email: String) => {
  try {
    await Documents.findOneAndDelete({ authorEmail: email });

    return;
  } catch (error) {
    console.log(`Error while delete documents for a user: ${error}`);
  }
};
