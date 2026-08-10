import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const search = searchParams.get("search");
    
    await connectToDatabase();

    let query: any = {};

    if (email) {
      const user = await User.findOne({ email }).select("-password");
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

    if (search) {
       query.email = { $regex: search, $options: "i" };
    }

    const users = await User.find(query).select("-password").limit(10);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const { email, updates } = await request.json();
    
        if (!email) {
          return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
    
        await connectToDatabase();
    
        const user = await User.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true }
        ).select("-password");
    
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "User Successfully Updated", user });
      } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}
