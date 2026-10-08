import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  Search,
  UserRoundCheck,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

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
    title: 'Post once. Compare clearly.',
    intro: 'Share your budget and requirements once. Relevant professionals respond with transparent quotations, and you decide who to hire.',
    steps: [
      {
        title: 'Tell us what you need',
        summary: 'Share a few details, your location and budget. Posting a requirement is free.',
        destination: '/post-requirement',
        action: 'Start a request',
        icon: ClipboardList,
      },
      {
        title: 'Compare your options',
        summary: 'Review quotations from relevant professionals, including their experience, availability and approach.',
        destination: '/dashboard',
        action: 'Open your dashboard',
        icon: Search,
      },
      {
        title: 'Choose with confidence',
        summary: 'Talk through the details and hire the person who feels right for you.',
        destination: '/dashboard',
        action: 'View your requests',
        icon: UserRoundCheck,
      },
    ],
  },
  PROFESSIONAL: {
    title: 'Let the right people find you.',
    intro: 'Tell your story, choose requests that fit your services, and share quotations on your terms.',
    steps: [
      {
        title: 'Create your professional profile',
        summary: 'Introduce your services, experience and credentials. Help families understand the work you do.',
        destination: '/profile',
        action: 'Complete your profile',
        icon: UserRoundCheck,
      },
      {
        title: 'Choose requests that fit',
        summary: 'Browse customer requests, review their scope and budget, and decide which opportunities suit your services.',
        destination: '/requirements',
        action: 'Browse customer requests',
        icon: Search,
      },
      {
        title: 'Share a quotation',
        summary: 'Set a price, explain your approach and availability, and talk through the details with the customer.',
        destination: '/requirements',
        action: 'Find a request to quote',
        icon: MessageSquareText,
      },
    ],
  },
};

export const WorkflowPreviewPage: React.FC = () => {
  const [audience, setAudience] = useState<Audience>('CUSTOMER');
  const workflow = workflows[audience];

  return (
    <div className="min-h-full bg-[#fcfbf8] px-4 py-8 sm:px-6 sm:py-12">
      <SEOHead
        title="How Vaziro Works — Transparent Milestones & 100% Escrow Protection"
        description="Learn how the Vaziro verified workflow connects customers and independent service professionals across Delhi NCR with escrow milestone protection and zero commission."
        canonical="https://vaziro.com/workflow-preview"
        keywords="how vaziro works, escrow milestone protection, verified service workflow, Delhi NCR"
      />
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-emerald-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Vaziro
        </Link>

        <header className="relative isolate overflow-hidden border-b border-[#e7e8df] bg-[#f1f2e9] px-6 py-8 sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-14 -top-24 -z-10 h-80 w-80 rounded-full border-[42px] border-[#91a867]/[0.10]" />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.8px] text-[#718044]">
              <span className="h-2 w-2 rounded-full bg-[#8bb647]" /> Fairness for families. Dignity for professionals.
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#24352b] sm:text-5xl">Post once.<br /><em className="font-normal text-[#5e7b4c]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Compare clearly.</em></h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#68716b] sm:text-base sm:leading-7">See how customers and independent professionals connect through a straightforward, transparent process.</p>
          </div>
        </header>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-800">Choose your path</p>
            <p className="mt-1 text-sm text-neutral-600">Each step connects to the live app.</p>
          </div>
          <div className="inline-flex w-full max-w-md rounded-lg border border-[#e7e8df] bg-white p-1 shadow-sm" role="group" aria-label="Choose a workflow">
          {(['CUSTOMER', 'PROFESSIONAL'] as Audience[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAudience(role)}
              aria-pressed={audience === role}
              className={`min-h-11 flex-1 rounded-md px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${audience === role ? 'bg-[#203c32] text-white shadow-sm' : 'text-neutral-600 hover:bg-[#f1f2e9] hover:text-neutral-950'}`}
            >
              {role === 'CUSTOMER' ? 'I need a service' : 'I provide a service'}
            </button>
          ))}
          </div>
        </div>

        <section className="mt-6 overflow-hidden border-y border-[#dce0d3] bg-transparent" aria-live="polite">
          <div className="flex flex-col gap-3 border-b border-[#dce0d3] px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]">{audience === 'CUSTOMER' ? 'For customers' : 'For professionals'}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#29382e] sm:text-3xl">{workflow.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68716b]">{workflow.intro}</p>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-[#e7e8df] bg-[#fffefa] px-3 text-xs font-bold text-[#596456] sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#8bb647]" />
              {workflow.steps.length} simple steps
            </span>
          </div>

          <ol className="divide-y divide-[#edf1ee]">
            {workflow.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative px-5 py-5 transition-colors hover:bg-[#f7f7f1] sm:px-8 sm:py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9efdd] text-[#668044]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fcfbf8] bg-[#d5edaf] text-[9px] font-black text-[#344e2d]">{index + 1}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#89996f]">Step {String(index + 1).padStart(2, '0')}</p>
                        <h3 className="mt-1 text-base font-semibold text-[#334137]">{step.title}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#737c73]">{step.summary}</p>
                      </div>
                    </div>
                    <Link to={step.destination} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#203c32] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:ml-16">
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
          <Link to={audience === 'CUSTOMER' ? '/requirements' : '/dashboard'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            {audience === 'CUSTOMER' ? 'Browse service categories' : 'Open professional dashboard'}
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
