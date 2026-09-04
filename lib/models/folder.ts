import mongoose, { Schema, Document, Model } from "mongoose";
import "./document";

export interface IFolder extends Document {
  name: string;
  authorId: string;
  parentId?: mongoose.Types.ObjectId | null;
  documents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Documents",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>("Folder", folderSchema);

export default Folder;
