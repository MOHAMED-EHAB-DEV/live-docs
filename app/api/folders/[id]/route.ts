import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Folder from "@/lib/models/folder";
import { buildFolderTree } from "../route";

// Helper to recursively collect all descendant IDs of a folder
async function getAllDescendantFolderIds(parentId: string): Promise<string[]> {
  const children = await Folder.find({ parentId }).select("_id").lean();
  let ids: string[] = children.map((c) => c._id.toString());

  for (const childId of ids) {
    const subDescendants = await getAllDescendantFolderIds(childId);
    ids = ids.concat(subDescendants);
  }

  return ids;
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectToDatabase();

    const folder = await Folder.findByIdAndUpdate(
      id,
      { name: name.trim(), updatedAt: new Date() },
      { new: true },
    );

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, folder }, { status: 200 });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    await connectToDatabase();

    // Collect all descendant folder IDs to delete
    const descendantIds = await getAllDescendantFolderIds(id);
    const allIdsToDelete = [id, ...descendantIds];

    // Delete all descendant folders and the target folder
    await Folder.deleteMany({ _id: { $in: allIdsToDelete } });

    // Return updated folder tree for the user
    let folders: any[] = [];
    if (email) {
      const allFolders = await Folder.find({ authorId: email })
        .populate("documents")
        .sort({ updatedAt: -1 })
        .lean();

      folders = buildFolderTree(allFolders);
    }

    return NextResponse.json({ success: true, folders }, { status: 200 });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
