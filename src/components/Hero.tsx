import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>India's Trusted Reverse-Auction Marketplace</span>
          </div>

          {/* Headline (Section 76) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Tell Us What You Need.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Get Quotes From the Right Professionals.
            </span>
          </h1>

          {/* Supporting Text (Section 76) */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
            Post your requirement, set your budget, compare verified professionals and hire with confidence.
          </p>

          {/* Main Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('CUSTOMER')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <span>Post a Requirement</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#categories"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl font-bold text-base border border-slate-300 shadow-sm transition-all"
            >
              <span>Find a Professional</span>
            </a>
          </div>

          {/* Professional Callout Banner */}
          <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">Grow Your Business with Vaziro</div>
                <div className="text-xs text-slate-400">Get More Customers. Pay Only When You Apply.</div>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('PROFESSIONAL')}
              className="w-full sm:w-auto whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-colors"
            >
              Join as a Professional
            </button>
          </div>

          {/* Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DigiLocker Verified Pros</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fixed or Range Budget in ₹</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Optional Payment Protection (6%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Masked Calls & Secure Chat</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
