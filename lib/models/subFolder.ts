import mongoose, { Schema, Document, Model } from "mongoose";
import "./document";

export interface ISubFolder extends Document {
  name: string;
  updatedAt: Date;
  documents: mongoose.Types.ObjectId[];
  authorId: string;
  subFolders: mongoose.Types.ObjectId[];
  parentId: string;
}

const subFolderSchema = new Schema<ISubFolder>({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
  },
  documents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Documents",
    },
  ],
  subFolders: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubFolder",
    },
  ],
  parentId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const SubFolder: Model<ISubFolder> =
  mongoose.models.SubFolder ||
  mongoose.model<ISubFolder>("SubFolder", subFolderSchema);

export default SubFolder;
