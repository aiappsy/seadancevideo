import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { capturePayPalOrder } from "@/lib/paypal";
import { PlansService } from "@/lib/services/plans";
import { UserService } from "@/lib/services/user";
import { db } from "@/lib/firebase/admin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { orderId, planId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const captureData = await capturePayPalOrder(orderId);

    if (captureData.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal order not completed. Current status: ${captureData.status}` },
        { status: 400 }
      );
    }

    // Resolve plan
    const plan = await PlansService.getPlanById(planId);
    const userId = session.user.id;

    // Apply plan perks to user
    if (plan) {
      if (plan.type === "byok") {
        // Activate BYOK membership
        await db.collection("users").doc(userId).set(
          {
            byokEnabled: true,
            activePlanId: plan.id,
            planType: "byok",
            subscriptionStatus: "active",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        // Credit pack / AI Included
        if (plan.credits > 0) {
          await UserService.addCredits(userId, plan.credits);
        }
        await db.collection("users").doc(userId).set(
          {
            activePlanId: plan.id,
            planType: "ai_included",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    // Record transaction
    const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    await db.collection("transactions").add({
      userId,
      orderId,
      gateway: "paypal",
      planId: planId || "unknown",
      amount: captureUnit?.amount?.value || plan?.price || 0,
      currency: captureUnit?.amount?.currency_code || "USD",
      status: "completed",
      creditsAdded: plan?.credits || 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment captured successfully!",
      plan: plan?.name,
    });
  } catch (error) {
    console.error("[PAYPAL_CAPTURE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to capture PayPal order" }, { status: 500 });
  }
}
