import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Search, MapPin, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/requirements');
  };

  return (
    <section className="relative bg-white pt-12 pb-20 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>100% DigiLocker Verified Service Partners</span>
          </div>

          {/* Urban Company Style Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.15]">
            Home & Personal Care.{' '}
            <span className="block mt-1 text-neutral-900">
              Delivered by Verified Experts.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-neutral-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Post your custom requirement in minutes, set your budget in ₹ INR, and receive tailored quotations from verified independent professionals.
          </p>

          {/* Interactive Search Bar (Urban Company style) */}
          <div className="mt-8 max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-neutral-900 shadow-xl flex flex-col sm:flex-row items-center gap-2">
            {/* City Selector */}
            <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-neutral-200 w-full sm:w-auto text-xs font-bold text-neutral-800">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-black"
              >
                <option value="Bengaluru">Bengaluru, KA</option>
                <option value="Mumbai">Mumbai, MH</option>
                <option value="Pune">Pune, MH</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad, TS</option>
              </select>
            </div>

            {/* Query Input */}
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Physiotherapist, Cook, Trainer, Nurse..."
                className="w-full text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none py-2"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => navigate('/post-requirement')}
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-md"
            >
              <span>Get Quotes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/post-requirement"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition"
            >
              <span>Post a Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/requirements"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-black px-8 py-3.5 rounded-xl font-bold text-sm border-2 border-neutral-900 shadow-sm transition"
            >
              <span>Explore Live Requests</span>
            </Link>
          </div>

          {/* Partner Callout Banner (Urban Company dark theme) */}
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-black text-white text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Join as a Verified Service Professional</div>
                <div className="text-xs text-neutral-400">Zero fixed commission. Pay nominal credits only when you choose to quote.</div>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('PROFESSIONAL')}
              className="w-full sm:w-auto whitespace-nowrap bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition"
            >
              Partner Sign Up
            </button>
          </div>

          {/* Key Value Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>DigiLocker Verified Pros</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Reverse Auction Quotes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Payment Protection Escrow (6%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Privacy-Masked Calling</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
