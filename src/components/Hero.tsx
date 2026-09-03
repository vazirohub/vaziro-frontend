import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Search, MapPin, Star, Sparkles, Clock, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');

  const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/post-requirement');
  };

  return (
    <section className="relative bg-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-wide uppercase shadow-sm">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>100% DigiLocker Verified Service Partners</span>
            </div>

            {/* Urban Company Style Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.12]">
              Home & Personal Care.{' '}
              <span className="block text-neutral-800">
                Delivered by Verified Experts.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 font-medium leading-relaxed max-w-xl">
              Post your custom requirement in 60 seconds, name your budget in ₹ INR, and compare transparent quotes from background-checked physiotherapists, nurses, cooks, trainers, and tutors.
            </p>

            {/* City Selection Pills */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Serving Top Metro Cities:
              </span>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCity === city
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Search Bar (Urban Company Style) */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-neutral-900 shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 w-full sm:w-auto text-xs font-bold text-neutral-800">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span className="font-extrabold text-black">{selectedCity}</span>
                </div>

                <div className="flex-1 flex items-center gap-2 px-3 w-full">
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Cook, Physiotherapist, Nurse, Tutor..."
                    className="w-full text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none py-1.5"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                >
                  <span>Get Quotes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Highlights Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-neutral-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>₹0 Commission to Pros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>6% Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Privacy-Masked Telephony</span>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL COLUMN (Real People Photography & Floating Social Proof) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Real Professional Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-neutral-900 aspect-[4/5] bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80"
                  alt="Verified Healthcare & Personal Care Professional"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Badge at Bottom of Photo */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Live on Platform</span>
                  </div>
                  <div className="text-base font-black mt-0.5">Smt. Meenakshi Sundaram</div>
                  <div className="text-xs text-neutral-300">Certified Senior Care Specialist • 8 Yrs Exp • Koramangala, BLR</div>
                </div>
              </div>

              {/* Floating Top Card: Star Rating */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-black flex items-center gap-1">
                    <span>4.94 / 5.0</span>
                    <span className="text-neutral-400 font-normal">Rating</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium">Over 18,400+ Verified Bookings</div>
                </div>
              </div>

              {/* Floating Bottom Card: DigiLocker Verified Badge */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-black">DigiLocker Verified</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Aadhaar & Police KYC Verified</div>
                </div>
              </div>

              {/* Floating Middle Card: Quick Response */}
              <div className="hidden sm:flex absolute top-1/2 -right-6 transform -translate-y-1/2 bg-black text-white p-3 rounded-2xl shadow-xl border border-neutral-800 items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div className="text-[11px] font-bold">Quotes in &lt; 15 mins</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
