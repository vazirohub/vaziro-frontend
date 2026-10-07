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
    <div className="min-h-full bg-[#f6f7f5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Vaziro
        </Link>

        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Vaziro, step by step
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-950 sm:text-5xl">A clear path from first step to finished service.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">Explore the customer and professional journeys. Every step below links to its corresponding screen in the app.</p>
        </header>

        <div className="mt-8 inline-flex w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm" role="group" aria-label="Choose a workflow">
          {(['CUSTOMER', 'PROFESSIONAL'] as Audience[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAudience(role)}
              aria-pressed={audience === role}
              className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${audience === role ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'}`}
            >
              {role === 'CUSTOMER' ? 'I need a service' : 'I provide a service'}
            </button>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm" aria-live="polite">
          <div className="border-b border-neutral-100 px-5 py-6 sm:px-8 sm:py-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{audience === 'CUSTOMER' ? 'Customer workflow' : 'Professional workflow'}</p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-neutral-950 sm:text-2xl">{workflow.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{workflow.intro}</p>
          </div>

          <ol className="divide-y divide-neutral-100">
            {workflow.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative px-5 py-5 sm:px-8 sm:py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step {index + 1}</p>
                        <h3 className="mt-1 text-base font-extrabold text-neutral-950">{step.title}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">{step.summary}</p>
                      </div>
                    </div>
                    <Link to={step.destination} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:ml-16">
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

        <p className="mt-4 text-sm text-neutral-500">
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
