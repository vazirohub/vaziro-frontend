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
  Sparkles,
  Award,
  ChevronRight,
  BadgeCheck,
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
      {/* Subtle modern Upwork-style background ambient glows */}
      <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[38rem] w-[38rem] rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[#f0f5e8]/80 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ================= LEFT COLUMN: UPWORK STYLE HERO COPY & CONTROLS ================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Upwork Pill Announcement Badge */}
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

            {/* Upwork Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.15rem] font-black text-[#10241e] tracking-tight leading-[1.04]">
              How home care &amp; personal help{' '}
              <span className="relative inline-block text-[#183e33]">
                should work.
                <span className="absolute left-0 bottom-1.5 w-full h-3 bg-[#c9f27d]/50 -z-10 rounded-sm transform -rotate-1" />
              </span>
            </h1>

            {/* Editorial Subheading */}
            <p className="text-base sm:text-lg text-[#52665d] font-normal leading-relaxed max-w-xl">
              Forget rigid agency commissions and endless calls. Connect directly with independent,
              DigiLocker-verified caregivers, nurses, tutors, cooks, and trainers across Delhi NCR. Compare transparent
              quotes and hire on your own terms.
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

            {/* Upwork Integrated Search Box with City Selector & Direct Action */}
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

                {/* Upwork High-Converting Green Action Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#183e33] hover:bg-[#235345] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>{searchMode === 'HIRE' ? 'Get Quotes' : 'Find Jobs'}</span>
                  <ArrowRight className="w-4 h-4 text-[#c9f27d]" />
                </button>
              </div>
            </form>

            {/* Upwork-style "Popular:" Search Tags */}
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

            {/* Dual Upwork-style Direct Buttons & Reassurances */}
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

          {/* ================= RIGHT COLUMN: UPWORK STYLE TALENT SHOWCASE ================= */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Upwork Talent Profile Card */}
              <div className="rounded-3xl border border-[#d6e3d5] bg-white p-5 sm:p-6 shadow-[0_24px_50px_-20px_rgba(24,62,51,0.18)] relative overflow-hidden">
                
                {/* Card Top Pill: Top Rated Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Top Rated Pro</span>
                    <span className="text-neutral-300">•</span>
                    <span>100% Job Success</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#183e33] bg-[#c9f27d]/40 px-2.5 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-emerald-700" /> Available Now
                  </span>
                </div>

                {/* Professional Photo & Identity Row */}
                <div className="pt-4 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80"
                      alt="Dr. Neeraj Sharma, BPT Physiotherapist"
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                      title="Online Now"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-black text-[#10241e]">Dr. Neeraj Sharma</h3>
                      <span className="text-xs font-bold text-[#5e7b4c]">BPT, MPT</span>
                      <span title="DigiLocker Verified" className="inline-flex items-center">
                        <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs text-[#52665d] font-semibold">
                      Senior Physiotherapist &amp; Neuro Rehab Specialist
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-medium">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400" /> South Delhi &amp; Gurugram
                      </span>
                      <span>•</span>
                      <span>8+ yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* DigiLocker Official Verification Strip */}
                <div className="mt-4 rounded-xl bg-[#f0f6ee] border border-[#d2e4ce] p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#183e33] text-[#c9f27d] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-[#183e33] leading-tight">
                        DigiLocker Identity Verified
                      </div>
                      <div className="text-[10px] text-[#52665d]">Aadhaar &amp; Clinical Certification Checked</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ VERIFIED
                  </span>
                </div>

                {/* Upwork-style Key Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center border-y border-neutral-100 py-3">
                  <div>
                    <div className="text-sm sm:text-base font-black text-[#10241e]">₹12,000</div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Starting Rate</div>
                  </div>
                  <div className="border-x border-neutral-100">
                    <div className="text-sm sm:text-base font-black text-[#10241e] flex items-center justify-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> 4.95
                    </div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">48 Reviews</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black text-emerald-700">99%</div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Satisfaction</div>
                  </div>
                </div>

                {/* Professional Skills / Services Tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {['Post-TKR Knee Rehab', 'Stroke Recovery', 'Sciatica Relief', 'Geriatric Mobility'].map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Live Activity Quotation Box (Upwork Marketplace Vibe) */}
                <div className="mt-4 rounded-xl bg-[#fafbfa] border border-[#e4ebe2] p-3 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#10241e]">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Clock className="w-3.5 h-3.5" /> Recent Quotation Submitted
                    </span>
                    <span className="text-neutral-400 font-normal">8 mins ago</span>
                  </div>
                  <p className="mt-1 text-xs text-[#52665d] line-clamp-1 italic">
                    &ldquo;Available for daily home visits in Saket &amp; Greater Kailash starting tomorrow morning.&rdquo;
                  </p>
                </div>
              </div>

              {/* Floating Social Proof Card 1: Top Left */}
              <div className="hidden sm:flex absolute -top-4 -left-6 bg-white p-3 rounded-2xl shadow-xl border border-neutral-200 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#183e33] text-[#c9f27d] flex items-center justify-center font-black">
                  <Star className="w-5 h-5 fill-[#c9f27d]" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#10241e] flex items-center gap-1">
                    <span>4.9 / 5 Rating</span>
                    <span className="text-emerald-700 font-bold">• Top Match</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold">2,500+ satisfied families in NCR</div>
                </div>
              </div>

              {/* Floating Social Proof Card 2: Bottom Right */}
              <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-[#10241e] text-white p-3 rounded-2xl shadow-xl border border-neutral-700 items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-[#c9f27d] flex items-center justify-center">
                  <Award className="w-4 h-4 text-[#c9f27d]" />
                </div>
                <div>
                  <div className="text-xs font-black">Free to Post</div>
                  <div className="text-[10px] text-neutral-300">Compare quotes before hiring</div>
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
