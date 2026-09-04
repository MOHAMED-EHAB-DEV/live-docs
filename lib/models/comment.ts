import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";
import "./document";

export interface IComment extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  authorEmail: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Documents', required: true },
    authorEmail: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Comments: Model<IComment> = mongoose.models.Comments || mongoose.model<IComment>("Comments", commentSchema);
export default Comments;
