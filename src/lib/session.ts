import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Guard untuk halaman & server action admin. Redirect ke login bila belum masuk. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  return { ...session.user, id: Number(session.user.id) };
}
