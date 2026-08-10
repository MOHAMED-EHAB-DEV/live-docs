import mongoose, {
  Schema,
  Document as MongooseDocument,
  Model,
} from "mongoose";

export interface ICollaborator {
  user: mongoose.Types.ObjectId | any;
  userType: "editor" | "viewer";
  addedBy?: mongoose.Types.ObjectId | any;
}

export interface IDocument extends MongooseDocument {
  title: string;
  content: string;
  authorEmail: string;
  collaborators: ICollaborator[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collaboratorSchema = new Schema<ICollaborator>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userType: { type: String, enum: ["editor", "viewer"], default: "viewer" },
  addedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { _id: false });

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, default: "Untitled Document" },
    content: { type: String, default: "" },
    authorEmail: { type: String, required: true },
    collaborators: [collaboratorSchema],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Documents;
}

const Documents: Model<IDocument> =
  mongoose.models.Documents ||
  mongoose.model<IDocument>("Documents", documentSchema);

export default Documents;
