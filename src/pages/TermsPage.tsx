import React from 'react';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Last updated: September 2026 • Governed by Proanta Technologies Private Limited
          </p>
        </div>
      </section>

      {/* Content Document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-neutral-800 text-sm leading-relaxed">
        
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
          <p className="text-xs text-neutral-600">
            Please read these Terms and Conditions ("Terms") carefully before using the website <strong>vaziro.in</strong> (the "Platform") operated by <strong>Proanta Technologies Private Limited</strong> ("Vaziro", "we", "us", or "our"). By registering, accessing, posting requirements, or submitting quotes, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            1. Marketplace Nature of the Platform
          </h2>
          <p className="text-xs text-neutral-600">
            Vaziro is an electronic intermediary marketplace platform as defined under Section 2(1)(w) of the Information Technology Act, 2000. Vaziro connects independent service providers ("Service Partners" or "Professionals") with household clients ("Customers"). Vaziro is not an employer, agency, staffing firm, or healthcare provider. Independent Service Partners render services directly to Customers under mutually agreed contractual terms.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            2. Reverse Auction & Quotation Mechanics
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-600">
            <li>Customers post non-binding service requirements outlining scope, schedule, and budgetary benchmarks in Indian National Rupees (₹ INR).</li>
            <li>Verified Service Partners spend non-refundable platform Credits to submit competitive proposals and bids.</li>
            <li>Customers reserve full discretion to accept, negotiate, or decline any proposal based on profile credentials, pricing, and interview evaluations.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            3. Platform Credits & Wallet Balance
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-600">
            <li>Service Partners purchase Credits through accredited RBI-authorized payment gateways to apply for customer leads.</li>
            <li>Credits are digital platform access tokens used solely for lead bidding within the Vaziro platform and do not constitute legal tender, banking deposits, or interest-bearing instruments.</li>
            <li>Credits are subject to validity periods specified in the selected subscription plan. Unused credits may be refunded strictly within 7 days of initial top-up if no leads have been applied for.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            4. Escrow Milestone Payments & 6% Platform Fee
          </h2>
          <p className="text-xs text-neutral-600">
            To ensure complete mutual trust, Customer service payments are collected into a secure escrow account prior to service delivery. A nominal 6% platform escrow and protection fee is applied. Escrow funds are released to the Service Partner in defined milestones only after explicit written or digital confirmation from the Customer.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            5. User Conduct & Zero-Harassment Policy
          </h2>
          <p className="text-xs text-neutral-600">
            Users agree not to solicit off-platform cash circumvention during active escrow jobs, engage in discriminatory behavior, verbal harassment, physical misconduct, or submit fraudulent credential certificates. Violations result in immediate account termination, forfeiture of unused credits, and referral to law enforcement authorities.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            6. Governing Law & Dispute Jurisdiction
          </h2>
          <p className="text-xs text-neutral-600">
            These Terms are governed by and construed in accordance with the substantive laws of the Republic of India. Any disputes, controversies, or claims arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </p>
        </div>

        {/* Contact info */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-2">
          <h3 className="text-sm font-bold text-emerald-400">Questions or Legal Inquiries?</h3>
          <p className="text-xs text-neutral-300">
            Contact our compliance and legal department at <strong>legal@vaziro.in</strong> or <strong>support@vaziro.in</strong>.
          </p>
          <div className="text-[11px] text-neutral-400 pt-1">
            Proanta Technologies Private Limited • Delhi NCR, India
          </div>
        </div>

      </div>
    </div>
  );
};
