import { storage, db } from "../firebase/admin";
import { SettingsService } from "./settings";

export const StorageService = {
  /**
   * Stream and mirror an upstream video into Firebase Storage so the URL never expires.
   */
  async mirrorVideoToFirebase(remoteUrl, requestId) {
    if (!remoteUrl || !requestId) return remoteUrl;

    try {
      const settings = await SettingsService.getSettings();
      if (settings.storage?.mirrorToFirebase === false) {
        return remoteUrl;
      }

      // Fetch video buffer from remote upstream CDN
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        console.warn(`[STORAGE_MIRROR] Failed to download remote video: ${response.status}`);
        return remoteUrl;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const bucket = storage.bucket(settings.storage?.bucketName || undefined);
      const destinationPath = `creations/${requestId}.mp4`;
      const file = bucket.file(destinationPath);

      await file.save(buffer, {
        metadata: {
          contentType: "video/mp4",
          metadata: {
            requestId,
            mirroredAt: new Date().toISOString(),
          },
        },
      });

      // Attempt to make public; if permissions disallow, generate signed URL
      let permanentUrl = "";
      try {
        await file.makePublic();
        permanentUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
      } catch (e) {
        // Fallback to 10-year signed URL
        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        });
        permanentUrl = signedUrl;
      }

      // Update creation record in Firestore with the permanent URL
      await db.collection("creations").doc(requestId).update({
        imageUrl: permanentUrl,
        storageUrl: permanentUrl,
        originalCdnUrl: remoteUrl,
        isMirrored: true,
        updatedAt: new Date().toISOString(),
      });

      return permanentUrl;
    } catch (err) {
      console.error("[STORAGE_MIRROR_ERROR]", err);
      return remoteUrl;
    }
  },
};

export default StorageService;
