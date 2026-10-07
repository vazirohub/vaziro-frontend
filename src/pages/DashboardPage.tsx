import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Requirement, Job, DetailedCreditWallet, Quotation } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  IndianRupee,
  Briefcase,
  Coins,
  Clock,
  PlusCircle,
  MapPin,
  ChevronRight,
  CheckCircle2,
  User as UserIcon,
  Search,
  CreditCard,
  History,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { ProfileVerificationCard } from '../components/ProfileVerificationCard';
import { ProfileStrengthCard } from '../components/ProfileStrengthCard';
import { TrustScoreCard } from '../components/TrustScoreCard';
import { MarketplaceWorkflow } from '../components/MarketplaceWorkflow';
import { ProfileStrengthResult, TrustScoreResult } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationError, setQuotationError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<DetailedCreditWallet | null>(null);
  const [strength, setStrength] = useState<ProfileStrengthResult | null>(null);
  const [trust, setTrust] = useState<TrustScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const promises: Promise<any>[] = [
        api.getMyRequirements().catch(() => ({ data: { data: [] } })),
        api.getMyJobs().catch(() => ({ data: { data: [] } })),
      ];

      if (isProfessional) {
        promises.push(api.getCreditWallet().catch(() => null));
        promises.push(api.getProfileStrength().catch(() => null));
        promises.push(api.getTrustScore().catch(() => null));
        promises.push(
          api.getMyQuotations().then((res) => {
            setQuotationError(null);
            return res;
          }).catch(() => {
            setQuotationError('Your proposals could not be loaded.');
            return null;
          })
        );
      } else {
        setQuotations([]);
        setQuotationError(null);
      }

      const results = await Promise.all(promises);
      const reqRes = results[0];
      const jobRes = results[1];
      const walletRes = isProfessional ? results[2] : null;
      const strengthRes = isProfessional ? results[3] : null;
      const trustRes = isProfessional ? results[4] : null;
      const quotationsRes = isProfessional ? results[5] : null;

      if (reqRes?.data?.data) setRequirements(reqRes.data.data);
      if (jobRes?.data?.data) setJobs(jobRes.data.data);
      if (walletRes?.data?.data) setWallet(walletRes.data.data);
      if (strengthRes?.data?.data) setStrength(strengthRes.data.data);
      if (trustRes?.data?.data) setTrust(trustRes.data.data);
      if (quotationsRes?.data?.data) setQuotations(quotationsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleDigiLockerVerify = async () => {
    try {
      setVerifying(true);
      const res = await api.initiateApiSetuVerification();
      if (res.data?.data?.authUrl) {
        // Redirect to official MeriPehchaan / DigiLocker consent portal
        window.location.href = res.data.data.authUrl;
        return;
      }

      // Fallback
      const fallbackRes = await api.verifyDigiLocker();
      if (fallbackRes.data?.success) {
        setVerificationSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      alert('Verification could not be initiated: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-gray-200 text-center shadow-lg">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-gray-600 mb-6">Please log in with your Indian mobile number to access your dashboard.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
            className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            Sign Up Free
          </button>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? user.professionalProfile?.creditWallet?.balance ?? 10;
  const creditValueInr = wallet?.creditValueInr ?? balance * 10;
  const pendingRefund = wallet?.creditsPendingRefund ?? 0;
  const refunded = wallet?.creditsRefunded ?? 0;
  const used = wallet?.creditsUsed ?? 0;
  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {isProfessional ? (
        <section className="relative isolate mb-6 overflow-hidden rounded-[2rem] bg-[#10241e] px-5 py-6 text-white shadow-xl sm:px-8 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 -z-10 h-48 w-48 rounded-full bg-lime-300/10 blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                  <Briefcase className="h-3.5 w-3.5" /> Professional workspace
                </span>
                {(user.professionalProfile?.isVerified || verificationSuccess) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" /> Identity verified
                  </span>
                )}
              </div>
              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {user.firstName}.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
                Keep your profile sharp, find the right customer requests, and stay on top of every proposal and active job.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/requirements" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 text-sm font-extrabold text-[#10241e] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10241e]">
                  Find customer requests <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/profile" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <UserIcon className="h-4 w-4" /> Improve your profile
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              <Link to="/requirements" className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                <span className="text-xs font-semibold text-emerald-100/70">Proposals sent</span>
                <span className="mt-2 block text-3xl font-black tracking-tight">{loading ? '...' : quotations.length}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-200">Review opportunities <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </Link>
              <Link to="/dashboard?tab=jobs" className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                <span className="text-xs font-semibold text-emerald-100/70">Service contracts</span>
                <span className="mt-2 block text-3xl font-black tracking-tight">{loading ? '...' : jobs.length}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-200">Track your work <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </Link>
              <Link to="/credits" className="col-span-2 flex items-center justify-between rounded-2xl border border-emerald-200/20 bg-emerald-300/10 p-4 transition hover:bg-emerald-300/15 sm:col-span-1 lg:col-span-2">
                <span>
                  <span className="block text-xs font-semibold text-emerald-100/70">Available credits</span>
                  <span className="mt-1 block text-2xl font-black">{loading ? '...' : wallet?.balance ?? user.professionalProfile?.creditWallet?.balance ?? '—'}</span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-[#10241e]"><Coins className="h-5 w-5" /></span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="mb-6 flex flex-col items-start justify-between gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white shadow-md">
              {user.firstName[0]}
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight text-gray-900 sm:text-2xl">Welcome, {user.firstName} {user.lastName}!</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{user.phone || user.email}</span>
                <span aria-hidden="true">•</span>
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">Customer</span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2.5 sm:w-auto">
            <Link to="/profile" className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-xs font-bold text-neutral-800 transition hover:bg-neutral-200 sm:flex-none">
              <UserIcon className="h-4 w-4 text-black" /> Profile
            </Link>
            <Link to="/post-requirement" className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 sm:flex-none">
              <PlusCircle className="h-4 w-4" /> Post Requirement
            </Link>
          </div>
        </div>
      )}

      {/* Professional: Profile Verification Card */}
      {isProfessional && (
        <ProfileVerificationCard className="mb-6" />
      )}

      <MarketplaceWorkflow
        isProfessional={Boolean(isProfessional)}
        isVerified={Boolean(user.professionalProfile?.isVerified || verificationSuccess)}
        requirements={requirements}
        quotations={quotations}
        jobs={jobs}
        loading={loading}
        quotationError={quotationError}
        onRefresh={loadDashboardData}
      />

      {/* Professional: Profile Strength & Trust Score */}
      {isProfessional && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Profile Strength</span>
              <Link to="/profile" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <span>Edit Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ProfileStrengthCard
              strength={strength}
              compact={true}
              onSelectSection={() => {
                window.location.href = '/profile';
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Trust Score & Identity</span>
              <Link
                to={`/professionals/${user.professionalProfile?.slug || user.professionalProfile?.id || user.id}`}
                target="_blank"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Preview Public View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <TrustScoreCard
              trust={trust}
              compact={true}
            />
          </div>
        </div>
      )}

      {/* Professional: Prominent Wallet Card */}
      {isProfessional && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 border border-emerald-800/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Coins className="w-4 h-4" />
                <span>Vaziro Professional Wallet</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {wallet?.visibilityTier || 'STANDARD'} Visibility
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {balance} <span className="text-base font-normal text-emerald-300">Credits</span>
                </div>
                <div className="text-sm font-semibold text-emerald-200">
                  ≈ ₹{creditValueInr.toLocaleString('en-IN')} Value (₹10/cr)
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                100% refund guarantee: When customer chooses another pro or the lead expires, spent application credits automatically return to your wallet.
              </p>

              {/* Wallet Sub-metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/60 max-w-lg">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Refund</span>
                  <span className="text-sm font-black text-amber-300">{pendingRefund} cr</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Refunded</span>
                  <span className="text-sm font-black text-emerald-400">+{refunded} cr</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Credits Used</span>
                  <span className="text-sm font-black text-slate-200">{used} cr</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <Link
                to="/credits"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Buy Professional Plan
              </Link>

              <Link
                to="/credits"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition border border-white/10 flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                Transaction History
              </Link>

              <Link
                to="/requirements"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find New Leads
              </Link>
            </div>
          </div>
        </div>
      )}

      {isProfessional && (
        <section className="mb-10" aria-labelledby="proposal-activity-title">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Opportunity activity</p>
              <h2 id="proposal-activity-title" className="mt-1 text-xl font-extrabold tracking-tight text-neutral-950">Your recent proposals</h2>
              <p className="mt-1 text-sm text-neutral-600">Check the status of your offers and revisit the request details.</p>
            </div>
            <Link to="/requirements" className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-bold text-emerald-800 transition hover:text-emerald-950 sm:self-auto">
              Find another lead <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600" role="status">Loading your proposals...</div>
          ) : quotationError ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span>{quotationError} Refresh the dashboard to retry.</span>
              <button type="button" onClick={loadDashboardData} className="min-h-11 self-start rounded-lg px-3 font-bold underline sm:self-auto">Retry</button>
            </div>
          ) : recentQuotations.length === 0 ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <h3 className="font-bold text-neutral-900">No proposals yet</h3>
                <p className="mt-1 text-sm text-neutral-600">Browse open requests and send a proposal when you find a good fit.</p>
              </div>
              <Link to="/requirements" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 sm:self-auto">
                Browse requests <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentQuotations.map((quotation) => (
                <article key={quotation.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500">Request {quotation.requirementId.slice(-6).toUpperCase()}</p>
                      <p className="mt-1 text-xl font-extrabold text-neutral-950">₹{quotation.proposedPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${['ACCEPTED', 'HIRED', 'SHORTLISTED'].includes(quotation.status) ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : quotation.status === 'REJECTED' ? 'border-neutral-200 bg-neutral-100 text-neutral-600' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                      {quotation.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                    <span className="text-xs text-neutral-500">{quotation.estimatedTimeline} · {new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <Link to={`/requirements/${quotation.requirementId}`} className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950">
                      View request <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Active Service Contracts (Jobs) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Service Contracts ({jobs.length})</h2>
            <p className="text-xs text-gray-500">Track milestones, escrow protection, and partner messages</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-400">
            No active jobs in execution currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Work: {(job.workStatus || job.status).replace(/_/g, ' ')}
                    </span>
                    <span className="font-extrabold text-sm text-gray-900">₹{job.agreedPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{job.requirement?.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{job.requirement?.category?.name} • {job.requirement?.city?.name}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Partner: {isProfessional ? job.customer?.user?.firstName : job.professional?.user?.firstName}
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Open Tracker <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posted Requirements List (Customer View) */}
      {!isProfessional && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Posted Requirements ({requirements.length})</h2>
              <p className="text-xs text-gray-500">View incoming quotation proposals and hire verified professionals</p>
            </div>
            <Link to="/post-requirement" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Post Another
            </Link>
          </div>

          {requirements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-400">
              You haven't posted any requirements yet. Click "Post Requirement" to receive quotes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between hover:border-gray-300 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.status}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900">₹{req.budgetMin.toLocaleString('en-IN')}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CategoryIcon icon={req.category?.icon} className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{req.category?.name} • {req.subcategory?.name}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      {req._count?.quotations || 0} Quotes Received
                    </span>
                    <Link
                      to={`/requirements/${req.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Compare Quotes <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
