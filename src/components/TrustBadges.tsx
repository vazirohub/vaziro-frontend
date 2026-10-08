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
              <div className="font-black text-sm text-black uppercase tracking-wide">Verification shown clearly</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Review each professional’s profile and check for a verification badge when one is available.
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
                An optional way to manage payment for a service. Any applicable fee is shown before you confirm.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <PhoneOff className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">Keep conversations together</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Use the in-app conversation to discuss the request and keep important details in one place.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center shrink-0 border border-neutral-200">
              <Award className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-black text-sm text-black uppercase tracking-wide">Compare proposals</div>
              <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Review proposed price, timeline, professional experience and other profile details together.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
