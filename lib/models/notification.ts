import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";
import "./document";

export interface INotification extends MongooseDocument {
  userEmail: string;
  documentId: mongoose.Types.ObjectId;
  documentTitle?: string;
  senderName?: string;
  senderEmail?: string;
  senderImage?: string;
  actionType?: "share" | "role_update" | "comment" | "general";
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userEmail: { type: String, required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Documents', required: true },
    documentTitle: { type: String, default: "" },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, default: "" },
    senderImage: { type: String, default: "" },
    actionType: { 
      type: String, 
      enum: ["share", "role_update", "comment", "general"], 
      default: "share" 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Notifications: Model<INotification> = mongoose.models.Notifications || mongoose.model<INotification>("Notifications", notificationSchema);
export default Notifications;
