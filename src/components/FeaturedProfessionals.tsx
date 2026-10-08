import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';

const FEATURED_PROS = [
  {
    id: 'pro-sunita-sharma',
    name: 'Sunita Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    title: 'Senior Geriatric & Elderly Caregiver',
    location: 'South Delhi (GK, Saket, Vasant Kunj)',
    experience: '8+ yrs exp',
    rating: 4.9,
    reviewsCount: 54,
    hourlyRate: '₹250/hr',
    monthlyRate: '₹18,000/mo',
    completedJobs: 48,
    responseTime: '< 25 mins',
    badge: 'Top Rated Pro',
    skills: ['Dementia & Alzheimer Care', 'Mobility Support', 'Bedridden Care', 'Vitals Monitoring', 'Medicine Routine'],
    bio: 'Compassionate, patient-centered elderly companion with certified training in geriatric nursing assistance. Dedicated to dignity, daily hygiene, and emotional well-being.',
  },
  {
    id: 'pro-dr-rajesh-verma',
    name: 'Dr. Rajesh Verma, BPT',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    title: 'Neuro & Orthopaedic Physiotherapist',
    location: 'Gurugram (DLF Ph 1-5, Golf Course Rd)',
    experience: '10+ yrs exp',
    rating: 5.0,
    reviewsCount: 72,
    hourlyRate: '₹750/session',
    monthlyRate: '₹16,000/pkg',
    completedJobs: 85,
    responseTime: '< 15 mins',
    badge: 'Top Rated Pro',
    skills: ['Stroke Rehab', 'Knee & Hip Replacement Rehab', 'Spine & Sciatica Relief', 'Geriatric Mobility', 'Dry Needling'],
    bio: 'Licensed physiotherapist specializing in post-surgical orthopedic recovery and neuro-rehabilitation at home. Personalized exercise regimens for rapid, painless mobility.',
  },
  {
    id: 'pro-anita-mary',
    name: 'Sister Anita Mary, GNM',
    avatar: 'https://images.unsplash.com/photo-1594824813591-628d0be4299b?auto=format&fit=crop&w=300&q=80',
    title: 'Critical Care & Post-Operative Home Nurse',
    location: 'Noida (Sec 50, 62, 137) & Greater Noida',
    experience: '7+ yrs exp',
    rating: 4.9,
    reviewsCount: 46,
    hourlyRate: '₹350/hr',
    monthlyRate: '₹24,000/mo',
    completedJobs: 62,
    responseTime: '< 30 mins',
    badge: 'Hospital Certified',
    skills: ['Tracheostomy Care', 'IV & Injections', 'Catheterization', 'Wound Dressing', 'ICU Protocol at Home'],
    bio: 'Registered staff nurse with 7 years of ICU and home healthcare experience. Expert in aseptic clinical procedures, medication management, and patient comfort.',
  },
  {
    id: 'pro-chef-vikram',
    name: 'Chef Vikram Mehra',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80',
    title: 'Gourmet Home Cook & Health Diet Chef',
    location: 'Delhi NCR (Central, East & Noida)',
    experience: '6+ yrs exp',
    rating: 4.8,
    reviewsCount: 89,
    hourlyRate: '₹200/hr',
    monthlyRate: '₹9,500/mo',
    completedJobs: 94,
    responseTime: '< 20 mins',
    badge: 'Hygienic Certified',
    skills: ['North & South Indian', 'Diabetic & Low Sodium', 'Continental & Salads', 'Clean Kitchen Protocol', 'Family Meal Prep'],
    bio: 'Culinary trained home chef dedicated to 100% hygienic, fresh daily meals tailored to your family’s dietary preferences, calorie goals, and taste profiles.',
  },
];

export const FeaturedProfessionals: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#108a00]" />
              <span>Independent Verified Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Featured top-rated professionals in Delhi NCR.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl font-normal">
              Pre-vetted through DigiLocker with verified references. Review transparent profiles and hire with 100% Escrow milestone security.
            </p>
          </div>

          <Link
            to="/professionals"
            className="text-xs sm:text-sm font-bold text-[#108a00] hover:text-[#14a800] hover:underline flex items-center gap-1.5 shrink-0 self-start md:self-end"
          >
            <span>Browse all 800+ verified professionals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2x2 Grid of Top-Tier Professionals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FEATURED_PROS.map((pro) => (
            <div
              key={pro.id}
              className="bg-[#fcfbf8] hover:bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-300 p-5 sm:p-6 transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Avatar, Name, Badges & Rate */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={pro.avatar}
                        alt={pro.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#108a00] text-white flex items-center justify-center shadow-xs" title="DigiLocker Verified ID">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                          {pro.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {pro.badge}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-neutral-700 mt-0.5">
                        {pro.title}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{pro.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hourly / Monthly Rate */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-neutral-900">
                      {pro.hourlyRate}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-medium">
                      or {pro.monthlyRate}
                    </div>
                  </div>
                </div>

                {/* Performance Stats Pill Row */}
                <div className="mt-4 pt-3 border-t border-neutral-200/60 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pro.rating.toFixed(1)}</span>
                    <span className="text-[11px] text-neutral-400 font-normal">({pro.reviewsCount} reviews)</span>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-600 font-semibold text-[11px]">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{pro.completedJobs} contracts done</span>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-600 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Responds {pro.responseTime}</span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                    <span>DigiLocker Verified</span>
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="mt-3 text-xs text-neutral-600 leading-relaxed line-clamp-2">
                  {pro.bio}
                </p>

                {/* Skills Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pro.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions Row with Privacy Guard Notice */}
              <div className="mt-5 pt-3.5 border-t border-neutral-200/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                  <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>Contact unlocked upon hire</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/post-requirement"
                    className="px-3.5 py-1.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition"
                  >
                    Request Quote
                  </Link>

                  <Link
                    to="/professionals"
                    className="px-4 py-1.5 rounded-full bg-[#108a00] hover:bg-[#14a800] text-white text-xs font-bold transition shadow-xs"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#108a00] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-emerald-950">
                100% Escrow Milestone Guarantee
              </div>
              <div className="text-xs text-emerald-800">
                You only release payment once you inspect and approve the completed service.
              </div>
            </div>
          </div>

          <Link
            to="/post-requirement"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-bold shrink-0 text-center transition"
          >
            Post a requirement for free &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
};
