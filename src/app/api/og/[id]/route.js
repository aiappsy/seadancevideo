import { ImageResponse } from "next/og";
import { db } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    let title = "Cinematic AI Video";
    let model = "MaxMotion AI";
    let prompt = "Directed with MaxMotion AI Video Studio";

    try {
      const doc = await db.collection("creations").doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        prompt = data.prompt || prompt;
        model = data.model || model;
        title = `${model.toUpperCase()} Video`;
      }
    } catch (e) {
      console.warn("[OG_IMAGE_FETCH_WARN]", e.message);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
            backgroundColor: "#0a0a0f",
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.25), transparent 70%), linear-gradient(135deg, #0f172a 0%, #030712 100%)",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "24px",
                  color: "#000",
                }}
              >
                M
              </div>
              <span style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>
                MaxMotion AI
              </span>
            </div>

            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 20px",
                borderRadius: "30px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#fbbf24",
                textTransform: "uppercase",
              }}
            >
              {model}
            </div>
          </div>

          {/* Center Play Icon & Prompt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "rgba(251, 191, 36, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)",
              }}
            >
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderTop: "14px solid transparent",
                  borderBottom: "14px solid transparent",
                  borderLeft: "24px solid black",
                  marginLeft: "6px",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "36px",
                fontWeight: "800",
                lineHeight: "1.25",
                color: "#f8fafc",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                maxWidth: "950px",
              }}
            >
              &ldquo;{prompt}&rdquo;
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "24px",
              fontSize: "18px",
              color: "#94a3b8",
            }}
          >
            <span>Watch Full HD Video Showcase</span>
            <span style={{ color: "#fbbf24", fontWeight: "bold" }}>maxmotion.ai</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("[OG_ERROR]", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
