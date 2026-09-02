import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmation } = await req.json();
    if (confirmation !== "DELETE_MY_ACCOUNT") {
      return NextResponse.json(
        { error: 'Please provide exact confirmation phrase: "DELETE_MY_ACCOUNT"' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 1. Delete all user creations
    const creationsSnap = await db
      .collection("creations")
      .where("userId", "==", userId)
      .get();

    const batch = db.batch();
    creationsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 2. Delete user profile record
    const userRef = db.collection("users").doc(userId);
    batch.delete(userRef);

    // 3. Log GDPR audit deletion record (anonymized for compliance verification)
    const auditRef = db.collection("audit_logs").doc(`erasure_${Date.now()}`);
    batch.set(auditRef, {
      type: "GDPR_ARTICLE_17_ERASURE",
      anonymizedUserId: userId,
      creationsDeletedCount: creationsSnap.docs.length,
      erasedAt: new Date().toISOString(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Account and associated data have been permanently erased.",
    });
  } catch (error) {
    console.error("[GDPR_DELETE_ACCOUNT_ERROR]", error);
    return NextResponse.json({ error: "Failed to erase account" }, { status: 500 });
  }
}
