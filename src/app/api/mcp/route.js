import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { AIService } from "@/lib/services/ai";
import { defaultTemplates } from "@/lib/templates";

export const dynamic = "force-dynamic";

/**
 * Authenticate API key from Authorization header, params, or query string
 */
async function authenticateKey(req, bodyParams = {}) {
  let apiKey = null;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    apiKey = authHeader.replace("Bearer ", "").trim();
  }

  if (!apiKey && bodyParams?._meta?.apiKey) {
    apiKey = bodyParams._meta.apiKey;
  }

  if (!apiKey) {
    const url = new URL(req.url);
    apiKey = url.searchParams.get("key");
  }

  if (!apiKey) return null;

  // Query user by apiKey
  const usersSnap = await db
    .collection("users")
    .where("apiKey", "==", apiKey)
    .limit(1)
    .get();

  if (usersSnap.empty) return null;

  const userDoc = usersSnap.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

export async function GET(req) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "maxmotion.ai";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  return NextResponse.json({
    name: "MaxMotion AI MCP Server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description:
      "Model Context Protocol (MCP) server for MaxMotion AI. Connect Claude, Cursor, and VS Code to direct video generations across Wan 2.1, Kling 1.5, Minimax, and Seedance.",
    endpoint: `${baseUrl}/api/mcp`,
    documentation: `${baseUrl}/mcp`,
    tools: ["generate_video", "check_video_status", "list_models", "list_templates"],
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, method, params } = body;

    // 1. MCP Protocol Handshake: initialize
    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "maxmotion-ai",
            version: "1.0.0",
          },
        },
      });
    }

    if (method === "notifications/initialized") {
      return NextResponse.json({ jsonrpc: "2.0", result: {} });
    }

    // 2. MCP Tool Listing: tools/list
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "generate_video",
              description:
                "Generate cinematic AI videos with MaxMotion AI. Supports Wan 2.1 (35mm lighting & landscapes), Kling 1.5 Pro (human motion & physical anatomy), Minimax Hailuo (emotional facial acting), and Seedance 2.0 (high speed action).",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "Visual scene description and cinematic prompt.",
                  },
                  model: {
                    type: "string",
                    enum: ["wan-2.1", "kling-1.5", "minimax", "seedance-2.0", "seedance-mini"],
                    description:
                      "AI engine to direct: 'wan-2.1' (cinematic lighting), 'kling-1.5' (human movement), 'minimax' (character facial acting), 'seedance-2.0' (high speed). Default: 'wan-2.1'",
                  },
                  aspectRatio: {
                    type: "string",
                    enum: ["16:9", "9:16"],
                    description: "Aspect ratio (16:9 for landscape, 9:16 for vertical TikTok/Reels). Default: '16:9'",
                  },
                  cameraMotion: {
                    type: "string",
                    enum: ["auto", "pan_left", "pan_right", "tilt_up", "tilt_down", "zoom_in", "zoom_out", "orbit", "static"],
                    description: "Camera motion directive. Default: 'auto'",
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "check_video_status",
              description:
                "Check the status and retrieve the final rendered MP4 video URL of a previously submitted generation.",
              inputSchema: {
                type: "object",
                properties: {
                  requestId: {
                    type: "string",
                    description: "The unique requestId returned from generate_video.",
                  },
                },
                required: ["requestId"],
              },
            },
            {
              name: "list_models",
              description:
                "List all 5 available AI video models on MaxMotion AI with their key strengths and recommended scene types.",
              inputSchema: { type: "object" },
            },
            {
              name: "list_templates",
              description:
                "List 12 curated production-grade cinematic, automotive, sci-fi, and action storyboard templates.",
              inputSchema: { type: "object" },
            },
          ],
        },
      });
    }

    // 3. MCP Tool Execution: tools/call
    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      // Public / info tools
      if (toolName === "list_models") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  [
                    {
                      id: "wan-2.1",
                      name: "Wan 2.1 (Alibaba 14B)",
                      bestFor: "Atmospheric 35mm lighting, landscapes, sci-fi megacities, and low credit rates.",
                    },
                    {
                      id: "kling-1.5",
                      name: "Kling 1.5 Pro",
                      bestFor: "Realistic human physical movement, walking, dancing, and hand anatomy preservation.",
                    },
                    {
                      id: "minimax",
                      name: "Minimax Hailuo",
                      bestFor: "Emotional facial micro-expressions, character close-ups, and dramatic acting.",
                    },
                    {
                      id: "seedance-2.0",
                      name: "Seedance 2.0",
                      bestFor: "High-speed action, vehicle drifts, dynamic camera movement, and fast turnaround.",
                    },
                    {
                      id: "seedance-mini",
                      name: "Seedance Mini",
                      bestFor: "Quick draft iteration at a 50% discount on credit consumption.",
                    },
                  ],
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "list_templates") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(defaultTemplates, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "check_video_status") {
        const { requestId } = toolArgs;
        if (!requestId) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "requestId is required" },
          });
        }

        const creationDoc = await db.collection("creations").doc(requestId).get();
        if (!creationDoc.exists) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `No creation found for requestId: ${requestId}`,
                },
              ],
            },
          });
        }

        const cData = creationDoc.data();
        const host = req.headers.get("host") || "maxmotion.ai";
        const protocol = req.headers.get("x-forwarded-proto") || "https";

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: cData.status,
                    model: cData.model,
                    prompt: cData.prompt,
                    videoUrl: cData.imageUrl || null,
                    shareUrl: `${protocol}://${host}/v/${requestId}`,
                    createdAt: cData.createdAt,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "generate_video") {
        const user = await authenticateKey(req, params);
        if (!user) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32000,
              message:
                "Authentication required. Provide your MaxMotion API key via 'Authorization: Bearer mm_live_...' or append '?key=mm_live_...' to the MCP URL. Get your key at /settings or /mcp.",
            },
          });
        }

        const { prompt, model = "wan-2.1", aspectRatio = "16:9", cameraMotion = "auto" } = toolArgs;
        if (!prompt) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "prompt is required" },
          });
        }

        // Calculate credit cost
        const duration = 5;
        const creditCost = AIService.calculateCredits({
          model,
          duration,
          resolution: "720p",
          mode: "text-to-video",
        });

        // Verify credit balance if not using personal BYOK
        if (!user.byokEnabled && (user.credits || 0) < creditCost) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32001,
              message: `Insufficient credits. Generation requires ${creditCost} credits, but your account has ${user.credits || 0}. Please top up at /pricing.`,
            },
          });
        }

        let finalPrompt = prompt.trim();
        if (cameraMotion && cameraMotion !== "auto" && !finalPrompt.toLowerCase().includes("camera")) {
          finalPrompt = `${finalPrompt}, ${cameraMotion.replace("_", " ")} camera movement`;
        }

        // Trigger AI Generation
        const host = req.headers.get("host") || "maxmotion.ai";
        const protocol = req.headers.get("x-forwarded-proto") || "https";
        const baseUrl = `${protocol}://${host}`;

        const result = await AIService.generateVideo({
          mode: "text-to-video",
          prompt: finalPrompt,
          model,
          aspectRatio,
          duration,
          resolution: "720p",
          quality: "high",
          byokEnabled: Boolean(user.byokEnabled),
          byokApiKey: user.byokApiKey,
          byokFalKey: user.byokFalKey,
          userId: user.id,
          webhookBaseUrl: baseUrl,
        });

        // Deduct credits if not BYOK
        if (!user.byokEnabled) {
          await db
            .collection("users")
            .doc(user.id)
            .update({
              credits: Math.max(0, (user.credits || 0) - creditCost),
            });
        }

        // Save creation record
        await db.collection("creations").doc(result.requestId).set({
          userId: user.id,
          prompt: finalPrompt,
          model,
          aspectRatio,
          duration,
          resolution: "720p",
          mode: "text-to-video",
          cameraMotion,
          status: "pending",
          creditsUsed: user.byokEnabled ? 0 : creditCost,
          source: "mcp_connector",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `🎬 Video generation dispatched successfully!\n- Request ID: ${result.requestId}\n- Model: ${model}\n- Aspect Ratio: ${aspectRatio}\n- Status: Pending GPU synthesis (~20-40s)\n- Share & View Link: ${baseUrl}/v/${result.requestId}\n\nYou can use the check_video_status tool with requestId: "${result.requestId}" in 20 seconds to fetch the rendered MP4 file.`,
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not supported: ${method}` },
    });
  } catch (error) {
    console.error("[MCP_SERVER_ERROR]", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: error.message || "Internal MCP error" },
      },
      { status: 500 }
    );
  }
}
