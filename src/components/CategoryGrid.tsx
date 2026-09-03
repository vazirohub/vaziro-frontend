import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category } from '../types';
import {
  HeartHandshake,
  Dumbbell,
  ChefHat,
  Cross,
  GraduationCap,
  Baby,
  Activity,
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  ChefHat: <ChefHat className="w-5 h-5" />,
  Cross: <Cross className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Baby: <Baby className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

// Ratings to simulate Urban Company verified service metrics
const categoryMeta: Record<string, { rating: string; reviews: string; startingPrice: string }> = {
  'elderly-caregiver': { rating: '4.89', reviews: '3,840', startingPrice: '₹12,000/mo' },
  'fitness-trainer': { rating: '4.92', reviews: '5,120', startingPrice: '₹800/session' },
  'home-cook-chef': { rating: '4.86', reviews: '7,450', startingPrice: '₹6,000/mo' },
  'home-nurse': { rating: '4.94', reviews: '2,980', startingPrice: '₹1,500/day' },
  'home-tutor': { rating: '4.91', reviews: '4,610', startingPrice: '₹500/hr' },
  'nanny-baby-care': { rating: '4.88', reviews: '6,230', startingPrice: '₹14,000/mo' },
  'physiotherapist': { rating: '4.95', reviews: '4,890', startingPrice: '₹900/visit' },
  'yoga-instructor': { rating: '4.90', reviews: '3,410', startingPrice: '₹700/session' },
};

export const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        {/* Section Header (Urban Company Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-200 px-3 py-1 rounded-full">
              Explore Our 8 Service Domains
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              Verified Personal & Home Services
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              Select a category to post your requirement and compare verified quotes from background-checked professionals.
            </p>
          </div>

          <button
            onClick={() => navigate('/post-requirement')}
            className="mt-4 md:mt-0 text-xs font-bold text-black hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>View All 48 Subcategories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : (
          /* High Quality Urban Company Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const meta = categoryMeta[cat.slug] || { rating: '4.9', reviews: '2,500', startingPrice: '₹500' };

              return (
                <div
                  key={cat.id}
                  className="group relative bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-xl hover:border-black transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Icon & Rating Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 text-black flex items-center justify-center font-bold group-hover:bg-black group-hover:text-white transition-colors">
                        {iconMap[cat.icon] || <Sparkles className="w-6 h-6" />}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-black bg-neutral-100 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{meta.rating}</span>
                        <span className="text-neutral-400 font-normal">({meta.reviews})</span>
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="text-lg font-black text-black group-hover:text-neutral-900 transition-colors">
                      {cat.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Subcategories Chip List */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cat.subcategories?.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {cat.subcategories && cat.subcategories.length > 3 && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                          +{cat.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Starting Price & Direct Action */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">Typical Cost</span>
                      <span className="text-xs font-black text-black">{meta.startingPrice}</span>
                    </div>

                    <button
                      onClick={() => navigate('/post-requirement')}
                      className="inline-flex items-center gap-1.5 bg-black group-hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                    >
                      <span>Get Quotes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Vaziro Banner (Urban Company style proof) */}
        <div className="mt-16 bg-black rounded-3xl p-8 sm:p-10 text-white border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-white mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-base font-black text-white">DigiLocker Government Verified</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every service professional undergoes biometric and government identity validation via DigiLocker before quoting on customer jobs.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-white mb-3">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-base font-black text-white">Reverse Auction Best Rates</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                State your budget and receive competing transparent proposals. Compare side-by-side on credentials, experience, and pricing.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-white mb-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-base font-black text-white">6% Protected Escrow</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your payment is safely held until service delivery is completed and approved by you. Zero surprise charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
