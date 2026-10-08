import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Upwork-style mode toggle: 'HIRE' (Looking for pros) or 'WORK' (Looking for jobs)
  const [searchMode, setSearchMode] = useState<'HIRE' | 'WORK'>(
    isProfessional && !isAdmin ? 'WORK' : 'HIRE'
  );
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly Delhi NCR Cities as requested
  const ncrCities = ['Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'];

  // Upwork-style trending/popular tags
  const popularTags = [
    { label: 'Elderly Caregiver', query: 'Elderly Care' },
    { label: 'Home Nurse', query: 'Home Nurse' },
    { label: 'Physiotherapist', query: 'Physiotherapy' },
    { label: 'Maths Tutor', query: 'Mathematics' },
    { label: 'Home Cook', query: 'Cook' },
    { label: 'Yoga Instructor', query: 'Yoga' },
    { label: 'Nanny / Baby Care', query: 'Nanny' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'WORK') {
      navigate(
        `/requirements?city=${encodeURIComponent(selectedCity)}${
          searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
        }`
      );
    } else {
      if (searchQuery.trim()) {
        navigate(
          `/post-requirement?city=${encodeURIComponent(selectedCity)}&q=${encodeURIComponent(
            searchQuery.trim()
          )}`
        );
      } else {
        navigate(`/post-requirement?city=${encodeURIComponent(selectedCity)}`);
      }
    }
  };

  const handleTagClick = (tagQuery: string) => {
    setSearchQuery(tagQuery);
    if (searchMode === 'WORK') {
      navigate(`/requirements?city=${encodeURIComponent(selectedCity)}&q=${encodeURIComponent(tagQuery)}`);
    } else {
      navigate(`/post-requirement?city=${encodeURIComponent(selectedCity)}&q=${encodeURIComponent(tagQuery)}`);
    }
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-[#dce6df] bg-[#fcfbf8] pt-10 pb-16 lg:pt-16 lg:pb-20">
      {/* Subtle modern background ambient glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 -z-10 h-[38rem] w-[38rem] rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#f0f5e8]/70 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= FOCUSED CENTERED HERO CONTENT ================= */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Pill Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1.5 shadow-[0_2px_8px_rgba(24,62,51,0.04)] mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-[#14a800] animate-pulse" />
            <span className="text-xs font-bold text-[#183e33] tracking-wide">
              Delhi NCR&apos;s Independent Care &amp; Service Marketplace
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs font-semibold text-[#5e7b4c] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              DigiLocker Verified
            </span>
          </div>

          {/* Beloved Editorial Headline with Serif Italic Accent */}
          <h1 className="text-4xl sm:text-5xl lg:text-[4.65rem] font-semibold text-[#24352b] tracking-[-0.065em] leading-[1.02]">
            Find the right help.<br />
            <span
              className="font-normal text-[#5e7b4c]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                letterSpacing: '-0.04em',
              }}
            >
              Feel good about it.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#52665d] font-medium leading-relaxed max-w-2xl mx-auto">
            Connect directly with independent, DigiLocker-verified caregivers, nurses, tutors, cooks, and trainers
            across Delhi NCR. Compare transparent quotations, chat directly, and choose the right person for your family.
          </p>

          {/* Upwork Mode Switcher (Hire Talent vs Find Work) */}
          <div className="pt-1 flex justify-center">
            <div
              className="inline-flex rounded-xl bg-[#eef3ea] p-1 border border-[#d6e3d2]"
              role="group"
              aria-label="Marketplace Role Mode"
            >
              <button
                type="button"
                onClick={() => setSearchMode('HIRE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  searchMode === 'HIRE'
                    ? 'bg-white text-[#10241e] shadow-sm'
                    : 'text-[#5a6b5f] hover:text-[#10241e]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Hire a Professional</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('WORK')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  searchMode === 'WORK'
                    ? 'bg-[#10241e] text-white shadow-sm'
                    : 'text-[#5a6b5f] hover:text-[#10241e]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#c9f27d]" />
                <span>Browse 45+ Open Jobs</span>
              </button>
            </div>
          </div>

          {/* Integrated Search Box with City Selector & Direct Action */}
          <form onSubmit={handleSearchSubmit} className="pt-1 max-w-2xl mx-auto">
            <div className="bg-white p-2 rounded-2xl border-2 border-[#d0ded0] focus-within:border-[#183e33] focus-within:ring-4 focus-within:ring-emerald-900/5 shadow-[0_16px_36px_-16px_rgba(16,36,30,0.18)] transition-all flex flex-col sm:flex-row items-center gap-2">
              
              {/* City Selector */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 w-full sm:w-auto text-xs font-bold text-neutral-800 shrink-0">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold leading-none mb-0.5">
                    Service Zone
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    aria-label="Select Service Zone"
                    className="bg-transparent text-xs font-bold text-[#10241e] focus:outline-none cursor-pointer pr-1"
                  >
                    {ncrCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Text Input */}
              <div className="flex-1 flex items-center gap-2.5 px-3 w-full">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMode === 'HIRE'
                      ? 'Try "Elderly Care", "Physiotherapy", "Maths Tutor"...'
                      : 'Search requirements by role, skill or area...'
                  }
                  className="w-full text-xs sm:text-sm font-semibold text-[#10241e] placeholder:text-neutral-400 focus:outline-none py-1.5 text-left"
                />
              </div>

              {/* High-Converting Action Button */}
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#183e33] hover:bg-[#235345] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
              >
                <span>{searchMode === 'HIRE' ? 'Get Quotes' : 'Find Jobs'}</span>
                <ArrowRight className="w-4 h-4 text-[#c9f27d]" />
              </button>
            </div>
          </form>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[#52665d]">
            <span className="font-bold text-[#10241e] shrink-0">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleTagClick(tag.query)}
                className="rounded-full border border-[#d6e2d4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#304538] hover:border-emerald-600 hover:bg-[#f2f7ef] hover:text-[#183e33] transition cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Direct CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/post-requirement?city=${encodeURIComponent(selectedCity)}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c9f27d] hover:bg-[#d8faa2] px-5 text-sm font-bold text-[#183e33] shadow-sm transition"
            >
              <span>Post a Requirement — Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={`/requirements?city=${encodeURIComponent(selectedCity)}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#cbd8cc] bg-white px-5 text-sm font-bold text-[#23382c] hover:border-emerald-700 hover:text-emerald-900 transition"
            >
              <span>Browse 45+ Active Jobs</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>

          {/* Reassurance Checkmarks */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-semibold text-[#5a6b60]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero platform fee to post</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Quotes arrive within minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct chat &amp; call requests</span>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM UPWORK-STYLE TRUST & STATS STRIP ================= */}
        <div className="mt-14 pt-8 border-t border-[#dce6df]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-left max-w-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                The Vaziro Advantage
              </span>
              <h4 className="text-base font-extrabold text-[#10241e]">
                Transparent. Independent. Safe.
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 flex-1">
              <div className="text-left">
                <div className="text-2xl font-black text-[#10241e]">4.95 ★</div>
                <div className="text-xs font-semibold text-[#52665d] mt-0.5">Average Pro Rating</div>
              </div>

              <div className="text-left">
                <div className="text-2xl font-black text-[#183e33]">100%</div>
                <div className="text-xs font-semibold text-[#52665d] mt-0.5">DigiLocker Verified Pros</div>
              </div>

              <div className="text-left">
                <div className="text-2xl font-black text-[#10241e]">45+</div>
                <div className="text-xs font-semibold text-[#52665d] mt-0.5">Active Jobs in Delhi NCR</div>
              </div>

              <div className="text-left">
                <div className="text-2xl font-black text-emerald-700">₹0 Fee</div>
                <div className="text-xs font-semibold text-[#52665d] mt-0.5">To Post &amp; Compare Quotes</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
