import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Circle, RefreshCw } from 'lucide-react';
import { Job, Quotation, Requirement } from '../types';

interface MarketplaceWorkflowProps {
  isProfessional: boolean;
  isVerified: boolean;
  requirements: Requirement[];
  quotations: Quotation[];
  jobs: Job[];
  loading: boolean;
  quotationError?: string | null;
  onRefresh: () => void;
}

interface WorkflowStep {
  title: string;
  detail: string;
  href: string;
  complete: boolean;
}

export const MarketplaceWorkflow: React.FC<MarketplaceWorkflowProps> = ({
  isProfessional,
  isVerified,
  requirements,
  quotations,
  jobs,
  loading,
  quotationError,
  onRefresh,
}) => {
  const postedQuoteCount = requirements.reduce(
    (total, requirement) => total + (requirement._count?.quotations || 0),
    0
  );
  const completedJobs = jobs.filter((job) =>
    ['COMPLETED', 'SERVICE_COMPLETED', 'CUSTOMER_APPROVED'].includes(job.status)
  ).length;

  const steps: WorkflowStep[] = isProfessional
    ? [
        {
          title: 'Verify your profile',
          detail: isVerified ? 'Identity verified' : 'Build trust with customers',
          href: '/profile',
          complete: isVerified,
        },
        {
          title: 'Find a lead',
          detail: quotations.length ? 'You have active proposals' : 'Explore customer requests',
          href: '/requirements',
          complete: quotations.length > 0 || jobs.length > 0,
        },
        {
          title: 'Send a proposal',
          detail: quotations.length ? `${quotations.length} proposal${quotations.length === 1 ? '' : 's'} sent` : 'Share your price and plan',
          href: '/requirements',
          complete: quotations.length > 0,
        },
        {
          title: 'Deliver the service',
          detail: completedJobs ? `${completedJobs} job${completedJobs === 1 ? '' : 's'} completed` : 'Manage accepted work',
          href: '/dashboard?tab=jobs',
          complete: completedJobs > 0,
        },
      ]
    : [
        {
          title: 'Post a request',
          detail: requirements.length ? `${requirements.length} request${requirements.length === 1 ? '' : 's'} posted` : 'Tell pros what you need',
          href: '/post-requirement',
          complete: requirements.length > 0,
        },
        {
          title: 'Compare proposals',
          detail: postedQuoteCount ? `${postedQuoteCount} proposal${postedQuoteCount === 1 ? '' : 's'} received` : 'Review offers in one place',
          href: requirements[0] ? `/requirements/${requirements[0].id}` : '/dashboard',
          complete: postedQuoteCount > 0,
        },
        {
          title: 'Choose a professional',
          detail: jobs.length ? 'A professional is hired' : 'Pick the right fit for you',
          href: requirements[0] ? `/requirements/${requirements[0].id}` : '/dashboard',
          complete: jobs.length > 0,
        },
        {
          title: 'Track the service',
          detail: completedJobs ? 'Service marked complete' : 'Follow progress and payments',
          href: jobs[0] ? `/jobs/${jobs[0].id}` : '/dashboard',
          complete: completedJobs > 0,
        },
      ];

  const nextStep = steps.findIndex((step) => !step.complete);
  const activeStep = nextStep < 0 ? steps.length - 1 : nextStep;
  const completedCount = steps.filter((step) => step.complete).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <section className="mb-8 overflow-hidden rounded-[1.75rem] border border-[#dce6df] bg-white shadow-[0_18px_50px_-36px_rgba(16,36,30,0.55)]" aria-labelledby="workflow-title" aria-busy={loading}>
      <div className="relative overflow-hidden bg-[#eef4ef] px-5 py-6 sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full border-[28px] border-emerald-900/[0.035]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {isProfessional ? 'Your Vaziro journey' : 'Your service journey'}
            </p>
            <h2 id="workflow-title" className="mt-2 text-2xl font-black leading-tight tracking-tight text-[#10241e] sm:text-3xl">
              {nextStep < 0 ? 'A full service cycle, completed.' : steps[activeStep].title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#52665d]">
              {nextStep < 0
                ? 'Your completed work stays here while you take on your next opportunity.'
                : isProfessional
                ? 'One clear next step takes you from building trust to delivering great work.'
                : 'Follow your request from the first details to a completed, protected service.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh workflow status"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#cad9ce] bg-white/80 px-4 text-sm font-bold text-[#29463a] transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh status'}
          </button>
        </div>

        <div className="relative mt-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d6e2d9]" role="progressbar" aria-label="Workflow progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completedCount}>
            <div className="h-full rounded-full bg-emerald-700 transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-[#52665d]">{completedCount} of {steps.length} complete</span>
        </div>
      </div>

      {quotationError && isProfessional && (
        <div role="alert" className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>{quotationError} Refresh to try again.</span>
          <button type="button" onClick={onRefresh} disabled={loading} className="min-h-11 self-start font-bold underline disabled:opacity-60 sm:self-auto">
            Retry
          </button>
        </div>
      )}

      <ol className="grid grid-cols-1 divide-y divide-[#edf1ee] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isCurrent = index === activeStep && !step.complete;
          return (
            <li key={step.title} className={`relative min-w-0 ${index < steps.length - 1 ? 'lg:border-r lg:border-[#edf1ee]' : ''}`}>
              <Link
                aria-current={isCurrent ? 'step' : undefined}
                to={step.href}
                className={`group relative flex min-h-[132px] items-start gap-3 px-5 py-5 outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 sm:px-6 ${isCurrent ? 'bg-[#f2f8f3]' : 'hover:bg-[#fafcf9]'}`}
              >
                <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-extrabold shadow-sm transition ${step.complete ? 'border-emerald-700 bg-emerald-700 text-white' : isCurrent ? 'border-[#10241e] bg-[#10241e] text-white ring-4 ring-emerald-900/10' : 'border-[#dce6df] bg-white text-[#728279]'}`} aria-label={step.complete ? 'Complete' : isCurrent ? 'Current step' : 'Upcoming step'}>
                  {step.complete ? <Check className="h-4 w-4" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-h-10 items-center justify-between gap-2">
                    <span className={`text-sm font-extrabold leading-5 ${isCurrent ? 'text-[#10241e]' : step.complete ? 'text-emerald-900' : 'text-neutral-800'}`}>{step.title}</span>
                    {step.complete && <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Done</span>}
                    {isCurrent && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">Next</span>}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-[#65736a]">{step.detail}</span>
                  {isCurrent && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                      Continue this step <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  )}
                </span>
                {!step.complete && !isCurrent && <Circle className="mt-3 h-3 w-3 shrink-0 text-[#c6d1c9]" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
