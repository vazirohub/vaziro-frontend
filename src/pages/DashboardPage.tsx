import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Requirement, Job, DetailedCreditWallet } from '../types';
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
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';

export const DashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [wallet, setWallet] = useState<DetailedCreditWallet | null>(null);
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
      }

      const [reqRes, jobRes, walletRes] = await Promise.all(promises);

      if (reqRes?.data?.data) setRequirements(reqRes.data.data);
      if (jobRes?.data?.data) setJobs(jobRes.data.data);
      if (walletRes?.data?.data) setWallet(walletRes.data.data);
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
      const res = await api.verifyDigiLocker();
      if (res.data?.success) {
        setVerificationSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {user.firstName[0]}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Welcome, {user.firstName} {user.lastName}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{user.phone || user.email}</span>
              <span>•</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {user.roles.join(', ')}
              </span>
              {isProfessional && (
                user.professionalProfile?.isVerified || verificationSuccess ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>✓ Verified via DigiLocker</span>
                  </span>
                ) : (
                  <button
                    onClick={handleDigiLockerVerify}
                    disabled={verifying}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm cursor-pointer"
                  >
                    {verifying ? 'Verifying...' : '⚡ Verify with DigiLocker'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Link
            to="/profile"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-800 transition"
          >
            <UserIcon className="w-4 h-4 text-black" />
            <span>Profile</span>
          </Link>
          {!isProfessional && (
            <Link
              to="/post-requirement"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Requirement</span>
            </Link>
          )}
        </div>
      </div>

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
