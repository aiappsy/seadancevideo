import Link from "next/link";
import { FaUndoAlt, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

export const metadata = {
  title: "Refund Policy | MaxMotion AI",
  description: "Refund and cancellation terms for MaxMotion AI subscriptions and credit packs.",
};

export default function RefundPage() {
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
            <FaUndoAlt size={10} /> Customer Assurance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-muted">
            Last Updated: September 2026 • Transparent & Fair Terms
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-secondary-text leading-relaxed bg-glass-bg border border-glass-border p-6 sm:p-8 rounded-2xl shadow-xl">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Overview of Digital Goods</h2>
            <p>
              MaxMotion AI provides access to cutting-edge cloud GPU computing resources and generative AI models. Because compute cycles are allocated and consumed in real time upon rendering, purchases of digital credits and subscription services are generally non-refundable once consumed, except as provided below.
            </p>
          </section>

          <section className="space-y-3 bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2">
              <FaCheckCircle /> Automatic Credit Protection Guarantee
            </h2>
            <p className="text-xs">
              If an AI video generation encounters an engine failure, timeout, or technical crash on our infrastructure or upstream provider, <strong>your platform credits are automatically returned to your account balance</strong> in real time. You will never be charged for an unrendered or failed task.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Subscription Cancellations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Cancel Anytime:</strong> You may cancel your subscription at any moment directly through your account settings or via the Stripe/PayPal billing portal.
              </li>
              <li>
                <strong>Access Duration:</strong> Upon cancellation, your subscription benefits will remain active until the end of your current billing period. No further recurring charges will be initiated.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Eligibility for Monetary Refunds</h2>
            <p>We consider requests for monetary refunds under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Accidental Duplicate Charges:</strong> If you were billed twice for the same transaction due to a technical glitch, we will promptly refund the duplicate transaction.
              </li>
              <li>
                <strong>Unused Credit Packages:</strong> If you purchased a credit pack and have not used any credits from that package, you may request a full refund within 7 days of purchase.
              </li>
              <li>
                <strong>Prolonged Service Outage:</strong> If our service was unavailable for an extended continuous period preventing access to paid subscriptions.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. How to Request a Refund</h2>
            <p>
              To request a refund, email our support team with your account email and transaction ID at:{" "}
              <a href="mailto:support@maxmotion.ai" className="text-primary font-bold hover:underline">
                support@maxmotion.ai
              </a>
            </p>
            <p>
              Our support team reviews all requests within 24–48 business hours. Approved refunds are credited back to your original payment method (Stripe or PayPal) within 5–10 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
