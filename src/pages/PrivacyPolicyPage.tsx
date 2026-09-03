import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Compliant with Digital Personal Data Protection (DPDP) Act, 2023 • Proanta Technologies Private Limited
          </p>
        </div>
      </section>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-neutral-800 text-sm leading-relaxed">
        
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
          <p className="text-xs text-neutral-600">
            <strong>Proanta Technologies Private Limited</strong> ("Vaziro", "we", "us") respects your digital privacy. This Privacy Policy describes how we collect, process, store, and safeguard your personal information when you access or interact with <strong>vaziro.in</strong> and related services.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-600">
            <li><strong>Identity & Contact Information:</strong> Full legal name, verified mobile number (+91), email address, and demographic locality in Delhi NCR.</li>
            <li><strong>DigiLocker KYC Credentials (for Service Partners):</strong> Government identity proofs (Aadhaar, Voter ID, PAN) processed securely via authorized DigiLocker APIs, medical/nursing council certifications, and police verification reports.</li>
            <li><strong>Transactional Data:</strong> Platform credit purchases, escrow transaction IDs, milestone releases, and official GST invoices.</li>
            <li><strong>Communication Data:</strong> In-app messaging logs and masked phone interaction metadata necessary for safety audits.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            2. Privacy-Masked Telephony
          </h2>
          <p className="text-xs text-neutral-600">
            To prevent unsolicited marketing and safeguard personal contact numbers, Vaziro utilizes privacy-masked communication systems. Neither Customers nor Service Partners see each other's private mobile numbers during preliminary negotiation until a formal service quote is confirmed.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            3. Purpose of Processing
          </h2>
          <p className="text-xs text-neutral-600">
            We process your personal data strictly for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li>Facilitating authentic service quotes and proposals between verified parties.</li>
            <li>Processing secure payments, credits, and milestone escrows.</li>
            <li>Preventing platform fraud, impersonation, and safety violations.</li>
            <li>Complying with statutory audits under Indian taxation and corporate laws.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            4. Non-Disclosure & Security Safeguards
          </h2>
          <p className="text-xs text-neutral-600">
            We do NOT sell, rent, or trade your personal data to third-party advertising brokers. Data is stored on enterprise cloud servers located strictly within Indian jurisdictions, encrypted with AES-256 at rest and TLS 1.3 in transit.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            5. Your Rights & Data Deletion
          </h2>
          <p className="text-xs text-neutral-600">
            Under the DPDP Act 2023, you have the right to access, rectify, or request deletion of your account and personal data, subject to statutory transaction retention periods. To initiate a data deletion request, email <strong>privacy@vaziro.in</strong>.
          </p>
        </div>

        {/* Contact info */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-2">
          <h3 className="text-sm font-bold text-emerald-400">Grievance Officer Contact</h3>
          <p className="text-xs text-neutral-300">
            In accordance with the Information Technology Act 2000 and DPDP Act 2023:
          </p>
          <div className="text-[11px] text-neutral-400">
            Grievance Officer: Proanta Technologies Private Limited<br />
            Email: <strong>grievance@vaziro.in</strong> / <strong>support@vaziro.in</strong><br />
            Response SLA: Within 48 business hours.
          </div>
        </div>

      </div>
    </div>
  );
};
