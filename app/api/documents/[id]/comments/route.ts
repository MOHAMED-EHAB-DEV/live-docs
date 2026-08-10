import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Comments from "@/lib/models/comment";
import Documents from "@/lib/models/document";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const comments = await Comments.find({ documentId: id }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await params;
      const { authorEmail, content } = await request.json();
      
      if(!authorEmail || !content) {
          return NextResponse.json({ error: "authorEmail and content are required" }, { status: 400 });
      }

      await connectToDatabase();
  
      const newComment = await Comments.create({
          documentId: id,
          authorEmail,
          content
      });

      // Get document details to return for notification generation by socket server
      const docDetails = await Documents.findById(id).select('collaborators authorEmail title');
  
      return NextResponse.json({ 
          success: true, 
          newComment, 
          docDetails,
          insertedId: newComment._id 
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
