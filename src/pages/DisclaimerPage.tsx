import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Platform Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Proanta Technologies Private Limited • vaziro.in
          </p>
        </div>
      </section>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-neutral-800 text-sm leading-relaxed">
        
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          <strong>IMPORTANT NOTICE:</strong> Please read this disclaimer carefully before relying on any information or engaging any service professional through <strong>vaziro.in</strong>.
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            1. Electronic Intermediary Status
          </h2>
          <p className="text-xs text-neutral-600">
            <strong>Vaziro (vaziro.in)</strong>, operated by <strong>Proanta Technologies Private Limited</strong>, is exclusively a technology platform and digital intermediary. We do not provide healthcare, medical treatments, clinical nursing, cooking, fitness instruction, or tutoring services directly. All services are performed independently by third-party Service Partners who are independent contractors and not employees, agents, or joint-venturers of Vaziro.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span>2. Medical & Clinical Care Disclaimer</span>
          </h2>
          <p className="text-xs text-neutral-600">
            Vaziro is <strong>NOT an emergency medical service</strong>, hospital, or ambulance provider. In case of acute medical emergencies, chest pain, difficulty breathing, severe hemorrhage, or sudden trauma, please immediately call <strong>112 / 102</strong> or proceed to the nearest emergency hospital facility.
          </p>
          <p className="text-xs text-neutral-600">
            Physiotherapy, home nursing, and elderly care services booked via Vaziro are for supportive post-hospitalization, chronic management, and rehabilitative assistance only and do not replace primary consultations with licensed medical doctors and surgeons.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            3. Verification & Background Checks Scope
          </h2>
          <p className="text-xs text-neutral-600">
            While Vaziro facilitates government identity verification (DigiLocker biometric Aadhaar check, PAN validation, and police verification audits) to establish identity authenticity, Customers are strongly encouraged to independently verify the credentials, references, and suitability of Service Partners before inviting them into residential premises.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-black border-b border-neutral-200 pb-2">
            4. Limitation of Liability
          </h2>
          <p className="text-xs text-neutral-600">
            To the maximum extent permitted by applicable Indian law, Proanta Technologies Private Limited shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from any acts, omissions, errors, or negligence of independent Service Partners or Customers.
          </p>
        </div>

        {/* Support Card */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-2">
          <h3 className="text-sm font-bold text-emerald-400">Official Regulatory Inquiries</h3>
          <p className="text-xs text-neutral-300">
            For compliance queries, reach out to <strong>legal@vaziro.in</strong> or write to Proanta Technologies Private Limited.
          </p>
        </div>

      </div>
    </div>
  );
};
