import React from 'react';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="bg-white">
      <Hero />
      <TrustBadges />
      <CategoryGrid />

      {/* How It Works Section (Urban Company minimal styling) */}
      <section id="how-it-works" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Seamless 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              How Vaziro Reverse Auction Works
            </h2>
            <p className="mt-3 text-sm text-neutral-600 font-medium">
              Transparent, competitive quotations direct from verified professionals with zero upfront agent commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                01
              </div>
              <h3 className="text-xl font-black text-black mb-2">Post Your Requirement</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Specify your needed service, service location & pincode, and define your fixed budget or flexible price range in ₹ INR.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                02
              </div>
              <h3 className="text-xl font-black text-black mb-2">Receive & Compare Quotes</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Background-checked professionals review your requirement, spend wallet credits to quote, and send competitive offers with AI compatibility scores.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                03
              </div>
              <h3 className="text-xl font-black text-black mb-2">Hire & Pay on Satisfaction</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hire with optional 6% Vaziro Payment Protection escrow. Inspect discrete milestones, approve completed delivery, and release funds securely.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => openAuthModal('CUSTOMER')}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md transition"
            >
              <span>Get Started as Customer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Comparison: Vaziro vs Traditional Middlemen Agencies */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400 bg-neutral-800 px-3 py-1 rounded-full">
              Why Choose Vaziro
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Vaziro vs Traditional Offline Agencies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Agencies */}
            <div className="p-8 rounded-3xl bg-neutral-800/80 border border-neutral-700">
              <h4 className="text-lg font-bold text-neutral-400 mb-4">Traditional Broker / Agency</h4>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2 text-red-400">
                  <span>✕</span>
                  <span>Heavy 15% to 30% cut taken from worker wages</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <span>✕</span>
                  <span>Unverified documents and fake experience claims</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <span>✕</span>
                  <span>Fixed arbitrary pricing with hidden broker fees</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <span>✕</span>
                  <span>No escrow protection — full upfront payment demanded</span>
                </li>
              </ul>
            </div>

            {/* Vaziro Platform */}
            <div className="p-8 rounded-3xl bg-black border-2 border-neutral-700 shadow-2xl relative">
              <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider bg-white text-black px-2.5 py-1 rounded-full">
                Vaziro Advantage
              </div>
              <h4 className="text-lg font-bold text-white mb-4">Vaziro Reverse Auction</h4>
              <ul className="space-y-3 text-xs text-neutral-200">
                <li className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span>0% commission on worker earnings (pay-per-application credits)</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span>DigiLocker verified Aadhaar & government credential validation</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span>Competitive reverse-auction bidding tailored to your budget</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span>100% Escrow milestone protection with official GST invoices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
