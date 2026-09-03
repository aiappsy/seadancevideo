import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { AppKeyService } from "@/lib/services/app-key";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const keyAuth = !session?.user ? await AppKeyService.authenticateRequest(req) : null;

  if (!session?.user && !keyAuth?.isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id || keyAuth?.id;
  const isMaster = keyAuth?.isMasterKey;

  try {
    let query = db.collection("creations");
    if (!isMaster && userId) {
      query = query.where("userId", "==", userId);
    }

    const snapshot = await query.get();

    const creations = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json(creations);
  } catch (error) {
    console.error("Fetch creations error:", error);
    return NextResponse.json({ error: "Failed to fetch creations" }, { status: 500 });
  }
}
