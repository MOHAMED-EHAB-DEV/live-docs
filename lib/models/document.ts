import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocument extends Document {
  documents: Array<Object>;
  authorEmail: String;
}

const subDocSchema = new Schema(
  {
    id: {
      type: String,
    },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>({
  authorEmail: {
    type: String,
  },
  documents: [subDocSchema],
});

const Documents: Model<IDocument> =
  mongoose.models.Documents ||
  mongoose.model<IDocument>("Documents", documentSchema);

export default Documents;
