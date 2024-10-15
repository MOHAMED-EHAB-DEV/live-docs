import mongoose, { Schema, Document, Model } from "mongoose";

import { IFolder } from "./folder";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: String;
  createdAt: Date;
  folders: Array<IFolder>;
  verified: Boolean;
}

const subFSchema = new Schema(
  {
    id: {
      type: String,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    folders: [subFSchema],
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
