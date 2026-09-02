import Link from "next/link";
import { FaUserShield, FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "Privacy Policy | MaxMotion AI",
  description: "Privacy Policy detailing data protection and usage at MaxMotion AI.",
};

export default function PrivacyPage() {
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
            <FaUserShield size={10} /> Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted">
            Last Updated: September 2026 • Compliant with GDPR, CCPA & Global Privacy Standards
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-secondary-text leading-relaxed bg-glass-bg border border-glass-border p-6 sm:p-8 rounded-2xl shadow-xl">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Introduction</h2>
            <p>
              MaxMotion AI Technologies Inc. (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our platform or use our AI video generation services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account Information:</strong> When you authenticate via Google OAuth or other providers, we receive your name, email address, and avatar image to establish your account profile.
              </li>
              <li>
                <strong>Creative Content Inputs:</strong> Prompts, script text, reference photos, video clips, and audio files you submit to generate video outputs.
              </li>
              <li>
                <strong>Transaction Data:</strong> Subscription tier, credit pack purchases, and transaction IDs. Payment details are processed directly by PCI-DSS compliant providers (Stripe and PayPal); we do not store credit card numbers.
              </li>
              <li>
                <strong>BYOK Credentials:</strong> If you supply your personal API keys (such as Fal.ai or MuAPI), they are encrypted at rest in Firestore and utilized solely for your requests.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. How We Use Your Data</h2>
            <p>We process your data for the following lawful purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dispatching generative rendering tasks to underlying AI engines.</li>
              <li>Maintaining your personal creation gallery and video download links.</li>
              <li>Managing your credit balance and processing billing renewals.</li>
              <li>Preventing fraudulent activity, abuse, or violation of safety policies.</li>
              <li>Improving platform performance and UI reliability.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Storage & Infrastructure Subprocessors</h2>
            <p>
              Your data is hosted within enterprise-grade infrastructure provided by Google Cloud Platform. We utilize:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google Cloud Firestore & Cloud Run:</strong> Secure database and compute infrastructure.</li>
              <li><strong>Firebase Storage / Google Cloud Storage:</strong> Secure storage of generated video files and reference assets.</li>
              <li><strong>Stripe & PayPal:</strong> Payment processing and invoice management.</li>
              <li><strong>Fal.ai & MuAPI:</strong> Inference compute nodes for video diffusion models.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">5. Data Retention & Your Rights (GDPR / CCPA)</h2>
            <p>
              You maintain full control over your personal data. Depending on your jurisdiction, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access & Portability:</strong> Request a copy of your stored creations and profile information.</li>
              <li><strong>Deletion (&ldquo;Right to be Forgotten&rdquo;):</strong> Delete your creations from your gallery or request permanent deletion of your account.</li>
              <li><strong>Rectification:</strong> Update your profile settings and API credentials anytime in your settings.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">6. Contact Our Data Protection Officer</h2>
            <p>
              To exercise any of your privacy rights or if you have questions regarding our data practices, please contact us at:{" "}
              <a href="mailto:privacy@maxmotion.ai" className="text-primary font-bold hover:underline">
                privacy@maxmotion.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
