import { notFound, redirect } from "next/navigation";
import CollaborativeRoom from "@/components/CollaborativeRoom";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function fetchDocument(id: string) {
  const docRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/documents/${id}`, {
    cache: "no-store",
  });
  if (!docRes.ok) return null;
  const data = await docRes.json();
  return data.document;
}

const DocumentPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;

  const document = await fetchDocument(id);
  if (!document) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let user: any = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.error("Invalid token");
    }
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Verify access
  const isAuthor = document.authorEmail === user.email;
  const isCollaborator = document.collaborators?.some((c: any) => c.user?.email === user.email);
  if (!isAuthor && !isCollaborator && !document.isPublic) {
    redirect("/");
  }

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        documentId={id}
        document={document}
        users={[]} // We will fetch users dynamically or inside the component if needed
        folderId={""} // Folders will be handled later
      />
    </main>
  );
};

export default DocumentPage;
