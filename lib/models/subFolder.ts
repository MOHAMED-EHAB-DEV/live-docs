import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubFolder extends Document {
  name: String;
  updatedAt: Date;
  documents: Array<Object>;
  authorId: String;
  subFolders: Array<ISubFolder>;
  parentId: String,
}

const subFolderSchema = new Schema<ISubFolder>({
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
  parentId: {
    type: String,
    required: true,
  }
});

subFolderSchema.pre<ISubFolder>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const SubFolder: Model<ISubFolder> =
  mongoose.models.SubFolder || mongoose.model<ISubFolder>("SubFolder", subFolderSchema);

export default SubFolder;
