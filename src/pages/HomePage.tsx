import React from 'react';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import { ArrowRight, CheckCircle2, ShieldCheck, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div>
      <Hero />
      <TrustBadges />
      <CategoryGrid />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              How the Vaziro Marketplace Works
            </h2>
            <p className="mt-3 text-slate-600 font-medium">
              A quotation-based, reverse-auction platform connecting customers with vetted professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Post Your Requirement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe your needed service, choose your area/pincode, and define a fixed budget or flexible budget range in ₹ (INR).
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Compare Quotations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vetted professionals evaluate the scope, spend platform credits to apply, and send competitive quotes with AI match scores.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hire & Deliver</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hire with optional Vaziro Payment Protection. Track discrete job stages, approve completed delivery, and release funds securely.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => openAuthModal('CUSTOMER')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
