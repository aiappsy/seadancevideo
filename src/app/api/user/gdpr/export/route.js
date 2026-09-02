import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch User Record
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Mask sensitive API keys in export
    if (userData.byokApiKey) userData.byokApiKey = "***MASKED***";
    if (userData.byokFalKey) userData.byokFalKey = "***MASKED***";

    // 2. Fetch User Creations
    const creationsSnap = await db
      .collection("creations")
      .where("userId", "==", userId)
      .get();
    const creations = creationsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // 3. Fetch User Transactions
    let transactions = [];
    try {
      const txSnap = await db
        .collection("transactions")
        .where("userId", "==", userId)
        .get();
      transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {}

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      compliance: "GDPR Article 20 Data Portability & CCPA",
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name,
        ...userData,
      },
      creationsCount: creations.length,
      creations,
      transactionsCount: transactions.length,
      transactions,
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="maxmotion-export-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error("[GDPR_EXPORT_ERROR]", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
