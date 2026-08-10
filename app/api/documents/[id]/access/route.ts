import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Documents from "@/lib/models/document";
import User from "@/lib/models/user";
import Notifications from "@/lib/models/notification";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const document = await Documents.findById(id)
      .populate("collaborators.user", "name email image")
      .populate("collaborators.addedBy", "name email image");

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, collaborators: document.collaborators || [] });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { email, userType, addedBy, updatedBy } = await request.json();

    if (!email || !userType) {
      return NextResponse.json({ error: "Email and userType are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return NextResponse.json({ error: "User not found with this email" }, { status: 404 });
    }

    let adderId = addedBy?._id || addedBy?.id || updatedBy?._id || updatedBy?.id || null;
    if (!adderId && (addedBy?.email || updatedBy?.email)) {
      const adderUser = await User.findOne({ email: addedBy?.email || updatedBy?.email });
      if (adderUser) adderId = adderUser._id;
    }
    
    // Upsert collaborator: remove if exists, then add with new userType & addedBy
    await Documents.updateOne(
      { _id: id },
      { $pull: { collaborators: { user: userToShareWith._id } } }
    );
    
    const newCollaborator: any = {
      user: userToShareWith._id,
      userType,
    };
    if (adderId) {
      newCollaborator.addedBy = adderId;
    }

    const updatedDocument = await Documents.findByIdAndUpdate(
      id,
      { $push: { collaborators: newCollaborator } },
      { new: true }
    )
      .populate("collaborators.user", "name email image")
      .populate("collaborators.addedBy", "name email image");

    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Create a notification for the invited/updated user
    const senderName = addedBy?.name || updatedBy?.name || (addedBy?.email || updatedBy?.email || "").split("@")[0] || "A collaborator";
    const senderEmail = addedBy?.email || updatedBy?.email || "";
    const senderImage = addedBy?.image || addedBy?.avatar || updatedBy?.image || updatedBy?.avatar || "";
    const docTitle = updatedDocument.title || "Untitled Document";
    const roleLabel = userType === "editor" ? "an editor" : "a viewer";
    const notifMessage = `${senderName} shared "${docTitle}" with you as ${roleLabel}`;

    let createdNotification = null;
    try {
      createdNotification = await Notifications.create({
        userEmail: email,
        documentId: id,
        documentTitle: docTitle,
        senderName,
        senderEmail,
        senderImage,
        actionType: "share",
        message: notifMessage,
        isRead: false,
      });

      // Notify socket server non-blocking
      const socketServerUrl = process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
      fetch(`${socketServerUrl}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: email,
          notification: createdNotification,
        }),
      }).catch(() => {});
    } catch (notifErr) {
      console.error("Failed to create notification document:", notifErr);
    }

    return NextResponse.json({ 
      success: true, 
      collaborators: updatedDocument.collaborators,
      notification: createdNotification
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const userToRemove = await User.findOne({ email });
    if (!userToRemove) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedDocument = await Documents.findByIdAndUpdate(
      id,
      { $pull: { collaborators: { user: userToRemove._id } } },
      { new: true }
    ).populate("collaborators.user", "name email image");

    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, collaborators: updatedDocument.collaborators });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
