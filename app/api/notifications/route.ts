import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Notifications from "@/lib/models/notification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const notifications = await Notifications.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      userEmail,
      documentId,
      documentTitle,
      senderName,
      senderEmail,
      senderImage,
      actionType,
      message,
    } = await request.json();

    if (!userEmail || !documentId || !message) {
      return NextResponse.json(
        { error: "userEmail, documentId, and message are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notification = await Notifications.create({
      userEmail,
      documentId,
      documentTitle: documentTitle || "",
      senderName: senderName || "",
      senderEmail: senderEmail || "",
      senderImage: senderImage || "",
      actionType: actionType || "share",
      message,
      isRead: false,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, email, markAllRead } = await request.json();

    await connectToDatabase();

    if (markAllRead && email) {
      await Notifications.updateMany(
        { userEmail: email, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      const updated = await Notifications.findByIdAndUpdate(
        notificationId,
        { $set: { isRead: true } },
        { new: true }
      );
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json({ error: "notificationId or email required" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("notificationId");
    const email = searchParams.get("email");
    const clearAll = searchParams.get("clearAll") === "true";

    await connectToDatabase();

    if (clearAll && email) {
      await Notifications.deleteMany({ userEmail: email });
      return NextResponse.json({ success: true, message: "Notifications cleared" });
    }

    if (notificationId) {
      await Notifications.findByIdAndDelete(notificationId);
      return NextResponse.json({ success: true, message: "Notification deleted" });
    }

    return NextResponse.json({ error: "notificationId or email required" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
