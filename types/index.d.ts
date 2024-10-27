/* eslint-disable no-unused-vars */
declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type RoomAccesses = Record<string, AccessType>;

declare type UserType = "creator" | "editor" | "viewer";

declare type RoomMetadata = {
  creatorId: string;
  email: string;
  title: string;
};

declare type CreateDocumentParams = {
  userId: string;
  email: string;
  selectedFolder: {
    folderId: string;
    authorId: string;
    folderName: string;
    parentId?: string;
  };
};

declare type IUser = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: String;
  createdAt: Date;
  folders: Array<Object>;
  documents: Array<Object>;
  verified: Boolean;
}

declare type User = {
  id: string;
  _id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  userType?: UserType;
};

declare type ShareDocumentParams = {
  roomId: string;
  email: string;
  userType: UserType;
  updatedBy: User;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
};

declare type ShareDocumentDialogProps = {
  roomId: string;
  collaborators: User[];
  creatorId: string;
  currentUserType: UserType;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CollaboratorProps = {
  roomId: string;
  email: string;
  creatorId: string;
  collaborator: User;
  user: User;
};

declare type CollaborativeRoomProps = {
  roomId: string;
  roomMetadata: RoomMetadata;
  users: User[];
  currentUserType: UserType;
  currentUser: IUser;
  folderId: string;
};

declare type AddDocumentBtnProps = {
  userId: string;
  email: string;
  isEmpty: Boolean;
};

declare type DeleteModalProps = { roomId: string };

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };