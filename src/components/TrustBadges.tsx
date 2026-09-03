import React from 'react';
import { ShieldCheck, IndianRupee, PhoneOff, Award } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <section id="trust" className="py-14 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">DigiLocker Verified</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Aadhaar and police verification via government DigiLocker ensures verified identities and certified credentials.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <IndianRupee className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">Payment Protection</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Funds held in escrow until service delivery is completed and you approve. 6% platform fee with GST tax invoices.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <PhoneOff className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">Privacy Masked Calls</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Personal mobile numbers remain concealed. Communicate securely via in-app chat and virtual masked calling.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <Award className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">AI Match Scoring</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Compare proposals with algorithmic compatibility scores based on skill match, pincode proximity, and verified reviews.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
