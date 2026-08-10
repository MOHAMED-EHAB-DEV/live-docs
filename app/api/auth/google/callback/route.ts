import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/sign-in?error=NoCodeProvided", req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing Google credentials or redirect URI");
      return NextResponse.redirect(new URL("/sign-in?error=ServerConfigError", req.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Failed to get Google access token", tokenData);
      return NextResponse.redirect(new URL("/sign-in?error=GoogleTokenError", req.url));
    }

    // Fetch user profile from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.email) {
      console.error("Failed to fetch Google user profile", userData);
      return NextResponse.redirect(new URL("/sign-in?error=GoogleProfileError", req.url));
    }

    await connectToDatabase();

    // Check if user exists
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      // Create a new user with provider "google"
      user = await User.create({
        name: userData.name || "Google User",
        email: userData.email,
        image: userData.picture || "",
        provider: "google",
        verified: true, // Auto-verify Google accounts
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    // Redirect to home and set cookie
    const response = NextResponse.redirect(new URL("/", req.url));

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.redirect(new URL("/sign-in?error=InternalError", req.url));
  }
}
