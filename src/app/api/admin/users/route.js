import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { db } from "@/lib/firebase/admin";
import { UserService } from "@/lib/services/user";

export async function GET(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";

    const snapshot = await db.collection("users").get();
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Anonymous",
        email: data.email || "",
        image: data.image || null,
        credits: typeof data.credits === "number" ? data.credits : 10,
        role: data.role || "user",
        status: data.status || "active",
        byokEnabled: Boolean(data.byokEnabled),
        hasByokKey: Boolean(data.byokApiKey),
        activePlanId: data.activePlanId || "none",
        planType: data.planType || "none",
        createdAt: data.createdAt || null,
      };
    });

    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.id.toLowerCase().includes(search)
      );
    }

    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json(users);
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { userId, creditsAdjustment, role, status, byokEnabled } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates = { updatedAt: new Date().toISOString() };

    if (role && ["user", "admin"].includes(role)) {
      updates.role = role;
    }

    if (status && ["active", "suspended"].includes(status)) {
      updates.status = status;
    }

    if (typeof byokEnabled === "boolean") {
      updates.byokEnabled = byokEnabled;
    }

    if (typeof creditsAdjustment === "number" && creditsAdjustment !== 0) {
      if (creditsAdjustment > 0) {
        await UserService.addCredits(userId, creditsAdjustment);
      } else {
        const current = await UserService.getCredits(userId);
        const newBalance = Math.max(0, current + creditsAdjustment);
        updates.credits = newBalance;
      }
    }

    await userRef.set(updates, { merge: true });
    const updatedDoc = await userRef.get();

    return NextResponse.json({ success: true, user: { id: userId, ...updatedDoc.data() } });
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
