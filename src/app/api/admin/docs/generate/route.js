import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const scriptPath = path.resolve(process.cwd(), "scripts/generate-manuals.js");
    const { stdout, stderr } = await execPromise(`node "${scriptPath}"`);

    return NextResponse.json({
      success: true,
      message: "Documentation manuals regenerated and updated successfully",
      output: stdout || stderr,
    });
  } catch (error) {
    console.error("[DOCS_GENERATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to generate manuals" }, { status: 500 });
  }
}
