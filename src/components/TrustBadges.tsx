import React from 'react';
import { ShieldCheck, IndianRupee, PhoneOff, Award } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <section id="trust" className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900">DigiLocker Verified</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Government KYC integration via DigiLocker ensures verified identities and authentic professional credentials.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Optional Payment Protection</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Funds held securely until service is completed and you approve. 6% transparent platform fee with GST tax invoices.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PhoneOff className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Masked Calling & Chat</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your phone number and email remain private. Communicate via in-app chat and virtual masked telephony.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900">AI Match Scoring</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                Compare quotations with multi-factor AI compatibility scores based on skills, pincode distance, and ratings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
