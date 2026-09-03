import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";

export const SUPER_ADMIN_EMAIL = "paljuritzen@gmail.com";

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { authorized: false, error: "Unauthorized", status: 401 };
  }

  const email = session.user.email.trim().toLowerCase();
  if (email !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return {
      authorized: false,
      error: `Forbidden: Administrative console strictly restricted to ${SUPER_ADMIN_EMAIL}`,
      status: 403,
    };
  }

  return { authorized: true, user: session.user, session };
}
