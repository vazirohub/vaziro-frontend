import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Lock,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

export const WhyChooseVaziro: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Service Commission & Brokerage',
      vaziro: '0% Brokerage on direct hiring. You pay only for actual service delivered.',
      traditional: '30% – 50% upfront broker commission + registration fees.',
    },
    {
      feature: 'Background & Identity Verification',
      vaziro: '100% DigiLocker checked: Government Aadhaar, PAN & credentials verification.',
      traditional: 'Unverified photocopies or oral references with no real background check.',
    },
    {
      feature: 'Payment Security & Protection',
      vaziro: '100% Escrow Milestone Protection. Funds released only after you approve quality.',
      traditional: 'Advance cash or UPI payments with zero refund recourse if they leave.',
    },
    {
      feature: 'Direct Communication & Transparency',
      vaziro: 'Chat directly in-app, review genuine past customer ratings & verify certificates.',
      traditional: 'Broker acts as gatekeeper, filtering information and hiding past track record.',
    },
    {
      feature: 'Replacement & Dispute Support',
      vaziro: '24/7 Support with Isha AI assistance & guaranteed milestone dispute resolution.',
      traditional: 'Brokers often become unreachable after receiving their upfront commission.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#f7f8f3] border-b border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#108a00]" />
            <span>The Safer Way to Hire</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Why Delhi NCR chooses Vaziro over unorganized brokers.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            Take full control of your family's care and home services. Here is how Vaziro compares to traditional local placement agencies.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-neutral-200 bg-neutral-50/80 text-xs font-bold">
            <div className="md:col-span-4 p-4 sm:p-5 text-neutral-500 uppercase tracking-wider">
              Comparison Pillar
            </div>
            <div className="md:col-span-4 p-4 sm:p-5 bg-emerald-50/60 text-[#108a00] font-black uppercase tracking-wider border-x border-neutral-200/70 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#108a00]" />
              <span>Vaziro Verified Marketplace</span>
            </div>
            <div className="md:col-span-4 p-4 sm:p-5 text-neutral-500 uppercase tracking-wider">
              Traditional Local Agencies
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-200/70">
            {comparisonItems.map((item, idx) => (
              <div
                key={item.feature}
                className={`grid grid-cols-1 md:grid-cols-12 text-xs sm:text-sm ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'
                }`}
              >
                {/* Feature Name */}
                <div className="md:col-span-4 p-4 sm:p-5 font-bold text-neutral-900 flex items-center">
                  {item.feature}
                </div>

                {/* Vaziro Advantage */}
                <div className="md:col-span-4 p-4 sm:p-5 bg-emerald-50/30 border-x border-neutral-200/70 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#108a00] shrink-0 mt-0.5" />
                  <span className="font-semibold text-neutral-900 leading-relaxed">
                    {item.vaziro}
                  </span>
                </div>

                {/* Traditional Broker Pitfalls */}
                <div className="md:col-span-4 p-4 sm:p-5 flex items-start gap-2.5 text-neutral-500">
                  <XCircle className="w-4 h-4 text-red-500/80 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {item.traditional}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
