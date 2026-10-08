import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Mode toggle: 'HIRE' (Looking for pros) or 'WORK' (Looking for jobs)
  const [searchMode, setSearchMode] = useState<'HIRE' | 'WORK'>(
    isProfessional && !isAdmin ? 'WORK' : 'HIRE'
  );
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly Delhi NCR Cities as requested
  const ncrCities = ['Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'];

  // Popular service tags
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

  const handleMobileCta = () => {
    if (searchMode === 'WORK') {
      navigate(`/requirements?city=${encodeURIComponent(selectedCity)}`);
    } else {
      navigate(`/post-requirement?city=${encodeURIComponent(selectedCity)}`);
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
    <section className="relative bg-[#fcfbf8] py-0 sm:py-3 lg:py-4 border-b border-[#dce6df]">
      {/* Outer container */}
      <div className="w-full max-w-[1480px] mx-auto px-0 sm:px-6 lg:px-8">
        
        {/* ================= HERO VIDEO BANNER CARD ================= */}
        <div className="relative rounded-none sm:rounded-[2.25rem] lg:rounded-[2.5rem] overflow-hidden bg-neutral-950 shadow-none sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] min-h-[540px] h-[calc(100svh-65px)] max-h-[720px] lg:h-auto lg:min-h-[540px] flex flex-col justify-end lg:justify-center">
          
          {/* Autoplay Looping Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=80"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 pointer-events-none"
          >
            <source src="/videos/hero-care.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/5414/5414-720.mp4" type="video/mp4" />
          </video>

          {/* Gradients */}
          {/* Mobile: Fades from transparent at top (showing video) to deep black at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 via-55% to-transparent lg:hidden pointer-events-none" />
          
          {/* Desktop: Left-to-right cinematic dark gradient */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 via-50% to-transparent pointer-events-none" />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30 pointer-events-none" />

          {/* Website Grid Aligned Container (Matches max-w-7xl px-4 sm:px-6 lg:px-8 of the website) */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pb-7 pt-4 sm:px-8 sm:pb-9 lg:px-8 lg:py-12">
            <div className="max-w-2xl text-left space-y-4 sm:space-y-4.5 lg:space-y-5">
              
              {/* Hire / Work Capsule Pill Switcher */}
              <div>
                <div
                  className="inline-flex rounded-full bg-white/20 backdrop-blur-md p-1 border border-white/25"
                  role="group"
                  aria-label="Marketplace Role Mode"
                >
                  <button
                    type="button"
                    onClick={() => setSearchMode('HIRE')}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      searchMode === 'HIRE'
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Hire
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode('WORK')}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      searchMode === 'WORK'
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Work
                  </button>
                </div>
              </div>

              {/* Editorial Headline with Serif Italic Accent (Clean line-height to prevent overlap) */}
              <h1 className="text-[2.1rem] sm:text-4xl lg:text-[3.75rem] xl:text-[4.15rem] font-bold text-white tracking-[-0.035em] leading-[1.14] sm:leading-[1.14] lg:leading-[1.14]">
                Find the right help.<br />
                <span
                  className="font-normal text-[#c9f27d]"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: 'italic',
                    letterSpacing: '-0.03em',
                  }}
                >
                  Feel good about it.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-neutral-200 font-normal leading-relaxed max-w-xl">
                {searchMode === 'HIRE'
                  ? 'Connect directly with independent, DigiLocker-verified caregivers, nurses, tutors, cooks, and trainers across Delhi NCR. Compare transparent quotes and hire on your terms.'
                  : 'Find verified client requirements across Delhi NCR, send quotations directly with zero commission cuts, and get hired on your own schedule.'}
              </p>

              {/* MOBILE CALL TO ACTION (Exact Upwork Mobile Reference: Full-width glowing green pill button) */}
              <div className="block lg:hidden pt-1">
                <button
                  type="button"
                  onClick={handleMobileCta}
                  className="w-full bg-[#108a00] hover:bg-[#14a800] active:scale-[0.99] text-white text-base font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-[0_0_26px_rgba(16,138,0,0.6)] transition-all cursor-pointer"
                >
                  <span>{searchMode === 'HIRE' ? 'Get started' : 'Browse jobs'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* DESKTOP SEARCH BAR (Integrated search with city selector) */}
              <div className="hidden lg:block pt-1 space-y-3.5">
                <form onSubmit={handleSearchSubmit}>
                  <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-2xl flex items-center gap-2 max-w-xl">
                    
                    {/* Service Zone Selector */}
                    <div className="flex items-center gap-2 px-2.5 py-1 border-r border-neutral-200 text-xs font-bold text-neutral-800 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
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
                    <div className="flex-1 flex items-center gap-2 px-2">
                      <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          searchMode === 'HIRE'
                            ? 'Try "Elderly Care", "Physio", "Tutor"...'
                            : 'Search active job requirements...'
                        }
                        className="w-full text-xs sm:text-sm font-semibold text-[#10241e] placeholder:text-neutral-400 focus:outline-none py-1.5"
                      />
                    </div>

                    {/* Glowing Green Action Button */}
                    <button
                      type="submit"
                      className="bg-[#108a00] hover:bg-[#14a800] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-[0_0_18px_rgba(16,138,0,0.5)] cursor-pointer"
                    >
                      <span>{searchMode === 'HIRE' ? 'Get started' : 'Browse jobs'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Popular Search Tags (Desktop) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-300">
                  <span className="font-bold text-white text-xs shrink-0">Popular:</span>
                  {popularTags.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleTagClick(tag.query)}
                      className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-neutral-200 hover:text-white transition cursor-pointer backdrop-blur-sm"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Trust Checkmarks (Desktop) */}
                <div className="pt-1 flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs font-semibold text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c9f27d]" />
                    <span>DigiLocker Verified Pros</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9f27d]" />
                    <span>Zero platform fee to post</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9f27d]" />
                    <span>Direct chat &amp; calls</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
