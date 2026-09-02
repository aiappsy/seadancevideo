import { db } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const USERS_COLLECTION = "users";

export const UserService = {
  /**
   * Get credits for a specific user.
   * If user doc does not exist, initialize with 10 default credits.
   */
  async getCredits(userId) {
    if (!userId) return 0;
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      // Initialize with default 10 credits
      await userRef.set({
        id: userId,
        credits: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return 10;
    }

    const data = doc.data();
    return typeof data.credits === "number" ? data.credits : 10;
  },

  /**
   * Add credits to a user's account.
   */
  async addCredits(userId, amount) {
    if (!userId || amount <= 0) return;
    const userRef = db.collection(USERS_COLLECTION).doc(userId);

    await userRef.set(
      {
        id: userId,
        credits: FieldValue.increment(amount),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return await this.getCredits(userId);
  },

  /**
   * Deduct credits from a user's account atomically via Firestore transaction.
   * Throws if credits are insufficient.
   */
  async deductCredits(userId, amount) {
    if (!userId || amount <= 0) return;
    const userRef = db.collection(USERS_COLLECTION).doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      let currentCredits = 10;

      if (userDoc.exists) {
        const data = userDoc.data();
        currentCredits = typeof data.credits === "number" ? data.credits : 10;
      } else {
        // Initialize new user
        transaction.set(userRef, {
          id: userId,
          credits: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (currentCredits < amount) {
        throw new Error("Insufficient credits available");
      }

      transaction.update(userRef, {
        credits: currentCredits - amount,
        updatedAt: new Date().toISOString(),
      });
    });

    return await this.getCredits(userId);
  },
};

export const getCredits = UserService.getCredits.bind(UserService);
export const addCredits = UserService.addCredits.bind(UserService);
export const deductCredits = UserService.deductCredits.bind(UserService);
export default UserService;
