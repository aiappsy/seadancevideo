import { db } from "@/lib/firebase/admin";
import Link from "next/link";
import VideoShareClient from "./VideoShareClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const doc = await db.collection("creations").doc(id).get();
    if (!doc.exists) {
      return { title: "Video Not Found | MaxMotion AI" };
    }
    const data = doc.data();
    const promptSummary = data.prompt ? data.prompt.slice(0, 100) : "AI Generated Video";
    const videoUrl = data.imageUrl || data.storageUrl;

    return {
      title: `${promptSummary} | MaxMotion AI`,
      description: data.prompt || "Watch this cinematic AI video generated on MaxMotion AI.",
      openGraph: {
        title: promptSummary,
        description: data.prompt || "AI video generated on MaxMotion AI.",
        type: "video.other",
        videos: videoUrl ? [{ url: videoUrl, type: "video/mp4" }] : [],
        images: [{ url: `/api/og/${id}`, width: 1200, height: 630 }],
      },
      twitter: {
        card: "player",
        title: promptSummary,
        description: data.prompt || "AI video generated on MaxMotion AI.",
        images: [`/api/og/${id}`],
        players: videoUrl
          ? [{ playerUrl: videoUrl, streamUrl: videoUrl, width: 1280, height: 720 }]
          : [],
      },
    };
  } catch (e) {
    return { title: "MaxMotion AI Video" };
  }
}

export default async function VideoPage({ params }) {
  const { id } = await params;
  let creation = null;

  try {
    const doc = await db.collection("creations").doc(id).get();
    if (doc.exists) {
      const d = doc.data();
      creation = {
        id: doc.id,
        prompt: d.prompt || "",
        imageUrl: d.imageUrl || d.storageUrl || "",
        aspectRatio: d.aspectRatio || "16:9",
        resolution: d.resolution || "720p",
        duration: d.duration || 5,
        model: d.model || "seedance-2.0",
        createdAt: d.createdAt,
      };
    }
  } catch (e) {
    console.error("Error fetching creation for page:", e);
  }

  if (!creation) {
    return (
      <div className="min-h-dvh bg-bg-page flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Video Not Found</h1>
        <p className="text-xs text-muted mt-2">
          This creation may have expired or been deleted.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          Go to Studio
        </Link>
      </div>
    );
  }

  return <VideoShareClient creation={creation} />;
}
