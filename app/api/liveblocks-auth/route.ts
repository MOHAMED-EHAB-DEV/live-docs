import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { getUser } from "@/lib/actions/user.actions";
import { authOptions } from "@/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const User = await getUser({ email: session?.user.email! });
  if (!User) redirect("/sign-in");

  const { _id, name, email, image } = User;
  // Get the current user from your database
  const user = {
    id: _id as string,
    info: {
      id: _id as string,
      name,
      email,
      avatar: image as string,
      color: getUserColor(_id as string),
    },
  };

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info }
  );

  return new Response(body, { status });
}
