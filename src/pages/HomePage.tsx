import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  MessagesSquare,
  UserRoundCheck,
  Route,
  Search,
  BadgeCheck,
  WalletCards,
  BriefcaseBusiness,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import { FeaturedProfessionals } from '../components/FeaturedProfessionals';
import { WhyChooseVaziro } from '../components/WhyChooseVaziro';
import { HomeTestimonials } from '../components/HomeTestimonials';
import { HomeFaq } from '../components/HomeFaq';
import { SEOHead } from '../components/SEOHead';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [workflowRole, setWorkflowRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');

  // Structured Schema for Home Page (WebSite + Organization + FAQ + LocalService)
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://vaziro.com/#website',
        'url': 'https://vaziro.com/',
        'name': 'Vaziro',
        'description': 'India’s premier marketplace for verified personal care, nurses, tutors, and home professionals.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://vaziro.com/professionals?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://vaziro.com/#organization',
        'name': 'Vaziro',
        'url': 'https://vaziro.com/',
        'logo': 'https://vaziro.com/logo.png',
        'sameAs': [
          'https://www.linkedin.com/company/vaziro',
          'https://twitter.com/vazirohub',
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': 'https://vaziro.com/#localbusiness',
        'name': 'Vaziro Verified Home Services',
        'url': 'https://vaziro.com/',
        'image': 'https://vaziro.com/logo.png',
        'priceRange': '₹₹',
        'areaServed': [
          'Delhi',
          'Noida',
          'Gurugram',
          'Ghaziabad',
          'Greater Noida',
        ],
      },
    ],
  };

  return (
    <div className="bg-[#fcfbf8] text-[#1e2824]">
      {/* 1. Dynamic SEO & AEO Head Directives */}
      <SEOHead
        title="Vaziro™ — Verified Home Care, Nurses, Physio, Tutors & Cooks in Delhi NCR"
        description="Hire pre-verified independent home caregivers, nurses, physiotherapists, home tutors, and cooks in Delhi, Noida, Gurugram. 100% Escrow milestone protection and DigiLocker ID checks."
        keywords="home care Delhi, elderly caregiver Noida, home nurse Gurugram, physiotherapist at home Delhi NCR, home tutor Delhi, home cook, fitness trainer, yoga instructor, verified professionals India, Vaziro"
        canonical="https://vaziro.com/"
        schema={homeSchema}
      />

      {/* 2. Hero Section (Video Banner, Editorial Typography, City Selector) */}
      <Hero />

      {/* 3. Trust & Escrow Guarantee Badges with Live Stats */}
      <TrustBadges />

      {/* 4. Category Grid (8 Photography Cards with Active Counters & Rate Hints) */}
      <CategoryGrid />

      {/* 5. Featured Verified Professionals Showcase in Delhi NCR */}
      <FeaturedProfessionals />

      {/* 6. Why Choose Vaziro vs Unorganized Placement Agencies (Comparison Table) */}
      <WhyChooseVaziro />

      {/* 7. HOW IT WORKS: The Vaziro Service Journey */}
      <section id="how-it-works" className="relative overflow-hidden border-b border-[#dce6df] bg-[#f0f5f0] py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full border-[42px] border-emerald-900/[0.035]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                <Route className="h-3.5 w-3.5 text-[#108a00]" />
                <span>The Vaziro Milestone Journey</span>
              </span>
              <h2 className="mt-3.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-[#10241e]">
                {workflowRole === 'CUSTOMER' ? 'From first request to inspected finish.' : 'From your verified profile to paid work.'}
              </h2>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#52665d] sm:text-base">
                {workflowRole === 'CUSTOMER'
                  ? 'Post your need for free, compare transparent quotations from verified independent professionals, and release payments only after satisfaction.'
                  : 'Build your DigiLocker verified profile, browse real client requests across Delhi NCR, submit direct quotes, and get paid with zero commissions.'}
              </p>
            </div>

            {/* Switcher & Guide Link */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-xl border border-[#cad9ce] bg-white p-1" role="group" aria-label="Choose a marketplace workflow">
                <button
                  type="button"
                  onClick={() => setWorkflowRole('CUSTOMER')}
                  aria-pressed={workflowRole === 'CUSTOMER'}
                  className={`min-h-10 rounded-lg px-4 text-xs font-extrabold transition cursor-pointer ${
                    workflowRole === 'CUSTOMER' ? 'bg-[#10241e] text-white shadow-xs' : 'text-[#52665d] hover:bg-[#f0f5f0]'
                  }`}
                >
                  I'm hiring help
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowRole('PROFESSIONAL')}
                  aria-pressed={workflowRole === 'PROFESSIONAL'}
                  className={`min-h-10 rounded-lg px-4 text-xs font-extrabold transition cursor-pointer ${
                    workflowRole === 'PROFESSIONAL' ? 'bg-[#10241e] text-white shadow-xs' : 'text-[#52665d] hover:bg-[#f0f5f0]'
                  }`}
                >
                  I'm a professional
                </button>
              </div>

              <Link
                to="/workflow-preview"
                className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-[#cad9ce] bg-white px-4 text-xs sm:text-sm font-bold text-[#29463a] transition hover:border-emerald-700 hover:text-emerald-900 shadow-2xs"
              >
                <span>Full Guide</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 3 Step Cards */}
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-[#cbd9ce] md:block" />
            
            {(workflowRole === 'CUSTOMER'
              ? [
                  {
                    title: '1. Tell us what you need',
                    body: 'Share a few details: category, service schedule, location in Delhi NCR, and budget. Posting a request is 100% free with no obligation.',
                    action: 'Post a request for free',
                    href: '/post-requirement',
                    icon: ClipboardList,
                  },
                  {
                    title: '2. Compare verified quotations',
                    body: 'Receive direct proposals from relevant independent professionals. Review their DigiLocker verification, past ratings, and rates.',
                    action: 'Browse professionals directory',
                    href: '/professionals',
                    icon: MessagesSquare,
                  },
                  {
                    title: '3. Hire with 100% Escrow Protection',
                    body: 'Fund the milestone safely in escrow. Discuss details directly, and release the payment only after you confirm satisfactory service.',
                    action: 'Learn about escrow protection',
                    href: '/workflow-preview',
                    icon: UserRoundCheck,
                  },
                ]
              : [
                  {
                    title: '1. Build your verified profile',
                    body: 'Showcase your skills, service radius in Delhi NCR, and credentials. Complete DigiLocker verification to earn the top trust badge.',
                    action: 'Complete professional profile',
                    href: '/profile',
                    icon: UserRoundCheck,
                  },
                  {
                    title: '2. Pick requests that suit you',
                    body: 'Browse client service requests across Delhi, Noida, and Gurugram. Filter by your specialty, budget, and daily or monthly schedules.',
                    action: 'Find client jobs',
                    href: '/requirements',
                    icon: Search,
                  },
                  {
                    title: '3. Quote directly & keep 100%',
                    body: 'Send custom quotations with your price and terms. Manage delivery, complete milestones, and receive payouts with zero commissions.',
                    action: 'Browse active requests',
                    href: '/requirements',
                    icon: MessagesSquare,
                  },
                ]
            ).map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="group relative rounded-2xl border border-[#e7e8df] bg-[#fffefa] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c5d5a8] hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9efdd] text-[#668044]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#d5edaf] text-[10px] font-black text-[#344e2d]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base sm:text-lg font-bold tracking-tight text-[#303b32]">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#737c73]">
                      {step.body}
                    </p>
                  </div>

                  <Link
                    to={step.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#506e40] transition hover:text-[#355e3e]"
                  >
                    <span>{step.action}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Verified Delhi NCR Client Testimonials */}
      <HomeTestimonials />

      {/* 9. AEO-Optimized FAQ Section */}
      <HomeFaq />

      {/* 10. High-Conversion Final CTA Banner */}
      <section className="bg-gradient-to-br from-[#123128] to-[#183e33] px-4 py-14 text-white sm:px-6 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#c9f27d] backdrop-blur-xs">
            <BadgeCheck className="h-4 w-4" />
            <span>Ready to get started?</span>
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            The right care. The right help.<br />
            <span className="text-[#c9f27d]">100% Escrow Protected.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#c0d0c2]">
            Connect with pre-verified independent caregivers, nurses, physiotherapists, tutors, and cooks across Delhi NCR today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
            <Link
              to="/post-requirement"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#108a00] hover:bg-[#14a800] px-7 text-sm font-bold text-white transition shadow-lg hover:shadow-emerald-900/40 cursor-pointer"
            >
              <span>Post a Requirement (Free)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/professionals"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 px-7 text-sm font-bold text-white transition cursor-pointer backdrop-blur-xs"
            >
              <UserRoundCheck className="h-4 w-4" />
              <span>Browse All Professionals</span>
            </Link>

            {!openAuthModal ? null : (
              <button
                type="button"
                onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c9f27d]/40 bg-emerald-950/40 hover:bg-emerald-900/60 px-6 text-sm font-bold text-[#c9f27d] transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#c9f27d]" />
                <span>Join as a Pro (+10 Free Credits)</span>
              </button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#c9f27d]" />
              <span>DigiLocker Identity Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#c9f27d]" />
              <span>Escrow Milestone Holding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#c9f27d]" />
              <span>Zero Placement Commission</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
