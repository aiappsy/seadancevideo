import { SettingsService } from "./settings";

export const EmailService = {
  /**
   * Send an email via Resend API
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const settings = await SettingsService.getSettings();
      const apiKey = settings.ai?.resendApiKey || process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.warn("[EMAIL_SERVICE] Resend API Key is not configured. Email logged to console instead of sending.");
        console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
        return { simulated: true, success: true, message: "Email logged (No API key configured)" };
      }

      const fromEmail = settings.general?.supportEmail || "notifications@maxmotion.ai";
      const fromName = settings.general?.appName || "MaxMotion AI";

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || `<p>${text}</p>`,
          text: text || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Resend API error (${res.status})`);
      }

      const data = await res.json();
      return { success: true, id: data.id };
    } catch (e) {
      console.error("[SEND_EMAIL_ERROR]", e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Send broadcast announcement to user email list
   */
  async sendBroadcast({ recipients, title, message, type }) {
    if (!recipients || recipients.length === 0) return;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b0f19; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f2937;">
        <div style="border-bottom: 1px solid #1f2937; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #f59e0b; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">MaxMotion AI Studio Announcement</h2>
        </div>
        <h3 style="color: #ffffff; margin-top: 0;">${title}</h3>
        <p style="color: #d1d5db; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${message}</p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #1f2937; font-size: 11px; color: #6b7280; text-align: center;">
          Sent from MaxMotion AI Studio. You received this update as a registered creator.
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: recipients,
      subject: `[MaxMotion AI] ${title}`,
      html,
      text: message,
    });
  },

  /**
   * Test Resend API Key
   */
  async testApiKey(apiKey) {
    if (!apiKey) throw new Error("Missing Resend API key");
    const res = await fetch("https://api.resend.com/api-keys", {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
    });
    if (!res.ok) {
      throw new Error(`Invalid Resend API key (HTTP ${res.status})`);
    }
    return { isValid: true };
  },
};

export default EmailService;
