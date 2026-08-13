
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import Header from "@/components/Header";
import Notifications from "@/components/Notifications";
import UserDropdown from "@/components/UserDropdown";
import Documents from "@/components/Documents";
import DeveloperBadge from "@/components/DeveloperBadge";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function fetchDocuments(email: string, userId: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const [docsRes, foldersRes] = await Promise.all([
      fetch(`${baseUrl}/api/documents?email=${email}&userId=${userId}`, {
        headers: { Cookie: `token=${token}` },
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/folders?email=${email}`, {
        headers: { Cookie: `token=${token}` },
        cache: "no-store",
      }),
    ]);

    const [docsData, foldersData] = await Promise.all([
      docsRes.json(),
      foldersRes.json(),
    ]);

    return {
      documents: docsData.success ? docsData.documents : [],
      folders: foldersData.success ? foldersData.folders : [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { documents: [], folders: [] };
  }
}

const Home = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value as string;

  let user: any = null;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.error("Invalid token");
    }
  }

  // Fallback if proxy misses it, shouldn't render anyway
  if (!user) return null;

  const roomDocuments = await fetchDocuments(user.email, user.userId, token);

  return (
    <main className="home-container">
      <Header className="sticky inset-s-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <UserDropdown />
        </div>
      </Header>
      <Documents rDocuments={roomDocuments} />
      <DeveloperBadge variant="floating" />
    </main>
  );
};

export default Home;
