import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Documents from "@/lib/models/document";
import Folder from "@/lib/models/folder";
import SubFolder from "@/lib/models/subFolder";

export async function POST(request: Request) {
  try {
    const { email, title, folderId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newDoc = await Documents.create({
      title: title || "Untitled",
      authorEmail: email,
      content: "",
      collaborators: [],
      isPublic: false,
    });

    if (folderId) {
      const updatedFolder = await Folder.findByIdAndUpdate(folderId, {
        $push: { documents: newDoc._id },
      });
      if (!updatedFolder) {
        await SubFolder.findByIdAndUpdate(folderId, {
          $push: { documents: newDoc._id },
        });
      }
    }

    return NextResponse.json({ success: true, document: newDoc });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Fetch documents where the user is the author or a collaborator (checking user ObjectId)
    const documents = await Documents.find({
      $or: [{ authorEmail: email }, { "collaborators.user": userId }],
    })
      .populate("collaborators.user", "name email image")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
