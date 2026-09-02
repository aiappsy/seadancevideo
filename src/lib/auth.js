import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./firebase/admin";
import { UserService } from "./services/user";
import { SettingsService } from "./services/settings";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Email Studio Pass",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "you@example.com" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      const email = credentials.email.trim().toLowerCase();
      if (!email || !email.includes("@")) return null;
      return {
        id: email,
        name: email.split("@")[0],
        email: email,
        image: null,
      };
    },
  })
);

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      const userId = user.id || user.email;

      try {
        const userRef = db.collection("users").doc(userId);
        const doc = await userRef.get();

        const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
        const isInitialAdmin = initialAdminEmail && user.email.toLowerCase() === initialAdminEmail;

        if (!doc.exists) {
          const settings = await SettingsService.getSettings();
          const welcomeCredits = settings.general?.defaultCredits ?? 10;

          await userRef.set({
            id: userId,
            name: user.name || "",
            email: user.email || "",
            image: user.image || "",
            role: isInitialAdmin ? "admin" : "user",
            status: "active",
            credits: welcomeCredits,
            byokEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (isInitialAdmin && doc.data()?.role !== "admin") {
          await userRef.update({ role: "admin", updatedAt: new Date().toISOString() });
        }
      } catch (e) {
        console.error("[AUTH_SIGNIN_SYNC_ERROR]", e);
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user.email;
      }

      const uid = token.id || token.sub;
      if (uid) {
        token.id = uid;
        try {
          const userDoc = await db.collection("users").doc(uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            token.credits = typeof data.credits === "number" ? data.credits : 10;
            token.role = data.role || "user";
            token.byokEnabled = Boolean(data.byokEnabled);
          } else {
            token.credits = await UserService.getCredits(uid);
            token.role = "user";
          }
        } catch (e) {
          if (token.credits === undefined) token.credits = 10;
          if (!token.role) token.role = "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.credits = typeof token.credits === "number" ? token.credits : 10;
        session.user.role = token.role || "user";
        session.user.byokEnabled = Boolean(token.byokEnabled);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "maxmotion-production-jwt-auth-secret-key-2026-safe",
  trustHost: true,
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
