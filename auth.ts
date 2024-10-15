import { type DefaultSession, type NextAuthOptions, type JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./lib/database";
import User, { IUser } from "./lib/models/user";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // You can add more custom properties here, such as role
      // role: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    userId: string;
    // Optionally add other fields you'd like to store in the JWT token
    // role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    newUser: "/sign-up",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectToDatabase();

      const existingUser: IUser | null = await User.findOne({
        email: user.email,
      });

      if (!existingUser) {
        const newUser = new User({
          name: user.name,
          email: user.email,
          image: user.image,
          provider: account?.provider,
          createdAt: new Date(),
          verified: false,
        });

        await newUser.save();
        console.log("New user created:", newUser);
      } else {
        console.log("User already exists:", existingUser);
      }

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
};
