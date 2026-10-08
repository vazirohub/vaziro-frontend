import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { TrustBadges } from '../components/TrustBadges';
import { CategoryGrid } from '../components/CategoryGrid';
import {
  ArrowRight,
  ClipboardList,
  MessagesSquare,
  UserRoundCheck,
  Route,
  Search,
  CircleHelp,
  ChevronDown,
  BadgeCheck,
  WalletCards,
  BriefcaseBusiness,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [workflowRole, setWorkflowRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');

  return (
    <div className="bg-[#fcfbf8]">
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

          <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-[#cbd9ce] md:block" />
            {(workflowRole === 'CUSTOMER' ? [
              {
                title: 'Tell us what you need',
                body: 'Share a few details, your location and budget. Posting a requirement is always free.',
                action: 'Post a request',
                href: '/post-requirement',
                icon: ClipboardList,
              },
              {
                title: 'Compare your options',
                body: 'Get quotations from relevant professionals. Review their experience, availability and approach.',
                action: 'Go to dashboard',
                href: '/dashboard',
                icon: MessagesSquare,
              },
              {
                title: 'Choose with confidence',
                body: 'Talk through the details and hire the person who feels right for you.',
                action: 'Explore professionals',
                href: '/professionals',
                icon: UserRoundCheck,
              },
            ] : [
              {
                title: 'Tell your story',
                body: 'Build a profile that shows families your services, experience and credentials.',
                action: 'Edit your profile',
                href: '/profile',
                icon: UserRoundCheck,
              },
              {
                title: 'Choose requests that fit',
                body: 'Browse customer requests, review scope and budget, and find opportunities that suit your services.',
                action: 'Find work',
                href: '/requirements',
                icon: Search,
              },
              {
                title: 'Share your quotation',
                body: 'Set a price, explain your approach and availability, and talk through the details with the customer.',
                action: 'Browse requests',
                href: '/requirements',
                icon: MessagesSquare,
              },
            ]).map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="group relative rounded-[9px] border border-[#e7e8df] bg-[#fffefa] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#c5d5a8] hover:shadow-[0_12px_25px_rgba(64,83,45,0.08)] sm:p-6">
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9efdd] text-[#668044]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#d5edaf] text-[10px] font-black text-[#344e2d]">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight text-[#303b32]">{step.title}</h3>
                  <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[#737c73]">{step.body}</p>
                  <Link to={step.href} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#506e40] transition hover:text-[#355e3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
                    {step.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7e8df] bg-white py-16 sm:py-20" aria-labelledby="marketplace-tools-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]">One marketplace, two perspectives</p>
            <h2 id="marketplace-tools-title" className="mt-3 text-3xl font-semibold tracking-tight text-[#24352b] sm:text-4xl">Clear choices for both sides.</h2>
            <p className="mt-3 text-sm leading-6 text-[#68716b]">Vaziro helps customers describe the work and helps professionals decide which requests to answer.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            <article className="rounded-xl border border-[#e3e8dc] bg-[#f7f8f3] p-5 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5ecd9] text-[#5e7b4c]"><UserRoundCheck className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-semibold text-[#29382e]">For customers</h3>
              <p className="mt-1 text-sm leading-6 text-[#68716b]">Get the details in one place before you decide who to hire.</p>
              <ul className="mt-4 space-y-3 text-sm text-[#465248]">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#668044]" />Set your service area, description, timing and budget.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#668044]" />Compare professional profiles and submitted quotations.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#668044]" />Shortlist, ask questions and hire when you are ready.</li>
              </ul>
              <Link to="/post-requirement" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#203c32] px-4 text-sm font-semibold text-white transition hover:bg-[#2d5144]">Post a request <ArrowRight className="h-4 w-4" /></Link>
            </article>

            <article className="rounded-xl border border-[#e3e8dc] bg-[#183e33] p-5 text-white sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#c9f27d]"><BriefcaseBusiness className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-semibold text-white">For professionals</h3>
              <p className="mt-1 text-sm leading-6 text-[#c0d0c2]">Choose the requests that suit your services and availability.</p>
              <ul className="mt-4 space-y-3 text-sm text-[#e2e9e1]">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9f27d]" />Build a profile with your experience and service details.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9f27d]" />Browse customer requests by category and location.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9f27d]" />Send a quotation with your price and proposed timeline.</li>
              </ul>
              <button type="button" onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#c9f27d] px-4 text-sm font-semibold text-[#203c32] transition hover:bg-[#d7f8a0]">Join as a professional <ArrowRight className="h-4 w-4" /></button>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f6f1] py-16 sm:py-20" aria-labelledby="home-faq-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]"><CircleHelp className="h-4 w-4" /> Helpful details</p>
            <h2 id="home-faq-title" className="mt-3 text-3xl font-semibold tracking-tight text-[#24352b] sm:text-4xl">A few things to know.</h2>
            <p className="mt-3 text-sm leading-6 text-[#68716b]">Understand how posting, verification and payment protection work before you get started.</p>
            <Link to="/workflow-preview" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#506e40] hover:text-[#355e3e]">See the full workflow <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="divide-y divide-[#e7e8df] border-y border-[#dce0d3]">
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#344137] marker:content-none">
                Is it free to post a service request?<ChevronDown className="h-4 w-4 shrink-0 text-[#718044] transition group-open:rotate-180" />
              </summary>
              <p className="pb-2 pr-8 text-sm leading-6 text-[#68716b]">Yes. You can describe your request and review responses without an obligation to hire.</p>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#344137] marker:content-none">
                Are all professionals verified?<ChevronDown className="h-4 w-4 shrink-0 text-[#718044] transition group-open:rotate-180" />
              </summary>
              <p className="pb-2 pr-8 text-sm leading-6 text-[#68716b]">Verification status is shown on profiles and proposals when available. Check each profile and discuss the work before hiring.</p>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#344137] marker:content-none">
                Do I have to use payment protection?<ChevronDown className="h-4 w-4 shrink-0 text-[#718044] transition group-open:rotate-180" />
              </summary>
              <p className="pb-2 pr-8 text-sm leading-6 text-[#68716b]">No. Payment protection is optional during hiring. If enabled, the current service fee is shown before you confirm.</p>
            </details>
            <details className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#344137] marker:content-none">
                Where is Vaziro currently available?<ChevronDown className="h-4 w-4 shrink-0 text-[#718044] transition group-open:rotate-180" />
              </summary>
              <p className="pb-2 pr-8 text-sm leading-6 text-[#68716b]">Vaziro currently serves Delhi, Noida, Gurugram, Ghaziabad and Greater Noida.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-[#183e33] px-4 py-12 text-center text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#c9f27d]"><BadgeCheck className="h-4 w-4" /> Start on your terms</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">A better fit starts with a clear conversation.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#c0d0c2]">Share what you need or find a request that matches the work you do.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/post-requirement" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#c9f27d] px-5 text-sm font-semibold text-[#203c32] transition hover:bg-[#d7f8a0]">Post a request <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/requirements" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"><WalletCards className="h-4 w-4" /> Browse requests</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
