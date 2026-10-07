import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import {
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  ClipboardList,
  MessagesSquare,
  UserRoundCheck,
  Route,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [workflowRole, setWorkflowRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');

  // Strictly Delhi NCR customer reviews with authentic Indian avatars
  const ncrCustomerReviews = [
    {
      name: 'Pooja Aggarwal',
      city: 'Greater Kailash, South Delhi',
      service: 'Elderly Caregiver',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      comment:
        'Finding a reliable, police-verified caregiver for my elderly mother in South Delhi was effortless on Vaziro. Received 4 quotes within 2 hours. DigiLocker KYC gave our family 100% peace of mind.',
    },
    {
      name: 'Rajat & Megha Bansal',
      city: 'Sector 50, Noida',
      service: 'Home Cook / Chef',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      comment:
        'Vaziro saved us 35% compared to local Noida agencies. We set our budget at ₹6,500/month for vegetarian cooking and hired Chef Manoj. Completely commission-free!',
    },
    {
      name: 'Siddharth Rao',
      city: 'Golf Course Road, Gurugram',
      service: 'Physiotherapist',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      comment:
        'Post-ACL reconstruction rehab at home in Gurugram. Dr. Neeraj was exceptionally skilled and punctual. Vaziro’s 6% escrow held my funds safely until each weekly session was completed.',
    },
  ];

  // Strictly Indian service professionals across Delhi NCR
  const featuredNcrPartners = [
    {
      name: 'Dr. Neeraj Sharma, BPT',
      role: 'Senior Clinical Physiotherapist',
      exp: '9 Years Exp',
      location: 'South Delhi & Gurugram',
      rating: '4.98',
      jobs: '480+ Sessions',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
      quote: 'Vaziro eliminated extortionate agency cuts in NCR. I keep 100% of my consultation fees and pay small credits only when applying for home visits.',
    },
    {
      name: 'Smt. Sunita Devi',
      role: 'Newborn Care Specialist & Japa',
      exp: '12 Years Exp',
      location: 'Noida & Greater Noida',
      rating: '4.96',
      jobs: '340+ Families',
      photo: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
      quote: 'DigiLocker verification instantly built trust with young working couples across Noida and Greater Noida. My bookings are filled months in advance.',
    },
    {
      name: 'Harpreet Singh',
      role: 'Certified Strength & Rehab Coach',
      exp: '8 Years Exp',
      location: 'Delhi & Ghaziabad',
      rating: '4.95',
      jobs: '510+ Clients',
      photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
      quote: 'In-app chat and privacy-masked calls allow me to coordinate home training schedules easily without sharing personal phone numbers.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section with Live Indian Photography & Delhi NCR City Selector */}
      <Hero />

      {/* Trust & Guarantee Badges */}
      <TrustBadges />

      {/* 8-Category Grid with Real Indian Photography Cards */}
      <CategoryGrid />

      {/* HOW IT WORKS: a complete service journey */}
      <section id="how-it-works" className="relative overflow-hidden border-b border-[#dce6df] bg-[#f0f5f0] py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full border-[42px] border-emerald-900/[0.035]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.13em] text-emerald-900">
                <Route className="h-3.5 w-3.5" /> The Vaziro service journey
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#10241e] sm:text-4xl">
                {workflowRole === 'CUSTOMER' ? 'From first request to finished work.' : 'From your profile to paid work.'}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#52665d] sm:text-base">
                {workflowRole === 'CUSTOMER'
                  ? 'Post a service need, compare independent pros, choose your fit, and stay in control through completion.'
                  : 'Build a trusted profile, find service work, send a clear proposal, and manage delivery from one place.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-xl border border-[#cad9ce] bg-white p-1" role="group" aria-label="Choose a marketplace workflow">
                <button type="button" onClick={() => setWorkflowRole('CUSTOMER')} aria-pressed={workflowRole === 'CUSTOMER'} className={`min-h-10 rounded-lg px-3 text-xs font-extrabold transition ${workflowRole === 'CUSTOMER' ? 'bg-[#10241e] text-white' : 'text-[#52665d] hover:bg-[#f0f5f0]'}`}>I&apos;m hiring</button>
                <button type="button" onClick={() => setWorkflowRole('PROFESSIONAL')} aria-pressed={workflowRole === 'PROFESSIONAL'} className={`min-h-10 rounded-lg px-3 text-xs font-extrabold transition ${workflowRole === 'PROFESSIONAL' ? 'bg-[#10241e] text-white' : 'text-[#52665d] hover:bg-[#f0f5f0]'}`}>I&apos;m finding work</button>
              </div>
              <Link to="/workflow-preview" className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-[#cad9ce] bg-white px-4 text-sm font-bold text-[#29463a] transition hover:border-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:self-auto">
                Full workflow <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden h-px bg-[#cbd9ce] xl:block" />
            {(workflowRole === 'CUSTOMER' ? [
              {
                title: 'Tell us what you need',
                body: 'Describe the service, preferred timing and Delhi NCR location. Set a budget that works for you.',
                action: 'Post a request',
                href: '/post-requirement',
                icon: ClipboardList,
              },
              {
                title: 'Compare real proposals',
                body: 'Review the professional, their verification, approach, quote and estimated timeline in one place.',
                action: 'Go to dashboard',
                href: '/dashboard',
                icon: MessagesSquare,
              },
              {
                title: 'Choose who to hire',
                body: 'Shortlist the right fit. Add optional payment protection when you create the service contract.',
                action: 'Review your requests',
                href: '/dashboard',
                icon: UserRoundCheck,
              },
              {
                title: 'Track work to completion',
                body: 'Follow service updates, inspect finished work and control protected payment release.',
                action: 'Track your service',
                href: '/dashboard',
                icon: ShieldCheck,
              },
            ] : [
              {
                title: 'Build your professional profile',
                body: 'Show customers your services, experience and credentials. A verified profile helps customers evaluate your proposal.',
                action: 'Edit your profile',
                href: '/profile',
                icon: UserRoundCheck,
              },
              {
                title: 'Find work that fits',
                body: 'Browse customer requests by service, review scope and budget, and choose opportunities that match your schedule.',
                action: 'Find work',
                href: '/requirements',
                icon: Search,
              },
              {
                title: 'Send a clear proposal',
                body: 'Set a price and timeline, explain your approach, and see the credit cost before you submit.',
                action: 'Browse requests',
                href: '/requirements',
                icon: MessagesSquare,
              },
              {
                title: 'Deliver and track the work',
                body: 'Keep customers updated at each stage. With payment protection, customers approve completion and release escrow.',
                action: 'View your dashboard',
                href: '/dashboard',
                icon: ShieldCheck,
              },
            ]).map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="group relative rounded-[1.5rem] border border-[#dce6df] bg-white p-5 shadow-[0_16px_40px_-34px_rgba(16,36,30,0.6)] transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_46px_-34px_rgba(16,36,30,0.55)] sm:p-6">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10241e] text-emerald-200 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-300 text-[10px] font-black text-[#10241e]">{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold tracking-tight text-[#10241e]">{step.title}</h3>
                  <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[#617168]">{step.body}</p>
                  <Link to={step.href} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-extrabold text-emerald-800 transition hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
                    {step.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEET OUR VERIFIED SERVICE PARTNERS (Indian Professionals Showcase) */}
      <section className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-black bg-neutral-200 px-3 py-1 rounded-full">
              Delhi NCR Certified Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              Meet Top-Rated Vaziro Professionals
            </h2>
            <p className="mt-2 text-sm text-neutral-600 font-medium">
              Every professional on Vaziro is background-checked with biometric DigiLocker verification, credential audit, and verified customer reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredNcrPartners.map((partner, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={partner.photo}
                    alt={partner.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
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

      {/* REAL CUSTOMER STORIES (Delhi NCR Social Proof) */}
      <section className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Trusted Across Delhi NCR
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-3">
              Real Experiences from NCR Households
            </h2>
            <p className="mt-2 text-sm text-neutral-600 font-medium">
              Read honest feedback from families in Delhi, Noida, Gurugram, Ghaziabad & Greater Noida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ncrCustomerReviews.map((rev, i) => (
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
              The Vaziro NCR Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Why Delhi NCR Chooses Vaziro
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
                Verified NCR Marketplace
              </div>
              <h4 className="text-base font-bold text-white mb-4 uppercase tracking-wider">Vaziro Verified Marketplace</h4>
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
            Are You a Certified Professional in Delhi NCR? Join India’s Best Network.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto">
            Get more clients across Delhi, Noida, Gurugram, Ghaziabad & Greater Noida. Keep 100% of your earnings.
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
