import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Requirement, Job } from '../types';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reqRes, jobRes] = await Promise.all([
        api.getMyRequirements().catch(() => ({ data: { data: [] } })),
        api.getMyJobs().catch(() => ({ data: { data: [] } })),
      ]);

      if (reqRes.data?.data) setRequirements(reqRes.data.data);
      if (jobRes.data?.data) setJobs(jobRes.data.data);
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
        <button
          onClick={() => openAuthModal('CUSTOMER')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user.firstName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Welcome back, {user.firstName} {user.lastName}!
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
                      className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm"
                    >
                      {verifying ? 'Verifying...' : '⚡ Verify with DigiLocker'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isProfessional ? (
            <Link
              to="/credits"
              className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 hover:bg-emerald-100/60 transition"
            >
              <Coins className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Available Credits</div>
                <div className="text-xl font-black text-gray-900">
                  {user.professionalProfile?.creditWallet?.balance ?? 10} <span className="text-xs text-emerald-700 font-normal">cr</span>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              to="/post-requirement"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Requirement
            </Link>
          )}
        </div>
      </div>

      {/* Real Active Jobs List */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Service Contracts ({jobs.length})</h2>
            <p className="text-xs text-gray-500">Track delivery milestones, release payments, and message partners</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-400">
            No active jobs in execution currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Stage: {job.status.replace(/_/g, ' ')}
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
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.status}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900">₹{req.budgetMin.toLocaleString('en-IN')}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h3>
                    <p className="text-xs text-gray-500">{req.category?.name} • {req.subcategory?.name}</p>
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
