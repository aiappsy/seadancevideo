import { db } from "../firebase/admin";

const PLANS_COLLECTION = "plans";

export const defaultPlans = [
  {
    id: "basic",
    name: "Basic Pack",
    type: "ai_included", // 'ai_included' | 'byok'
    interval: "one_time", // 'one_time' | 'month' | 'year'
    price: 5,
    credits: 100,
    description: "Perfect for testing custom prompts and exploring video generation styles.",
    features: ["100 Art Credits", "480p & 720p Resolutions", "Fast Cloud Rendering", "Direct MP4 Downloads"],
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "standard",
    name: "Standard Pack",
    type: "ai_included",
    interval: "one_time",
    price: 10,
    credits: 250,
    description: "Ideal for regular creators wanting HD video manifestations and multi-reference nodes.",
    features: ["250 Art Credits", "Seedance 2.0 & Mini Access", "Multi-Image Reference Mode", "Priority Video Queue"],
    isPopular: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "pro",
    name: "Professional Pack",
    type: "ai_included",
    interval: "one_time",
    price: 20,
    credits: 600,
    description: "Designed for power users demanding maximum volume and high-quality outputs.",
    features: ["600 Art Credits", "Audio & Video Reference Inputs", "Maximum 15s Clip Duration", "Commercial Usage Rights"],
    isPopular: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "business",
    name: "Business Pack",
    type: "ai_included",
    interval: "one_time",
    price: 50,
    credits: 2000,
    description: "Maximum value pack for agency workflows and large batch video generation.",
    features: ["2,000 Art Credits", "Highest Concurrency Tier", "Direct VIP Server Routing", "24/7 Dedicated Support"],
    isPopular: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "byok_monthly",
    name: "BYOK Studio Pro",
    type: "byok",
    interval: "month",
    price: 9,
    credits: 0,
    description: "Bring your own MuAPI / Seedance key. Zero platform credit deductions on generations.",
    features: ["Unlimited Video Generations (via your API Key)", "Zero Platform Credit Deductions", "Full UI Studio Access", "Audio & Video Reference Controls"],
    isPopular: true,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "byok_annual",
    name: "BYOK Studio Annual",
    type: "byok",
    interval: "year",
    price: 79,
    credits: 0,
    description: "Full year of BYOK studio access with 2 months free. Pay only wholesale API costs.",
    features: ["Everything in BYOK Pro", "2 Months Free Included", "Permanent Creation Archive", "Priority Customer Support"],
    isPopular: false,
    isActive: true,
    sortOrder: 6,
  },
];

export const PlansService = {
  /**
   * Fetch all plans, seeding default plans if the collection is empty.
   */
  async getPlans(activeOnly = true) {
    try {
      const snapshot = await db.collection(PLANS_COLLECTION).get();

      if (snapshot.empty) {
        // Seed default plans into Firestore
        const batch = db.batch();
        for (const plan of defaultPlans) {
          const docRef = db.collection(PLANS_COLLECTION).doc(plan.id);
          batch.set(docRef, {
            ...plan,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        await batch.commit();
        return defaultPlans.filter((p) => !activeOnly || p.isActive);
      }

      let plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (activeOnly) {
        plans = plans.filter((p) => p.isActive !== false);
      }
      return plans.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error) {
      console.error("[PLANS_GET_ERROR]", error);
      return defaultPlans.filter((p) => !activeOnly || p.isActive);
    }
  },

  async getPlanById(planId) {
    const doc = await db.collection(PLANS_COLLECTION).doc(planId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return defaultPlans.find((p) => p.id === planId) || null;
  },

  async createPlan(planData) {
    const id = planData.id || `plan_${Date.now()}`;
    const docRef = db.collection(PLANS_COLLECTION).doc(id);
    const newPlan = {
      ...planData,
      id,
      isActive: planData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(newPlan);
    return newPlan;
  },

  async updatePlan(planId, updateData) {
    const docRef = db.collection(PLANS_COLLECTION).doc(planId);
    const updated = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(updated, { merge: true });
    return await this.getPlanById(planId);
  },

  async deletePlan(planId) {
    await db.collection(PLANS_COLLECTION).doc(planId).delete();
    return { success: true, id: planId };
  },
};

export default PlansService;
