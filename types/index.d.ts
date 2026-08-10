/* eslint-disable no-unused-vars */
declare type SearchParamProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type UserType = "creator" | "editor" | "viewer";

declare type IDocument = {
  _id: string;
  id?: string;
  title: string;
  content: string;
  authorEmail: string;
  collaborators: {
    user?: any;
    email?: string;
    userType: "editor" | "viewer";
    addedBy?: any;
  }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

declare type CreateDocumentParams = {
  userId: string;
  email: string;
  selectedFolder?: {
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
};

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
  documentId: string;
  email: string;
  userType: UserType;
  updatedBy: User;
  addedBy?: User;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
};

declare type ShareDocumentDialogProps = {
  documentId: string;
  documentTitle?: string;
  collaborators: User[];
  creatorId: string;
  currentUserType: UserType;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CollaboratorProps = {
  documentId: string;
  documentTitle?: string;
  creatorId: string;
  collaborator: any;
  user?: User;
  email?: string;
  onRemove?: (email: string) => void;
};

declare type CollaborativeRoomProps = {
  documentId: string;
  document: IDocument;
  users: User[];
  folderId: string;
};

declare type AddDocumentBtnProps = {
  userId: string;
  email: string;
  isEmpty: Boolean;
};

declare type DeleteModalProps = { documentId: string };
