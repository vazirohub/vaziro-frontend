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

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm" aria-labelledby="workflow-title">
      <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            {isProfessional ? 'Professional journey' : 'Customer journey'}
          </p>
          <h2 id="workflow-title" className="mt-1 text-xl font-extrabold tracking-tight text-neutral-950">
            {nextStep < 0 ? 'You completed a full service cycle' : `Next up: ${steps[activeStep].title}`}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {nextStep < 0
              ? 'Your completed work stays here while you take on your next opportunity.'
              : isProfessional
              ? 'Move from a trusted profile to a completed service.'
              : 'Follow each step from your first request through service completion.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh workflow status"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {quotationError && isProfessional && (
        <div role="alert" className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>{quotationError} Refresh to try again.</span>
          <button type="button" onClick={onRefresh} disabled={loading} className="min-h-11 self-start font-bold underline disabled:opacity-60 sm:self-auto">
            Retry
          </button>
        </div>
      )}

      <ol className="grid grid-cols-1 divide-y divide-neutral-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isCurrent = index === activeStep && !step.complete;
          return (
            <li key={step.title} className={`relative min-w-0 ${index < steps.length - 1 ? 'lg:border-r lg:border-neutral-100' : ''}`}>
              <Link
                to={step.href}
                className={`group flex min-h-[104px] items-start gap-3 px-5 py-4 outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 sm:px-6 ${isCurrent ? 'bg-emerald-50/60' : ''}`}
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${step.complete ? 'border-emerald-600 bg-emerald-600 text-white' : isCurrent ? 'border-emerald-700 bg-white text-emerald-700' : 'border-neutral-300 bg-white text-neutral-400'}`} aria-label={step.complete ? 'Complete' : isCurrent ? 'Current step' : 'Upcoming step'}>
                  {step.complete ? <Check className="h-4 w-4" aria-hidden="true" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-neutral-900">{step.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-neutral-600">{step.detail}</span>
                  {isCurrent && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                      Continue <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                </span>
                {!step.complete && !isCurrent && <Circle className="mt-2 h-3 w-3 shrink-0 text-neutral-300" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
