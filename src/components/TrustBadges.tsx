import React from 'react';
import {
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const trustPillars = [
    {
      icon: Lock,
      title: '100% Escrow Protection',
      desc: 'Your payment is safely held in escrow. Funds are only released to the professional after you approve milestone completion.',
      badge: 'Zero Risk Guarantee',
    },
    {
      icon: ShieldCheck,
      title: 'DigiLocker Verified Pros',
      desc: 'All independent professionals undergo Aadhaar, government ID verification, and qualification credentials screening.',
      badge: '100% ID Checked',
    },
    {
      icon: Award,
      title: 'Zero Brokerage Markups',
      desc: 'Connect directly with independent professionals. Compare transparent proposals without traditional 30-50% broker commissions.',
      badge: 'Transparent Quotes',
    },
    {
      icon: Clock,
      title: '24/7 Verified Support',
      desc: 'Dedicated customer resolution with Isha AI and human dispute arbitration for smooth milestones and peace of mind.',
      badge: 'Always Here for You',
    },
  ];

  const liveStats = [
    { value: '12,500+', label: 'Verified Service Hours Delivered' },
    { value: '4.9 / 5', label: 'Average Client Satisfaction' },
    { value: '100%', label: 'DigiLocker ID Checked' },
    { value: '₹0 Fee', label: 'To Post & Compare Quotes' },
  ];

  return (
    <section id="trust" className="py-14 sm:py-16 bg-white border-b border-neutral-200/90 relative overflow-hidden">
      {/* Subtle Background Radial */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl -z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ticker */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#108a00]" />
            <span>The Vaziro Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Built on transparency, verified trust, and safe payments.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            Unlike unorganized agencies with cash advance risks, Vaziro gives Delhi NCR families full control with escrow milestones and verified background checks.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative bg-[#fcfbf8] hover:bg-white rounded-2xl p-6 border border-neutral-200/80 hover:border-emerald-300 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#108a00] flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-neutral-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200/50 flex items-center gap-1.5 text-[11px] font-bold text-[#108a00]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guaranteed on every contract</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Marketplace Stats Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {liveStats.map((stat) => (
            <div key={stat.label} className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-neutral-500 font-semibold mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
