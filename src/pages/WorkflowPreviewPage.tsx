import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

type Audience = 'CUSTOMER' | 'PROFESSIONAL';

interface PreviewStep {
  title: string;
  summary: string;
  destination: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

const workflows: Record<Audience, { title: string; intro: string; steps: PreviewStep[] }> = {
  CUSTOMER: {
    title: 'Find the right help, with every step in view.',
    intro: 'Post what you need, compare offers, choose a professional, then follow the service and protected payment from your dashboard.',
    steps: [
      {
        title: 'Describe your service request',
        summary: 'Choose a service, add the details and location, then set your budget and schedule. Your draft is saved as you go.',
        destination: '/post-requirement',
        action: 'Start a request',
        icon: ClipboardList,
      },
      {
        title: 'Review and compare proposals',
        summary: 'See incoming prices, timing, professional experience, verification and proposal details together.',
        destination: '/dashboard',
        action: 'Open your dashboard',
        icon: Search,
      },
      {
        title: 'Choose a professional',
        summary: 'Shortlist the right fit and hire from the request details. Payment protection is available during hiring.',
        destination: '/dashboard',
        action: 'View your requests',
        icon: UserRoundCheck,
      },
      {
        title: 'Track work and protected payment',
        summary: 'Follow service stages, message your professional, inspect completed work and manage payment release from the job tracker.',
        destination: '/dashboard',
        action: 'View jobs and tracking',
        icon: ShieldCheck,
      },
    ],
  },
  PROFESSIONAL: {
    title: 'Turn your skills into trusted work.',
    intro: 'Build a complete profile, explore customer requests, send a clear proposal, then manage accepted work through completion.',
    steps: [
      {
        title: 'Set up and verify your profile',
        summary: 'Add your service information and credentials. Identity verification helps customers understand who they are hiring.',
        destination: '/profile',
        action: 'Complete your profile',
        icon: UserRoundCheck,
      },
      {
        title: 'Find a suitable customer request',
        summary: 'Browse open requirements by service and location, and review scope, budget and application credit cost.',
        destination: '/requirements',
        action: 'Browse customer requests',
        icon: Search,
      },
      {
        title: 'Send a considered proposal',
        summary: 'Share your price, availability, timing and approach. The credit cost is shown before you submit.',
        destination: '/requirements',
        action: 'Find a request to quote',
        icon: MessageSquareText,
      },
      {
        title: 'Deliver work and follow payment',
        summary: 'When hired, update the customer at each work stage. If escrow is enabled, only the customer confirms completion and releases payment.',
        destination: '/dashboard',
        action: 'Open your jobs',
        icon: CircleDollarSign,
      },
    ],
  },
};

export const WorkflowPreviewPage: React.FC = () => {
  const [audience, setAudience] = useState<Audience>('CUSTOMER');
  const workflow = workflows[audience];

  return (
    <div className="min-h-full bg-[#f3f5f2] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-emerald-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Vaziro
        </Link>

        <header className="relative isolate overflow-hidden rounded-[2rem] bg-[#10241e] px-6 py-8 text-white shadow-[0_24px_70px_-42px_rgba(16,36,30,0.8)] sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-14 -top-24 -z-10 h-80 w-80 rounded-full border-[42px] border-emerald-300/[0.07]" />
          <div className="pointer-events-none absolute bottom-[-7rem] right-1/4 -z-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              A better way to book local care
            </p>
            <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl">Good work starts with a clear next step.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/75 sm:text-base sm:leading-7">See how customers and independent professionals meet, agree on work, and move through each service milestone on Vaziro.</p>
          </div>
        </header>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-800">Choose your path</p>
            <p className="mt-1 text-sm text-neutral-600">Each step connects to the live app.</p>
          </div>
          <div className="inline-flex w-full max-w-md rounded-2xl border border-[#dce6df] bg-white p-1.5 shadow-sm" role="group" aria-label="Choose a workflow">
          {(['CUSTOMER', 'PROFESSIONAL'] as Audience[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAudience(role)}
              aria-pressed={audience === role}
              className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${audience === role ? 'bg-[#10241e] text-white shadow-sm' : 'text-neutral-600 hover:bg-[#eef4ef] hover:text-neutral-950'}`}
            >
              {role === 'CUSTOMER' ? 'I need a service' : 'I provide a service'}
            </button>
          ))}
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#dce6df] bg-white shadow-[0_18px_50px_-36px_rgba(16,36,30,0.55)]" aria-live="polite">
          <div className="flex flex-col gap-3 border-b border-[#e8eee9] bg-[#edf4ef] px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">{audience === 'CUSTOMER' ? 'For customers' : 'For professionals'}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#10241e] sm:text-2xl">{workflow.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52665d]">{workflow.intro}</p>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-[#d5e1d8] bg-white/80 px-3 text-xs font-bold text-[#385448] sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {workflow.steps.length} simple steps
            </span>
          </div>

          <ol className="divide-y divide-[#edf1ee]">
            {workflow.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative px-5 py-5 transition-colors hover:bg-[#fbfcfa] sm:px-8 sm:py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10241e] text-emerald-200 shadow-[0_8px_18px_-12px_rgba(16,36,30,0.7)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-300 text-[9px] font-black text-[#10241e]">{index + 1}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step {index + 1}</p>
                        <h3 className="mt-1 text-base font-extrabold text-neutral-950">{step.title}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">{step.summary}</p>
                      </div>
                    </div>
                    <Link to={step.destination} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10241e] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:ml-16">
                      {step.action}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="absolute bottom-0 left-[2.9rem] hidden translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1 text-neutral-400 sm:block" aria-hidden="true">
                      <ArrowDown className="h-3 w-3" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <p className="mt-4 text-sm leading-6 text-neutral-500">
          Some screens require sign-in or an existing request/job. Start with the first step to create your own live workflow.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to={audience === 'CUSTOMER' ? '/post-requirement' : '/signup'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            {audience === 'CUSTOMER' ? 'Start a service request' : 'Join as a professional'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={audience === 'CUSTOMER' ? '/#categories' : '/dashboard'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            {audience === 'CUSTOMER' ? 'Browse service categories' : 'Open professional dashboard'}
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
