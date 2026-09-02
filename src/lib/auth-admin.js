import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: "Unauthorized", status: 401 };
  }

  const userId = session.user.id || session.user.email;
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    return { authorized: false, error: "User not found", status: 404 };
  }

  const userData = userDoc.data();
  const isAdmin =
    userData.role === "admin" ||
    (process.env.INITIAL_ADMIN_EMAIL &&
      session.user.email?.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase());

  if (!isAdmin) {
    return { authorized: false, error: "Forbidden: Admin access required", status: 403 };
  }

  return { authorized: true, user: userData, session };
}
