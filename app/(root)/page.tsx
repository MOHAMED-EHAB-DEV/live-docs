import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import Header from "@/components/Header";
import { getDocuments } from "@/lib/actions/room.action";
import Notifications from "@/components/Notifications";
import { getUser } from "@/lib/actions/user.actions";
import { authOptions } from "@/auth";
import UserDropdown from "@/components/UserDropdown";
import Documents from "@/components/Documents";

const Home = async () => {
  const session = await getServerSession(authOptions);
  const user = await getUser({ email: session?.user?.email! });
  if (!user) {
    redirect("/sign-in");
  }

  const roomDocuments = await getDocuments(user?.email!);

  return (
    <main className="home-container">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <UserDropdown user={user as unknown as IUser} />
        </div>
      </Header>
      <Documents rDocuments={roomDocuments} user={user as unknown as IUser} />
    </main>
  );
};

export default Home;
