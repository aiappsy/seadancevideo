import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCP_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    "seedance-ai-app";

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    // Replace escaped newlines if passed in environment variable
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  }

  // Fallback to Google Application Default Credentials (ADC) on Google Cloud Run
  return initializeApp({
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  });
}

const app = initFirebaseAdmin();
export const db = getFirestore(app);
// Ignore undefined properties so Firestore writes don't throw on undefined fields
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  // Ignored if already initialized by another module/worker
}

export const adminAuth = getAuth(app);
export const storage = getStorage(app);
export default app;
