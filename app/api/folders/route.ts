import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Folder from "@/lib/models/folder";

export function buildFolderTree(allFolders: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  // Pass 1: populate lookup map with items
  for (const f of allFolders) {
    const fId = f._id.toString();
    map.set(fId, {
      id: fId,
      _id: fId,
      name: f.name,
      authorId: f.authorId,
      parentId: f.parentId ? f.parentId.toString() : null,
      updatedAt: f.updatedAt || f.createdAt,
      documents: (f.documents || []).map((doc: any) => ({
        id: doc._id ? doc._id.toString() : doc.toString(),
        _id: doc._id ? doc._id.toString() : doc.toString(),
        title: doc.title || "Untitled Document",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        collaborators: doc.collaborators || [],
        authorEmail: doc.authorEmail,
      })),
      subFolders: [],
    });
  }

  // Pass 2: nest children into their respective parents
  for (const f of allFolders) {
    const fId = f._id.toString();
    const item = map.get(fId);
    const parentKey = f.parentId ? f.parentId.toString() : null;

    if (parentKey && map.has(parentKey)) {
      map.get(parentKey).subFolders.push(item);
    } else if (!parentKey) {
      roots.push(item);
    }
  }

  return roots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const allFolders = await Folder.find({ authorId: email })
      .populate("documents")
      .sort({ updatedAt: -1 })
      .lean();

    const folderTree = buildFolderTree(allFolders);

    return NextResponse.json(
      { success: true, folders: folderTree },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, parentFolderId } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Folder name and email are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    await Folder.create({
      name: name.trim(),
      authorId: email,
      parentId: parentFolderId || null,
      documents: [],
    });

    const allFolders = await Folder.find({ authorId: email })
      .populate("documents")
      .sort({ updatedAt: -1 })
      .lean();

    const folderTree = buildFolderTree(allFolders);

    return NextResponse.json(
      { success: true, folders: folderTree },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
