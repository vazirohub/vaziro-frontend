import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const iconMap: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="w-6 h-6" />,
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  ChefHat: <ChefHat className="w-6 h-6" />,
  Cross: <Cross className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Baby: <Baby className="w-6 h-6" />,
  Activity: <Activity className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
};

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openAuthModal } = useAuth();

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
    <section id="categories" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Popular Professional Categories
          </h2>
          <p className="mt-3 text-slate-600 font-medium">
            Post your custom requirement across 8 verified service categories with 48 specialized disciplines.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {iconMap[cat.icon] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Reverse Auction</span>
                  <button
                    onClick={() => openAuthModal('CUSTOMER')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>Get Quotes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
