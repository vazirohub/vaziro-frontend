import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Sparkles,
  Star,
  Users,
  ShieldCheck,
} from 'lucide-react';

const categoryMeta: Record<
  string,
  { photo: string; prosCount: string; rateHint: string; rating: string }
> = {
  'elderly-caregiver': {
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
    prosCount: '160+ Pros',
    rateHint: 'From ₹15,000/mo',
    rating: '4.9',
  },
  'physiotherapist': {
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    prosCount: '90+ Pros',
    rateHint: 'From ₹600/session',
    rating: '5.0',
  },
  'home-nurse': {
    photo: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
    prosCount: '110+ Pros',
    rateHint: 'From ₹18,000/mo',
    rating: '4.9',
  },
  'home-cook-chef': {
    photo: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    prosCount: '140+ Pros',
    rateHint: 'From ₹7,000/mo',
    rating: '4.8',
  },
  'home-tutor': {
    photo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    prosCount: '200+ Pros',
    rateHint: 'From ₹400/hr',
    rating: '4.9',
  },
  'fitness-trainer': {
    photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    prosCount: '75+ Pros',
    rateHint: 'From ₹500/session',
    rating: '4.9',
  },
  'yoga-trainer': {
    photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    prosCount: '80+ Pros',
    rateHint: 'From ₹450/session',
    rating: '5.0',
  },
  'baby-caregiver-japa-maid': {
    photo: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
    prosCount: '65+ Pros',
    rateHint: 'From ₹20,000/mo',
    rating: '4.9',
  },
};

export const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCategoryClick = (categorySlug: string) => {
    if (isProfessional && !isAdmin) {
      navigate(`/requirements?category=${encodeURIComponent(categorySlug)}`);
    } else {
      navigate(`/professionals?category=${encodeURIComponent(categorySlug)}`);
    }
  };

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="categories" className="py-16 sm:py-20 bg-[#fcfbf8] border-b border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#108a00]" />
              <span>Browse by Service Domain</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Pre-verified home & personal care experts.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl font-normal">
              Compare transparent quotes from independent professionals across Delhi, Noida, and Gurugram with 100% Escrow protection.
            </p>
          </div>

          <button
            onClick={() => navigate(isProfessional && !isAdmin ? '/requirements' : '/professionals')}
            className="text-xs sm:text-sm font-bold text-[#108a00] hover:text-[#14a800] hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer self-start md:self-end"
          >
            <span>{isProfessional && !isAdmin ? 'Browse all customer requests' : 'Explore all verified professionals'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200/70 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
            {categories.map((cat) => {
              const meta = categoryMeta[cat.slug] || {
                photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
                prosCount: '50+ Pros',
                rateHint: 'Transparent Rates',
                rating: '4.9',
              };

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(cat.slug);
                    }
                  }}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-emerald-400 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={meta.photo}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                    
                    {/* Dark gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-neutral-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{meta.rating}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-neutral-950/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Bottom Photo Overlay Info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-[10px] font-bold text-white/90 bg-neutral-950/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        {meta.prosCount}
                      </span>
                      <span className="text-[10px] font-bold text-[#c9f27d] bg-neutral-950/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        {meta.rateHint}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 group-hover:text-[#108a00] transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-2 mt-1 leading-snug">
                        {cat.description || 'Pre-verified independent professionals ready to assist.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-[#108a00]">
                      <span>{isProfessional && !isAdmin ? 'Browse jobs' : 'Find professionals'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
