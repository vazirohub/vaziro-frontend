import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Users, Award, CheckCircle2, ArrowRight, HeartHandshake, FileCheck } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner in Black & Emerald */}
      <section className="bg-black text-white py-16 sm:py-24 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Proanta Technologies Private Limited</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            About <span className="text-emerald-400">Vaziro</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Pioneering India’s trusted marketplace for verified healthcare, personal care, and domestic assistance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Our Founding Mission
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight">
              Fairness for Families. Dignity for Professionals.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Traditional domestic agency brokerages in Delhi NCR operate opaquely, deducting 20% to 35% commission cuts from domestic healthcare and caregiver salaries while providing little to no verification or dispute protection to households.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              <strong>Vaziro (vaziro.in)</strong>, operated by <strong>Proanta Technologies Private Limited</strong>, was created to replace outdated brokerage middlemen with an open, democratic platform where households state their exact requirements and budget, and background-checked independent specialists send competitive, transparent quotes.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-200 space-y-6">
            <h3 className="text-lg font-black text-black">The 4 Vaziro Tenets</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-black text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">0% Commission on Wages</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Service partners keep 100% of their earned service fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">Biometric DigiLocker KYC</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Government-backed Aadhaar and police verification on all partners.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-black text-xs">
                  03
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">Milestone Escrow Protection</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Client payments remain protected in escrow until job milestones are approved.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
                  04
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">Privacy-Masked Telephony</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Zero spam: direct phone numbers remain masked during negotiation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Presence: Delhi NCR */}
        <div className="bg-black text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4" />
                <span>Geographic Footprint</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">Exclusively Serving Delhi NCR</h3>
            </div>
            <Link
              to="/post-requirement"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md shrink-0"
            >
              <span>Post Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
            Vaziro currently focuses exclusively on delivering hyper-reliable, audited personal and healthcare service coverage across 5 key National Capital Region (NCR) clusters:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {['Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'].map((city) => (
              <div key={city} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl text-center">
                <span className="text-xs font-black text-white block">{city}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active Hub</span>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Entity Details */}
        <div className="border border-neutral-200 rounded-3xl p-8 bg-neutral-50 space-y-4">
          <h3 className="text-xl font-black text-black">Corporate Governance</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Vaziro is an electronic marketplace platform conceptualized, built, and maintained by <strong>Proanta Technologies Private Limited</strong>, an incorporated technology entity registered under the Indian Companies Act, 2013.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <span className="text-neutral-400 font-bold block uppercase text-[10px]">Operating Entity</span>
              <span className="font-extrabold text-black">Proanta Technologies Pvt Ltd</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <span className="text-neutral-400 font-bold block uppercase text-[10px]">Corporate Portal</span>
              <span className="font-extrabold text-black">vaziro.in</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200">
              <span className="text-neutral-400 font-bold block uppercase text-[10px]">Official Support</span>
              <span className="font-extrabold text-emerald-600">support@vaziro.in</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
