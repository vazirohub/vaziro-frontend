import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const categoryPhotos: Record<string, string> = {
  'elderly-caregiver': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
  'fitness-trainer': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'home-cook-chef': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
  'home-nurse': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
  'home-tutor': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
  'nanny-baby-care': 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
  physiotherapist: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
  'yoga-instructor': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
};

export const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCategoryAction = (catId?: string) => {
    if (isProfessional && !isAdmin) {
      navigate(catId ? `/requirements?categoryId=${encodeURIComponent(catId)}` : '/requirements');
    } else {
      navigate('/post-requirement');
    }
  };

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="categories" className="py-20 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9efdd] text-[#48633e] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Home & personal care</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Find help by service
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl font-medium">
              Explore available services across Delhi NCR. Open a category to describe what you need or browse customer requests if you provide a service.
            </p>
          </div>

          <button
            onClick={() => handleCategoryAction()}
            className="mt-4 md:mt-0 text-xs font-extrabold text-black hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>{isProfessional && !isAdmin ? 'Browse customer requests' : 'Browse all services'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Real Indian Photography Cards Grid */
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {categories.map((cat) => {
              const photo = categoryPhotos[cat.slug] || categoryPhotos['elderly-caregiver'];

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryAction(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleCategoryAction(cat.id); } }}
                  className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md hover:border-[#c5d5a8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78935f] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-32 w-full overflow-hidden bg-neutral-900 sm:h-48">
                    <img
                      src={photo}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* Top Pill Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {cat.subcategories?.length ? <span className="rounded-full border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">{cat.subcategories.length} service types</span> : null}
                    </div>

                    {/* Category Title on Photo */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-black tracking-tight leading-tight group-hover:text-amber-200 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-neutral-300 font-medium">Explore service options</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-5">
                    <div>
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-medium">
                        {cat.description}
                      </p>

                      {/* Subcategory Pills */}
                      <div className="mt-2.5 flex flex-wrap gap-1 sm:mt-3.5 sm:gap-1.5">
                        {cat.subcategories?.slice(0, 2).map((sub) => (
                          <span
                            key={sub.id}
                            className="max-w-full truncate rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700 sm:px-2 sm:text-[11px]"
                          >
                            {sub.name}
                          </span>
                        ))}
                        {cat.subcategories && cat.subcategories.length > 2 && (
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                            +{cat.subcategories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Price & CTA */}
                    <div className="mt-3 flex flex-col items-stretch gap-2 border-t border-neutral-100 pt-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-3.5">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-neutral-400 sm:text-[11px]">Service type</span>
                        <span className="text-xs font-semibold text-neutral-700 sm:text-sm">{cat.subcategories?.length || 0} options</span>
                      </div>

                      <span
                        className="inline-flex min-h-10 items-center justify-center gap-1 bg-[#203c32] px-2.5 text-[11px] font-semibold text-white transition shadow-sm sm:gap-1.5 sm:rounded-lg sm:px-3.5 sm:text-xs"
                      >
                        <span>{isProfessional && !isAdmin ? 'View requests' : 'Get started'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
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
