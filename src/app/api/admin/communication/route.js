import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { CommunicationService } from "@/lib/services/communication";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const messages = await CommunicationService.getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[ADMIN_COMMUNICATION_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { title, message, type = "info", targetUserId = "all", sendEmail = false } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const created = await CommunicationService.createMessage({
      title,
      message,
      type,
      targetUserId,
      authorEmail: auth.session.user.email || "Admin",
      sendEmail,
    });

    return NextResponse.json({ success: true, message: created });
  } catch (error) {
    console.error("[ADMIN_COMMUNICATION_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
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
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await CommunicationService.deleteMessage(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[ADMIN_COMMUNICATION_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete message" }, { status: 500 });
  }
}
