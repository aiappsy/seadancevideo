import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { PlansService } from "@/lib/services/plans";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const plans = await PlansService.getPlans(false);
    return NextResponse.json(plans);
  } catch (error) {
    console.error("[ADMIN_PLANS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: "Plan name and price are required" }, { status: 400 });
    }

    const created = await PlansService.createPlan(body);
    return NextResponse.json({ success: true, plan: created });
  } catch (error) {
    console.error("[ADMIN_PLANS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const updated = await PlansService.updatePlan(body.id, body);
    return NextResponse.json({ success: true, plan: updated });
  } catch (error) {
    console.error("[ADMIN_PLANS_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    await PlansService.deletePlan(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[ADMIN_PLANS_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete plan" }, { status: 500 });
  }
}
