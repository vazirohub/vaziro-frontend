import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  Play,
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
    <section className="relative isolate overflow-hidden border-b border-[#dce6df] bg-[#fcfbf8] pt-8 pb-14 lg:pt-14 lg:pb-20">
      {/* Subtle modern background ambient glows */}
      <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[38rem] w-[38rem] rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[#f0f5e8]/80 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ================= LEFT COLUMN: ORIGINAL EDITORIAL FONT STYLE + CONTROLS ================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1.5 shadow-[0_2px_8px_rgba(24,62,51,0.04)]">
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
            <h1 className="text-4xl sm:text-5xl lg:text-[4.35rem] font-semibold text-[#24352b] tracking-[-0.065em] leading-[1.02]">
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
            <p className="text-base sm:text-lg text-[#52665d] font-medium leading-relaxed max-w-xl">
              Connect directly with independent, DigiLocker-verified caregivers, nurses, tutors, cooks, and trainers
              across Delhi NCR. Compare transparent quotations, chat directly, and choose the right person for your family.
            </p>

            {/* Upwork Mode Switcher (Hire Talent vs Find Work) */}
            <div className="pt-1">
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
            <form onSubmit={handleSearchSubmit} className="pt-1">
              <div className="bg-white p-2 rounded-2xl border-2 border-[#d0ded0] focus-within:border-[#183e33] focus-within:ring-4 focus-within:ring-emerald-900/5 shadow-[0_16px_36px_-16px_rgba(16,36,30,0.18)] transition-all flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                
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
                    className="w-full text-xs sm:text-sm font-semibold text-[#10241e] placeholder:text-neutral-400 focus:outline-none py-1.5"
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
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#52665d]">
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
            <div className="pt-3 flex flex-wrap items-center gap-3">
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
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-semibold text-[#5a6b60]">
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

          {/* ================= RIGHT COLUMN: OVERLAP STYLE MEDIA COMPOSITION ================= */}
          <div className="lg:col-span-5 relative pt-4 pb-6 sm:pb-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* 1. Primary Anchor Visual Card */}
              <div className="relative rounded-[2.25rem] overflow-hidden shadow-[0_32px_70px_-28px_rgba(24,62,51,0.38)] border-[6px] border-white aspect-[4/4.7] bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1000&q=80"
                  alt="A professional caregiver assisting an elderly family member"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Primary Card Bottom Caption */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c9f27d] animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#c9f27d]">
                      Independent Marketplace
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-black mt-0.5">
                    Verified In-Home &amp; Care Services
                  </div>
                  <div className="text-xs text-neutral-300">
                    Delhi • Noida • Gurugram • Ghaziabad • Greater Noida
                  </div>
                </div>
              </div>

              {/* 2. Secondary Overlapping Card: Video / Session Preview Card */}
              <div className="absolute -bottom-6 -left-3 sm:-left-8 w-[72%] sm:w-[68%] rounded-2xl border-[5px] border-white bg-white shadow-[0_24px_50px_-14px_rgba(0,0,0,0.35)] overflow-hidden transition-transform duration-300 hover:-translate-y-1 group">
                <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                    alt="Home service session in progress"
                    className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                  {/* Video Play Button Overlay */}
                  <Link
                    to="/workflow-preview"
                    className="absolute inset-0 flex flex-col items-center justify-center text-white"
                    aria-label="Watch how Vaziro works"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#183e33]/90 text-[#c9f27d] border-2 border-white/40 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-[#c9f27d] ml-0.5" />
                    </div>
                    <span className="mt-2 text-[10px] font-extrabold uppercase tracking-wide bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      Watch Workflow • 1 min
                    </span>
                  </Link>
                </div>

                <div className="p-2.5 bg-white text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#10241e]">How Vaziro Works</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      Fast &amp; Direct
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                    Post request, compare quotes, hire safely
                  </p>
                </div>
              </div>

              {/* 3. Floating Overlapping Badge: 4.95 Rating (Top-Right) */}
              <div className="absolute -top-4 -right-3 sm:-right-6 bg-white p-3 rounded-2xl shadow-xl border border-neutral-200 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#183e33] text-[#c9f27d] flex items-center justify-center font-black">
                  <Star className="w-4 h-4 fill-[#c9f27d]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#10241e] flex items-center gap-1">
                    <span>4.95 Rating</span>
                    <span className="text-emerald-700 font-bold">• Top Match</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold">2,500+ happy families in NCR</div>
                </div>
              </div>

              {/* 4. Floating Overlapping Badge: DigiLocker Verified Shield (Middle-Right) */}
              <div className="hidden sm:flex absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-100 items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#183e33]">DigiLocker Verified</div>
                  <div className="text-[10px] text-[#5e7b4c] font-medium">Govt ID &amp; Aadhaar checked</div>
                </div>
              </div>

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
