import Link from "next/link";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "Terms of Service | MaxMotion AI",
  description: "Terms and conditions governing the use of MaxMotion AI video generation platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-bg-page text-primary-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors"
        >
          <FaArrowLeft size={10} /> Back to Studio
        </Link>

        <div className="border-b border-glass-border pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
            <FaShieldAlt size={10} /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-xs text-muted">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-secondary-text leading-relaxed bg-glass-bg border border-glass-border p-6 sm:p-8 rounded-2xl shadow-xl">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using the <strong>MaxMotion AI</strong> platform (&ldquo;Service&rdquo;), operated by MaxMotion AI Technologies Inc. (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must immediately discontinue use of the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Account Registration & Security</h2>
            <p>
              To access generation tools, you must sign in via supported authentication providers (such as Google OAuth). You are responsible for safeguarding your credentials and for all activities conducted under your account. You agree to notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Content Ownership & Commercial Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Your Inputs:</strong> You retain full copyright and ownership of all prompts, images, video references, and audio files you upload to the platform.
              </li>
              <li>
                <strong>Generated Outputs:</strong> Subject to your compliance with these Terms and applicable copyright law, you own all rights, title, and interest in the video outputs created using your account, including full commercial exploitation rights.
              </li>
              <li>
                <strong>Platform License:</strong> You grant the Company a worldwide, royalty-free license solely to host, process, and display your content to provide the Service to you and maintain your generation gallery.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Prohibited Uses & Safety Policy</h2>
            <p>You agree not to generate, upload, or transmit any content that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contains Child Sexual Abuse Material (CSAM) or exploits minors in any way.</li>
              <li>Creates non-consensual sexually explicit depictions or deepfakes of real individuals.</li>
              <li>Promotes extreme violence, terrorism, self-harm, or hate speech.</li>
              <li>Infringes upon third-party trademarks, copyrights, or publicity rights.</li>
              <li>Attempts to bypass rate limits, reverse engineer models, or disrupt platform infrastructure.</li>
            </ul>
            <p>
              Violations will result in immediate permanent account termination and forfeiture of credits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">5. Billing, Credits & BYOK Subscriptions</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Credit Purchases:</strong> Credits allow execution of AI models based on duration, resolution, and engine type. Credits are consumed immediately upon successful generation dispatch.
              </li>
              <li>
                <strong>Payment Gateways:</strong> Payments are securely processed via Stripe or PayPal. We do not store raw credit card numbers on our servers.
              </li>
              <li>
                <strong>Bring Your Own Key (BYOK):</strong> Users utilizing personal API keys (such as Fal.ai or MuAPI) are responsible for their own third-party API costs. BYOK generations consume 0 platform credits.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. Generative AI outputs are inherently probabilistic; the Company does not warrant that outputs will be error-free, photorealistic in every instance, or suitable for any specific legal or commercial purpose.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
              In no event shall MaxMotion AI, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the Service, exceeding the total amount paid by you in the 12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">8. Contact & Inquiries</h2>
            <p>
              For legal notices or questions regarding these Terms, please contact our team at:{" "}
              <a href="mailto:support@maxmotion.ai" className="text-primary font-bold hover:underline">
                support@maxmotion.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
