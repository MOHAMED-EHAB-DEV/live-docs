import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.action";
import { getUser, getUsers } from "@/lib/actions/user.actions";
import { authOptions } from "@/auth";

const page = async ({ params: { id } }: SearchParamProps) => {
  const session = await getServerSession(authOptions);
  const user = await getUser({ email: session?.user.email! });
  if (!user) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: user?.email as string,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getUsers({ userIds });

  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user?.email as string]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[user?.email as string]?.includes(
    "room:write"
  )
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
        currentUser={user as IUser}
      />
    </main>
  );
};

export default page;
