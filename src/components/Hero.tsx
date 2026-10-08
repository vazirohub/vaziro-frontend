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
    <section className="relative bg-[#fcfbf8] py-2 sm:py-3 lg:py-4 border-b border-[#dce6df]">
      {/* Widescreen Container (Increased width matching Upwork reference) */}
      <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* ================= HERO VIDEO BANNER CARD ================= */}
        {/* Desktop Height fits in one screen (lg:max-h-[560px] / lg:h-[calc(100vh-125px)]) */}
        <div className="relative rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[2.5rem] overflow-hidden bg-neutral-950 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] min-h-[460px] sm:min-h-[500px] lg:h-[calc(100vh-125px)] lg:max-h-[560px] flex items-center">
          
          {/* Autoplay Looping Background Video (Home Care & Health Assistance) */}
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

          {/* Left-Side Dark Gradient Overlay for High-Contrast Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 sm:via-neutral-950/75 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30 pointer-events-none" />

          {/* Left-Aligned Hero Content - Compact Vertical Spacing to Fit One Screen */}
          <div className="relative z-10 w-full max-w-2xl px-5 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-8 text-left space-y-3 sm:space-y-3.5 lg:space-y-4">
            
            {/* Hire / Work Capsule Pill Switcher (Exact Upwork Reference Style) */}
            <div>
              <div
                className="inline-flex rounded-full bg-white/15 backdrop-blur-md p-1 border border-white/20"
                role="group"
                aria-label="Marketplace Role Mode"
              >
                <button
                  type="button"
                  onClick={() => setSearchMode('HIRE')}
                  className={`px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    searchMode === 'HIRE'
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Hire
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('WORK')}
                  className={`px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    searchMode === 'WORK'
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Work
                </button>
              </div>
            </div>

            {/* Editorial Headline with Italic Serif Accent */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-white tracking-[-0.04em] leading-[1.05]">
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
            <p className="text-xs sm:text-sm lg:text-[15px] text-neutral-200 font-normal leading-relaxed max-w-xl">
              {searchMode === 'HIRE'
                ? 'Connect directly with independent, DigiLocker-verified caregivers, nurses, tutors, cooks, and trainers across Delhi NCR. Compare transparent quotes and hire on your terms.'
                : 'Find verified client requirements across Delhi NCR, send quotations directly with zero commission cuts, and get hired on your own schedule.'}
            </p>

            {/* Integrated Search Box with City Selector & Direct Action */}
            <form onSubmit={handleSearchSubmit} className="pt-0.5">
              <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl sm:rounded-2xl border border-white/40 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                
                {/* Service Zone Selector */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 border-b sm:border-b-0 sm:border-r border-neutral-200 w-full sm:w-auto text-xs font-bold text-neutral-800 shrink-0">
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
                <div className="flex-1 flex items-center gap-2 px-2 w-full">
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
                    className="w-full text-xs sm:text-sm font-semibold text-[#10241e] placeholder:text-neutral-400 focus:outline-none py-1"
                  />
                </div>

                {/* Upwork Iconic Green Action Button (Matches Screenshot: Get started →) */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#108a00] hover:bg-[#14a800] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
                >
                  <span>{searchMode === 'HIRE' ? 'Get started' : 'Browse jobs'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Popular Search Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-xs text-neutral-300">
              <span className="font-bold text-white text-[11px] sm:text-xs shrink-0">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleTagClick(tag.query)}
                  className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-neutral-200 hover:text-white transition cursor-pointer backdrop-blur-sm"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Value Checkmarks */}
            <div className="pt-1 flex flex-wrap items-center gap-y-1.5 gap-x-5 text-[11px] sm:text-xs font-semibold text-neutral-300">
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
    </section>
  );
};
