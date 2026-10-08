import React from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Quote,
  Sparkles,
} from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Finding a trustworthy caregiver for my 82-year-old mother was so stressful through local agencies. On Vaziro, Sunita was DigiLocker verified, and with the milestone escrow, I felt completely secure. She has been caring for my mom for 4 months now!',
    author: 'Meenakshi Iyer',
    role: 'Hired Elderly Caregiver',
    location: 'Greater Kailash 2, South Delhi',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    service: 'Senior Companion & Elderly Care',
  },
  {
    quote:
      'After my ACL knee surgery, Dr. Rajesh provided daily home physiotherapy. His exercises brought back my mobility within 3 weeks. Having verified qualifications and zero agency commission made all the difference.',
    author: 'Aditya Mathur',
    role: 'Hired Physiotherapist',
    location: 'DLF Phase 5, Gurugram',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    service: 'Post-Surgical Ortho Physiotherapy',
  },
  {
    quote:
      'We needed a certified home nurse for post-hospitalization ICU care for my father. Sister Anita was punctual, extremely skilled with injections and vitals, and we released payments only after each week’s milestone.',
    author: 'Rohit Kulkarni',
    role: 'Hired Home Nurse',
    location: 'Sector 50, Noida',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    service: 'Clinical Nursing & Vitals Care',
  },
];

export const HomeTestimonials: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#108a00]" />
            <span>Verified Customer Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Trusted by families across Delhi NCR.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            Real feedback from clients who found independent, verified professionals through Vaziro’s milestone-protected workflow.
          </p>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="bg-[#fcfbf8] hover:bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-300 p-6 sm:p-7 transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Star Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-neutral-300" />
                </div>

                {/* Service Tag */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 mb-3">
                  {t.service}
                </span>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Row */}
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neutral-900 truncate flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <span title="Verified Client">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{t.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
