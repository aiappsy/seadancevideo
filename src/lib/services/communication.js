import { db } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const ANNOUNCEMENTS_COLLECTION = "announcements";

export const CommunicationService = {
  /**
   * Create an announcement or targeted direct message from admin.
   */
  async createMessage({ title, message, type = "info", targetUserId = "all", authorEmail = "Admin" }) {
    const docRef = db.collection(ANNOUNCEMENTS_COLLECTION).doc();
    const newMsg = {
      id: docRef.id,
      title,
      message,
      type, // 'info' | 'warning' | 'promo' | 'system'
      targetUserId, // 'all' or specific userId
      authorEmail,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    await docRef.set(newMsg);
    return newMsg;
  },

  /**
   * Get all messages for admin log.
   */
  async getAllMessages() {
    const snapshot = await db.collection(ANNOUNCEMENTS_COLLECTION).get();
    const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return msgs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  /**
   * Get messages visible to a specific user.
   */
  async getUserMessages(userId) {
    if (!userId) return [];
    const snapshot = await db.collection(ANNOUNCEMENTS_COLLECTION).get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const userMsgs = all.filter(
      (m) => m.targetUserId === "all" || m.targetUserId === userId
    );

    return userMsgs
      .map((m) => ({
        ...m,
        isRead: Array.isArray(m.readBy) && m.readBy.includes(userId),
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  /**
   * Mark a message as read by a specific user.
   */
  async markAsRead(messageId, userId) {
    const docRef = db.collection(ANNOUNCEMENTS_COLLECTION).doc(messageId);
    await docRef.update({
      readBy: FieldValue.arrayUnion(userId),
    });
    return { success: true };
  },

  /**
   * Delete an announcement.
   */
  async deleteMessage(messageId) {
    await db.collection(ANNOUNCEMENTS_COLLECTION).doc(messageId).delete();
    return { success: true };
  },
};

export default CommunicationService;
