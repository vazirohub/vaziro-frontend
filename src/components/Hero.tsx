import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search, MapPin, Star, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly Delhi NCR Cities as requested
  const ncrCities = ['Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/post-requirement?city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <section className="relative bg-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Urban Company Style Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.12]">
              Delhi NCR’s Verified{' '}
              <span className="block text-neutral-800">
                Home & Personal Care Experts.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 font-medium leading-relaxed max-w-xl">
              Post your service requirement across Delhi NCR, name your budget in ₹ INR, and compare transparent quotes from background-checked physiotherapists, nurses, cooks, trainers, and tutors.
            </p>

            {/* Search Bar with Service Zone Dropdown inside the Get Quotes box */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-neutral-900 shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                
                {/* Select Your NCR Service Zone Dropdown */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 w-full sm:w-auto text-xs font-bold text-neutral-800 shrink-0">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold leading-none mb-0.5">
                      NCR Service Zone
                    </span>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      aria-label="Select Your NCR Service Zone"
                      className="bg-transparent text-xs font-black text-black focus:outline-none cursor-pointer pr-2"
                    >
                      {ncrCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Input */}
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

                {/* Get Quotes Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                >
                  <span>Get Quotes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Value Checkmarks */}
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

          {/* RIGHT VISUAL COLUMN (Real Indian Professional Photography & Floating Social Proof) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Real Indian Healthcare & Caregiver Photo */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-neutral-900 aspect-[4/5] bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1000&q=80"
                  alt="Verified Indian Healthcare Specialist"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Badge at Bottom of Photo */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Live in Delhi NCR</span>
                  </div>
                  <div className="text-base font-black mt-0.5">Dr. Neeraj Sharma, BPT</div>
                  <div className="text-xs text-neutral-300">Certified Senior Rehabilitation • 8 Yrs Exp • South Delhi</div>
                </div>
              </div>

              {/* Floating Top Card: Star Rating */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-black flex items-center gap-1">
                    <span>4.96 / 5.0</span>
                    <span className="text-neutral-400 font-normal">NCR Rating</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium">Over 12,500+ Verified NCR Jobs</div>
                </div>
              </div>

              {/* Floating Bottom Card: DigiLocker Verified Badge */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-black">DigiLocker Verified</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Aadhaar & Police KYC Checked</div>
                </div>
              </div>

              {/* Floating Speed Badge */}
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
