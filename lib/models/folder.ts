import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFolder extends Document {
  name: string;
  updatedAt: Date;
  documents: Array<Object>;
  authorId: String;
  subFolders: Array<IFolder>;
}

const folderSchema = new Schema<IFolder>({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  documents: Array<Object>,
  subFolders: [{
    type: Schema.Types.ObjectId,
    ref: 'Folder',
  }],
});

folderSchema.pre<IFolder>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>("Folder", folderSchema);

export default Folder;
