/**
 * Centralized configuration for the SaaS template.
 * All environment variables are validated and exported from here.
 */

const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Seedance V2 Workspace",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    plans: {
      basic: {
        id: "basic",
        name: "Basic Pack",
        credits: 100,
        price: 500, // $5.00 (in cents)
        currency: "usd",
      },
      standard: {
        id: "standard",
        name: "Standard Pack",
        credits: 250,
        price: 1000, // $10.00 (in cents)
        currency: "usd",
      },
      pro: {
        id: "pro",
        name: "Professional Pack",
        credits: 600,
        price: 2000, // $20.00 (in cents)
        currency: "usd",
      },
      business: {
        id: "business",
        name: "Business Pack",
        credits: 2000,
        price: 5000, // $50.00 (in cents)
        currency: "usd",
      },
      default: {
        id: "default",
        name: "Default Pack",
        credits: 100,
        price: 500,
        currency: "usd",
      }
    }
  },
  ai: {
    seedance: {
      apiKey: process.env.SEEDANCE_V2_API_KEY,
      endpoints: {
        t2v: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2.0-t2v-480p",
          "720p": "https://api.muapi.ai/api/v1/seedance-v2.0-t2v"
        },
        i2v: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2.0-i2v-480p",
          "720p": "https://api.muapi.ai/api/v1/seedance-v2.0-i2v"
        },
        reference: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference-480p",
          "720p": "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference"
        }
      }
    },
    seedanceMini: {
      apiKey: process.env.SEEDANCE_V2_API_KEY,
      endpoints: {
        t2v: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2-mini-text-to-video",
          "720p": "https://api.muapi.ai/api/v1/seedance-2-mini-text-to-video"
        },
        i2v: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2-mini-image-to-video",
          "720p": "https://api.muapi.ai/api/v1/seedance-2-mini-image-to-video"
        },
        reference: {
          "480p": "https://api.muapi.ai/api/v1/seedance-2-mini-omni-reference",
          "720p": "https://api.muapi.ai/api/v1/seedance-2-mini-omni-reference"
        }
      }
    }
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  }
};

// Helpful server-side warnings for missing critical keys
const requiredKeys = [
  ["GOOGLE_CLIENT_ID", config.auth.google.clientId],
  ["GOOGLE_CLIENT_SECRET", config.auth.google.clientSecret],
  ["SEEDANCE_V2_API_KEY", config.ai.seedance.apiKey],
];

if (typeof window === "undefined") {
  requiredKeys.forEach(([name, value]) => {
    if (!value) {
      console.warn(`[CONFIG] Notice: Environment variable ${name} is not set.`);
    }
  });
}

export default config;
