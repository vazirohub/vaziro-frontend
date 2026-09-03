import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="text-xl font-black text-white">
              Vaziro<span className="text-emerald-500">.in</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Proanta Technologies Private Limited
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              India's reverse-auction professional services marketplace platform. Post requirements, compare vetted quotations, and hire with confidence.
            </p>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Core Categories
            </div>
            <ul className="space-y-2 text-xs">
              <li>Elderly Caregiver</li>
              <li>Fitness Trainer</li>
              <li>Home Cook / Chef</li>
              <li>Home Nurse</li>
              <li>Home Tutor</li>
              <li>Nanny & Baby Care</li>
              <li>Physiotherapist</li>
              <li>Yoga Instructor</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Security & Compliance
            </div>
            <ul className="space-y-2 text-xs">
              <li>✓ DigiLocker Verified KYC</li>
              <li>✓ Optional Payment Protection (6%)</li>
              <li>✓ Virtual Masked Telephony</li>
              <li>✓ GST Compliant Invoicing</li>
              <li>✓ India Jurisdiction V1 Only</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact & Support
            </div>
            <ul className="space-y-2 text-xs">
              <li>Domain: <span className="text-slate-200">vaziro.in</span></li>
              <li>Support: <span className="text-slate-200">support@vaziro.in</span></li>
              <li>Inquiries: <span className="text-slate-200">info@vaziro.in</span></li>
              <li>Governance: <span className="text-slate-200">admin@vaziro.in</span></li>
              <li className="pt-2 text-emerald-400 font-bold">Currency: INR (₹) | Timezone: IST</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Proanta Technologies Private Limited. All rights reserved.
          </div>
          <div>
            Vaziro Platform — Built for India
          </div>
        </div>
      </div>
    </footer>
  );
};
