import React from 'react';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star,
  Quote,
  Sparkles,
  TrendingUp,
  Award,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();

  const customerReviews = [
    {
      name: 'Priya Narayanan',
      city: 'Indiranagar, Bengaluru',
      service: 'Elderly Caregiver',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      comment:
        'Finding a trusted, police-verified caregiver for my 78-year-old mother used to take weeks through greedy brokers. On Vaziro, I posted my requirement and got 4 verified quotes within 3 hours. The DigiLocker KYC gave our family absolute peace of mind.',
    },
    {
      name: 'Aditya & Neha Deshmukh',
      city: 'Powai, Mumbai',
      service: 'Home Cook / Chef',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      comment:
        'The reverse auction format is brilliant. We set our monthly budget at ₹7,500 for South Indian & Jain cooking. We compared menus, previous customer ratings, and hired Chef Ramesh. Zero middleman commission!',
    },
    {
      name: 'Dr. Kavita Kulkarni',
      city: 'Kalyani Nagar, Pune',
      service: 'Physiotherapist',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      comment:
        'Post-knee surgery rehab required a licensed BPT specialist. Dr. Arvind was punctual, deeply knowledgeable, and having the payment held in Vaziro Escrow until completion made the whole process stress-free.',
    },
  ];

  const featuredPartners = [
    {
      name: 'Dr. Arvind Mehta, BPT',
      role: 'Clinical Physiotherapist',
      exp: '9 Years Exp',
      location: 'HSR Layout, Bengaluru',
      rating: '4.98',
      jobs: '420+ Sessions',
      photo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      quote: 'Vaziro eliminated agency cuts. I keep 100% of my consultation fees and only pay nominal credits to apply for relevant home visits.',
    },
    {
      name: 'Smt. Rajeshwariamma',
      role: 'Newborn Care & Nanny',
      exp: '11 Years Exp',
      location: 'Bandra West, Mumbai',
      rating: '4.96',
      jobs: '310+ Families',
      photo: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
      quote: 'Government DigiLocker verification immediately established trust with high-profile families. My monthly earnings have doubled.',
    },
    {
      name: 'Vikramjit Singh',
      role: 'Elite Personal Fitness Coach',
      exp: '7 Years Exp',
      location: 'Gurugram, Delhi NCR',
      rating: '4.94',
      jobs: '560+ Clients',
      photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
      quote: 'Direct chat and privacy-masked calls allow me to understand client fitness goals and give accurate package proposals quickly.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section with Live Real Photography & Floating Metrics */}
      <Hero />

      {/* Trust & Guarantee Badges */}
      <TrustBadges />

      {/* 8-Category Grid with Real Photography Cards */}
      <CategoryGrid />

      {/* HOW IT WORKS: 3-Step Seamless Reverse Auction Process */}
      <section id="how-it-works" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Transparent Marketplace Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              How the Vaziro Reverse Auction Works
            </h2>
            <p className="mt-3 text-sm text-neutral-600 font-medium">
              You name your requirements and budget. Verified independent professionals compete transparently to win your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                01
              </div>
              <h3 className="text-xl font-black text-black mb-2">Post Your Requirement</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Describe your service needs, specify your city/pincode, and define your fixed price or flexible budget range in ₹ INR.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                02
              </div>
              <h3 className="text-xl font-black text-black mb-2">Compare Verified Quotes</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Background-checked pros spend platform credits to submit detailed proposals. Compare their AI compatibility match, experience, and pricing.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-neutral-50 border border-neutral-200 hover:border-black transition">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg mb-6 shadow-md">
                03
              </div>
              <h3 className="text-xl font-black text-black mb-2">Hire with 100% Escrow</h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Funds are held in secure Vaziro Escrow. Inspect discrete service milestones, approve completed work, and release funds safely with official GST invoices.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => openAuthModal('CUSTOMER')}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md transition"
            >
              <span>Post a Requirement Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MEET OUR VERIFIED SERVICE PARTNERS (Real Professionals Showcase) */}
      <section className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-black bg-neutral-200 px-3 py-1 rounded-full">
              Certified Service Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              Meet Top-Rated Vaziro Professionals
            </h2>
            <p className="mt-2 text-sm text-neutral-600 font-medium">
              Every professional on Vaziro is background-checked with biometric DigiLocker verification, credential audit, and verified customer reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPartners.map((partner, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={partner.photo}
                    alt={partner.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-black text-black shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{partner.rating}</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="text-lg font-black">{partner.name}</div>
                    <div className="text-xs text-neutral-300">{partner.role} • {partner.exp}</div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold border-b border-neutral-100 pb-3">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      DigiLocker Verified
                    </span>
                    <span>{partner.location}</span>
                  </div>

                  <p className="text-xs text-neutral-600 italic leading-relaxed">
                    "{partner.quote}"
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-black text-black bg-neutral-100 px-2.5 py-1 rounded-lg">
                      {partner.jobs}
                    </span>
                    <button
                      onClick={() => openAuthModal('CUSTOMER')}
                      className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                    >
                      <span>Request Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REAL CUSTOMER STORIES (Authentic Social Proof) */}
      <section className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Trusted by 15,000+ Indian Households
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              Real Experiences, Verified Outcomes
            </h2>
            <p className="mt-2 text-sm text-neutral-600 font-medium">
              Read honest feedback from customers who hired through Vaziro's reverse auction platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customerReviews.map((rev, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between hover:border-black transition"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center gap-3.5">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-black text-black">{rev.name}</div>
                    <div className="text-[11px] text-neutral-500">{rev.city}</div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                      ✓ Hired {rev.service}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URBAN COMPANY COMPARISON BANNER */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400 bg-neutral-800 px-3 py-1 rounded-full">
              The Vaziro Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Why Indian Families Choose Vaziro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Agencies */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800">
              <h4 className="text-base font-bold text-neutral-400 mb-4 uppercase tracking-wider">Traditional Offline Agencies</h4>
              <ul className="space-y-3.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2.5 text-red-400 font-medium">
                  <span className="font-bold">✕</span>
                  <span>Heavy 15% to 30% cut taken from worker wages</span>
                </li>
                <li className="flex items-center gap-2.5 text-red-400 font-medium">
                  <span className="font-bold">✕</span>
                  <span>Unverified documents and fake experience claims</span>
                </li>
                <li className="flex items-center gap-2.5 text-red-400 font-medium">
                  <span className="font-bold">✕</span>
                  <span>Arbitrary fixed pricing with opaque broker fees</span>
                </li>
                <li className="flex items-center gap-2.5 text-red-400 font-medium">
                  <span className="font-bold">✕</span>
                  <span>No payment protection — 100% advance demanded upfront</span>
                </li>
              </ul>
            </div>

            {/* Vaziro Platform */}
            <div className="p-8 rounded-3xl bg-neutral-900 border-2 border-white shadow-2xl relative">
              <div className="absolute -top-3.5 right-6 text-[10px] font-black uppercase tracking-wider bg-white text-black px-3 py-1 rounded-full shadow-lg">
                Verified Marketplace
              </div>
              <h4 className="text-base font-bold text-white mb-4 uppercase tracking-wider">Vaziro Reverse Auction</h4>
              <ul className="space-y-3.5 text-xs text-neutral-200">
                <li className="flex items-center gap-2.5 text-emerald-400 font-bold">
                  <span>✓</span>
                  <span>0% commission on worker earnings (sustainable credit model)</span>
                </li>
                <li className="flex items-center gap-2.5 text-emerald-400 font-bold">
                  <span>✓</span>
                  <span>DigiLocker biometric Aadhaar & credential verification</span>
                </li>
                <li className="flex items-center gap-2.5 text-emerald-400 font-bold">
                  <span>✓</span>
                  <span>Transparent bidding matched to your stated budget</span>
                </li>
                <li className="flex items-center gap-2.5 text-emerald-400 font-bold">
                  <span>✓</span>
                  <span>100% Escrow milestone protection with official GST tax invoices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER CTA FOOTER CALLOUT */}
      <section className="py-16 bg-neutral-100 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black text-black">
            Are You a Certified Professional? Join India’s Best Network.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto">
            Get more clients without giving up a percentage of your hard-earned income. Keep 100% of your earnings.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('PROFESSIONAL')}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition"
            >
              <span>Register as Service Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
