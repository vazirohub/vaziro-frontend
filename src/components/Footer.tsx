import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-neutral-400 py-16 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img
              src="/logo-white.png"
              alt="Vaziro"
              className="h-10 w-auto object-contain mb-3"
            />
            <div className="text-xs font-bold text-neutral-300">
              Proanta Technologies Private Limited
            </div>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
              India's premier reverse-auction marketplace for verified personal care, fitness, tutoring, and healthcare professionals.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Verified Categories
            </div>
            <ul className="space-y-2 text-xs text-neutral-400">
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
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Trust & Security
            </div>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>✓ DigiLocker Aadhaar KYC</li>
              <li>✓ 6% Protected Escrow</li>
              <li>✓ Virtual Masked Calling</li>
              <li>✓ GST Compliant Invoices</li>
              <li>✓ India Only • INR (₹)</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Official Inquiries
            </div>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Domain: <span className="text-white font-medium">vaziro.in</span></li>
              <li>Support: <span className="text-white font-medium">support@vaziro.in</span></li>
              <li>Admin: <span className="text-white font-medium">admin@vaziro.in</span></li>
              <li>Corporate: <span className="text-white font-medium">Proanta Technologies Pvt Ltd</span></li>
              <li className="pt-2 text-neutral-300 font-bold">Timezone: Asia/Kolkata (IST)</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Proanta Technologies Private Limited. All rights reserved.
          </div>
          <div className="text-neutral-400">
            Vaziro™ Marketplace Platform • Built for India
          </div>
        </div>
      </div>
    </footer>
  );
};
