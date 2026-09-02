import Stripe from "stripe";
import { SettingsService } from "./settings";
import { PlansService } from "./plans";
import { UserService } from "./user";
import { db } from "../firebase/admin";

export const BillingService = {
  async getStripeClient() {
    const settings = await SettingsService.getSettings();
    const secretKey = settings.billing.stripe.secretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Stripe Secret Key is not configured in Admin Settings.");
    return new Stripe(secretKey);
  },

  async createCheckoutSession(userId, planId) {
    const stripe = await this.getStripeClient();
    const settings = await SettingsService.getSettings();
    const plan = await PlansService.getPlanById(planId);

    if (!plan) throw new Error(`Plan "${planId}" not found`);

    const appUrl = settings.general?.appUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description:
                plan.type === "byok"
                  ? "BYOK Unlimited Video Generation Access"
                  : `Purchase ${plan.credits} Art Credits for AI Generation.`,
            },
            unit_amount: Math.round(plan.price * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/pricing?success=true&plan=${encodeURIComponent(plan.name)}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        userId,
        planId: plan.id,
        planType: plan.type,
        credits: (plan.credits || 0).toString(),
      },
    });

    return session.url;
  },

  async handleWebhook(body, signature) {
    const settings = await SettingsService.getSettings();
    const webhookSecret = settings.billing.stripe.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = await this.getStripeClient();

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const planType = session.metadata?.planType;
      const credits = parseInt(session.metadata?.credits || "0", 10);

      if (userId) {
        if (planType === "byok") {
          await db.collection("users").doc(userId).set(
            {
              byokEnabled: true,
              activePlanId: planId,
              planType: "byok",
              subscriptionStatus: "active",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } else if (credits > 0) {
          await UserService.addCredits(userId, credits);
          await db.collection("users").doc(userId).set(
            {
              activePlanId: planId,
              planType: "ai_included",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        // Record transaction in Firestore
        await db.collection("transactions").add({
          userId,
          gateway: "stripe",
          sessionId: session.id,
          planId: planId || "unknown",
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          status: "completed",
          creditsAdded: credits,
          createdAt: new Date().toISOString(),
        });

        return { success: true, userId, credits };
      }
    }
    return { success: false };
  },
};

export const createCheckoutSession = BillingService.createCheckoutSession.bind(BillingService);
export const handleWebhook = BillingService.handleWebhook.bind(BillingService);
export default BillingService;
