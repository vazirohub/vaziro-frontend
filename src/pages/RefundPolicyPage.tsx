import React from 'react';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Escrow & Consumer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Proanta Technologies Private Limited • vaziro.in
          </p>
        </div>
      </section>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-neutral-800 text-sm leading-relaxed">
        
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
          <p className="text-xs text-neutral-600">
            At <strong>Vaziro</strong>, customer trust and fair compensation for service partners are foundational. This Refund & Cancellation Policy outlines the conditions under which escrow payments and platform credits are cancelled and refunded.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            1. Escrow Job Cancellation Before Service Starts
          </h2>
          <p className="text-xs text-neutral-600">
            If a Customer cancels an escrow-funded requirement at least 12 hours prior to the scheduled start time, a <strong>100% full refund</strong> of the deposited service amount will be credited back to the original payment source (bank account/UPI/credit card) within 5–7 banking days.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            2. Cancellation During Ongoing Milestones
          </h2>
          <p className="text-xs text-neutral-600">
            If a service requirement is terminated prematurely after work has commenced:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li>Any discrete milestones already completed and verified by the customer are disbursed to the Service Partner.</li>
            <li>All unexecuted, pending milestone balances held in escrow are refunded to the customer.</li>
            <li>In case of a service dispute, both parties enter the 14-day Vaziro Resolution Arbitration Window.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            3. Professional Credit Wallet Refunds
          </h2>
          <p className="text-xs text-neutral-600">
            Platform credits purchased by Service Partners (Free, Starter, Growth, Pro plans) represent software licensing fees for lead notifications:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li><strong>Unused Credit Packages:</strong> Eligible for a 100% refund within 7 calendar days of purchase, provided zero (0) customer quotes have been submitted.</li>
            <li><strong>Partially Spent Packages:</strong> Once a credit has been consumed to unlock or quote on a customer requirement, credits are non-refundable, except if the customer requirement was definitively audited as spam or fraudulent by our security team.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            4. Refund Processing Timeline
          </h2>
          <p className="text-xs text-neutral-600">
            Approved refunds are initiated immediately by Vaziro. The funds typically reflect in the user’s bank account or payment card within <strong>5 to 7 business days</strong>, governed by standard RBI and NPCI banking settlement cycles.
          </p>
        </div>

        {/* Support Card */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-2">
          <h3 className="text-sm font-bold text-emerald-400">Need Assistance with a Refund?</h3>
          <p className="text-xs text-neutral-300">
            Please submit your Job ID or Transaction reference to <strong>billing@vaziro.in</strong> or through our 24/7 in-app support chat.
          </p>
        </div>

      </div>
    </div>
  );
};
