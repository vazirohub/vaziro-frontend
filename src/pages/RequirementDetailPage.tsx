import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Requirement, Quotation, BoostPackage, DetailedCreditWallet, Job } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  MapPin,
  IndianRupee,
  Star,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Phone,
  Clock,
  Briefcase,
  AlertCircle,
  ThumbsUp,
  XCircle,
  Zap,
  Check,
  X,
  Trash2,
  Coins,
  Send,
  Calendar,
  ArrowRight,
  RefreshCw,
  Award,
  Loader2,
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';
import { CategoryIcon } from '../components/CategoryIcon';
import { AddCreditsModal } from '../components/AddCreditsModal';

export const RequirementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [relatedJob, setRelatedJob] = useState<Job | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedBoostPkg, setSelectedBoostPkg] = useState<BoostPackage | null>(null);
  const [boosting, setBoosting] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hiring, setHiring] = useState<string | null>(null);
  const [usePaymentProtection, setUsePaymentProtection] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteActionId, setQuoteActionId] = useState<string | null>(null);
  const [quoteSort, setQuoteSort] = useState<'RECOMMENDED' | 'PRICE_LOW' | 'EXPERIENCE' | 'RATING'>('RECOMMENDED');

  // Professional Quotation & Credit Top-Up State
  const [wallet, setWallet] = useState<DetailedCreditWallet | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(5000);
  const [estimatedTimeline, setEstimatedTimeline] = useState('3 days');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null);

  const fetchDetails = async (silent = false) => {
    if (!id) return;
    try {
      if (silent) setRefreshing(true);
      if (!silent) setLoading(true);
      setError(null);
      const [reqRes, quotesRes, boostRes] = await Promise.all([
        api.getRequirementById(id),
        api.getQuotationsForRequirement(id),
        api.getBoostPackages().catch(() => null),
      ]);

      if (reqRes.data?.data) {
        const loadedRequirement = reqRes.data.data;
        setRequirement(loadedRequirement);
        setRelatedJob(null);
        if (user?.id === (loadedRequirement as any).customer?.userId) {
          const jobsRes = await api.getMyJobs().catch(() => null);
          const matchingJob = jobsRes?.data?.data?.find((job) => job.requirementId === loadedRequirement.id);
          setRelatedJob(matchingJob || null);
        }
      }
      if (quotesRes.data?.data) {
        setQuotations(quotesRes.data.data);
      }
      if (boostRes?.data?.data) {
        setBoostPackages(boostRes.data.data);
      }
    } catch (err: any) {
      setError('Failed to load requirement details or quotations.');
    } finally {
      if (!silent) setLoading(false);
      if (silent) setRefreshing(false);
    }
  };

  const fetchWallet = async () => {
    if (user?.roles?.includes('PROFESSIONAL')) {
      try {
        const res = await api.getCreditWallet();
        if (res.data?.data) {
          setWallet(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user?.id]);

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const handleOpenQuoteModal = () => {
    if (!requirement) return;
    setProposedPrice(requirement.budgetMin);
    setMessage(
      `Hello! I have reviewed your requirement for "${requirement.title}". With my experience in ${
        requirement.category?.name || 'this service'
      }, I am confident I can provide exceptional service for your family.`
    );
    setScopeSummary('Complete end-to-end service delivery adhering to all instructions and hygiene standards.');
    setQuoteError(null);
    setQuoteSuccess(null);
    setIsQuoteModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement) return;

    try {
      setSubmittingQuote(true);
      setQuoteError(null);

      const payload = {
        requirementId: requirement.id,
        proposedPrice: Number(proposedPrice),
        estimatedTimeline,
        proposedStartDate: proposedStartDate || undefined,
        message,
        scopeSummary,
      };

      const res = await api.submitQuotation(payload);
      if (res.data?.success) {
        setQuoteSuccess(`Quotation submitted! ${res.data.data.creditsDeducted} Credits deducted.`);
        await fetchWallet();
        setTimeout(() => {
          setIsQuoteModalOpen(false);
          fetchDetails();
        }, 1200);
      }
    } catch (err: any) {
      setQuoteError(err.response?.data?.error?.message || err.message || 'Failed to submit quotation');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleHire = async (quotationId: string) => {
    const quotation = quotations.find((item) => item.id === quotationId);
    const professionalName = quotation?.professional?.user?.firstName || 'this professional';
    const protectionNote = usePaymentProtection ? ' Payment protection is on and includes a 6% platform fee.' : '';
    if (!window.confirm(`Hire ${professionalName} for ₹${(quotation?.proposedPrice || 0).toLocaleString('en-IN')}? This creates a service contract.${protectionNote}`)) return;
    try {
      setHiring(quotationId);
      setError(null);

      const res = await api.hireProfessional(quotationId, usePaymentProtection);
      if (res.data?.success && res.data?.data) {
        navigate(`/jobs/${res.data.data.id}`);
      } else {
        setError('We could not create the service contract. Please refresh and try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to hire professional.');
    } finally {
      setHiring(null);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequirement = async () => {
    if (!requirement) return;
    if (!window.confirm('Are you sure you want to remove this posted job? All open applications and quotes will be cancelled.')) return;
    try {
      setIsDeleting(true);
      await api.deleteRequirement(requirement.id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to remove requirement');
      setIsDeleting(false);
    }
  };

  const handleShortlist = async (quoteId: string) => {
    try {
      setQuoteActionId(quoteId);
      setError(null);
      await api.shortlistQuotation(quoteId);
      await fetchDetails(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Could not shortlist this proposal. Try again.');
    } finally {
      setQuoteActionId(null);
    }
  };

  const handleReject = async (quoteId: string) => {
    if (!window.confirm('Reject this professional’s proposal? You can no longer hire them for this request.')) return;
    try {
      setQuoteActionId(quoteId);
      setError(null);
      await api.rejectQuotation(quoteId);
      await fetchDetails(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Could not update this proposal. Try again.');
    } finally {
      setQuoteActionId(null);
    }
  };

  const handleBoostRequirement = async (pkg: BoostPackage) => {
    if (!id || !requirement) return;
    try {
      setBoosting(true);
      setError(null);

      // 1. Create boost order
      const orderRes = await api.createBoostOrder(id, pkg.id);
      if (!orderRes.data?.data) {
        throw new Error('Failed to create boost order.');
      }

      const { orderId, amount, keyId, user: userInfo } = orderRes.data.data;

      // 2. Open Razorpay Checkout
      const paymentResponse = await openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        name: 'Vaziro™ Requirement Boost',
        description: `${pkg.name} — ${pkg.durationDays} Days Priority Placement`,
        prefill: {
          name: userInfo?.name || `${user?.firstName} ${user?.lastName}`,
          email: userInfo?.email || user?.email,
          contact: userInfo?.phone || user?.phone,
        },
      });

      // 3. Verify Payment
      const verifyRes = await api.verifyBoostPayment({
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        requirementId: id,
        packageId: pkg.id,
      });

      if (verifyRes.data?.success) {
        setBoostSuccess(verifyRes.data.message || 'Requirement boosted successfully!');
        setIsBoostModalOpen(false);
        fetchDetails();
      }
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to complete boost.');
      }
    } finally {
      setBoosting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading requirement and comparing quotations...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">Requirement Not Found</h2>
        <Link to="/requirements" className="mt-4 inline-block text-emerald-600 font-semibold hover:underline">
          Browse all requirements →
        </Link>
      </div>
    );
  }

  const isCustomerOwner = user && user.id === (requirement as any).customer?.userId;
  const isAdmin = user && (user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN'));
  const isProfessional = Boolean(user && user.roles?.includes('PROFESSIONAL'));
  const canManageRequirement = Boolean(isCustomerOwner || isAdmin);
  const isBoostActive = Boolean(requirement.isBoosted);
  const myQuote = quotations.find(
    (q) =>
      (q.professional?.user as any)?.id === user?.id ||
      (user?.professionalProfile && q.professionalProfileId === (user.professionalProfile as any)?.id) ||
      (wallet?.professionalProfileId && q.professionalProfileId === wallet.professionalProfileId)
  );
  const currentBalance = wallet?.balance ?? user?.professionalProfile?.creditWallet?.balance ?? 0;
  const isHired = Boolean(relatedJob) || ['HIRED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(requirement.status.toUpperCase()) || quotations.some((quote) => ['HIRED', 'ACCEPTED'].includes(quote.status.toUpperCase()));
  const customerJourneyStep = isHired ? 3 : 1;
  const sortedQuotations = [...quotations].sort((a, b) => {
    if (quoteSort === 'PRICE_LOW') return a.proposedPrice - b.proposedPrice;
    if (quoteSort === 'EXPERIENCE') return (b.professional?.yearsOfExperience || 0) - (a.professional?.yearsOfExperience || 0);
    if (quoteSort === 'RATING') return (b.professional?.rating || 0) - (a.professional?.rating || 0);
    return (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0) || (b.professional?.rating || 0) - (a.professional?.rating || 0) || (b.professional?.yearsOfExperience || 0) - (a.professional?.yearsOfExperience || 0);
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner: Requirement Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CategoryIcon icon={requirement.category?.icon} className="w-3.5 h-3.5 text-emerald-600" />
                <span>{requirement.category?.name} • {requirement.subcategory?.name}</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Status: {requirement.status}
              </span>
              {canManageRequirement && (
                <button
                  onClick={handleDeleteRequirement}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200 transition cursor-pointer"
                  title="Remove this posted job"
                >
                  <Trash2 className="w-3 h-3" />
                  {isDeleting ? 'Removing...' : 'Remove Posted Job'}
                </button>
              )}
              {isBoostActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                  Featured Boosted
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {requirement.title}
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-3xl leading-relaxed">
              {requirement.description}
            </p>
          </div>

          {/* Budget Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shrink-0 text-right">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Posted Budget</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
              {requirement.budgetType === 'RANGE' && requirement.budgetMax
                ? `₹${requirement.budgetMin.toLocaleString('en-IN')} - ₹${requirement.budgetMax.toLocaleString('en-IN')}`
                : `₹${requirement.budgetMin.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-end gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {requirement.city?.name || 'India'}
                {(() => {
                  const pin = typeof requirement.pincode === 'string' ? requirement.pincode : (requirement.pincode as any)?.pincode || (requirement.pincodeId && requirement.pincodeId.length === 6 && !requirement.pincodeId.includes('-') ? requirement.pincodeId : null);
                  return pin ? `, ${pin}` : '';
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Boost Banner (Section 25, 26) */}
        {isCustomerOwner && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            {isBoostActive ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">Requirement Boost Active</span>
                    <p className="text-[11px] text-amber-800">
                      Your requirement is featured at the top of professional discovery feeds
                      {requirement.boostExpiresAt && ` until ${new Date(requirement.boostExpiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBoostModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                >
                  Extend Boost
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Get 3x Faster Quotes with Requirement Boost</span>
                    <p className="text-[11px] text-gray-500">
                      Promote your requirement to the top of the search feed for verified service professionals in your area. Starting at just ₹29.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBoostModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition shrink-0 cursor-pointer"
                >
                  ⚡ Boost Requirement
                </button>
              </div>
            )}
          </div>
        )}

        {/* Professional Opportunity & Apply Bar */}
        {isProfessional && !isCustomerOwner && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            {myQuote ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">You have applied for this job</span>
                    <span className="text-[11px] text-emerald-800">
                      Your proposed quote: <strong>₹{myQuote.proposedPrice.toLocaleString('en-IN')}</strong> • Est. Timeline: {myQuote.estimatedTimeline} • Status: <strong>{myQuote.status}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Service Professional Opportunity</span>
                  <h3 className="text-base font-black text-white mt-0.5">Submit a Proposal to This Customer</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Send your price and timeline proposal. Requires {requirement.creditsRequired || 5} Credits upon submission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenQuoteModal}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply & Submit Quote</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Protection Option Toggle (Section 34) */}
        {isCustomerOwner && <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Vaziro Payment Protection</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Optional & Recommended
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Funds are secured upon hiring and released to the professional only after you approve completion. Platform fee: 6%.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={usePaymentProtection}
              onChange={(e) => setUsePaymentProtection(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
            />
            <span className="text-xs font-bold text-emerald-950">Enable Protection</span>
          </label>
        </div>}
      </div>

      {isCustomerOwner && (
        <section className="mb-8 overflow-hidden rounded-[10px] border border-[#dce0d3] bg-[#fffefa]" aria-labelledby="customer-journey-title">
          <div className="flex flex-col gap-4 border-b border-[#e7e8df] bg-[#f1f2e9] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#718044]">{isHired ? 'Service progress' : 'Your request is live'}</p>
              <h2 id="customer-journey-title" className="mt-1 text-lg font-semibold tracking-tight text-[#29382e]">
                {isHired ? 'You’ve chosen a professional' : quotations.length ? `${quotations.length} ${quotations.length === 1 ? 'proposal' : 'proposals'} to review` : 'We’re finding the right professionals'}
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#68716b]">
                {isHired ? 'Your next step is in the service tracker.' : quotations.length ? 'Compare each offer, shortlist your favourites, then hire when you’re ready.' : 'New proposals will appear here. You can leave this page and return any time.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:self-auto">
              <Link to="/dashboard?tab=requests" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#d8ddd3] bg-white px-4 text-sm font-semibold text-[#40583d] transition hover:bg-[#f7f7f1]">My requests</Link>
              {!isHired && quotations.length > 0 && <a href="#received-quotations" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#203c32] px-4 text-sm font-semibold text-white transition hover:bg-[#2d5144]">Review proposals <ArrowRight className="h-4 w-4" /></a>}
              {isHired && relatedJob && <Link to={`/jobs/${relatedJob.id}`} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#203c32] px-4 text-sm font-semibold text-white transition hover:bg-[#2d5144]">Open service tracker <ArrowRight className="h-4 w-4" /></Link>}
              <button type="button" onClick={() => fetchDetails(true)} disabled={refreshing || loading} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#d8ddd3] bg-white px-4 text-sm font-semibold text-[#40583d] transition hover:bg-[#f7f7f1] disabled:cursor-wait disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Checking...' : 'Refresh proposals'}
              </button>
            </div>
          </div>
          <ol className="grid grid-cols-1 divide-y divide-[#e7e8df] sm:grid-cols-3 sm:divide-y-0">
            {[
              { title: 'Request posted', detail: new Date(requirement.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
              { title: 'Compare proposals', detail: quotations.length ? `${quotations.length} received` : 'Waiting for offers' },
              { title: 'Hire & track', detail: isHired ? 'Open your tracker' : 'When you’re ready' },
            ].map((item, index) => {
              const complete = index < customerJourneyStep;
              const current = index === customerJourneyStep;
              return (
                <li key={item.title} aria-current={current ? 'step' : undefined} className={`flex items-center gap-3 px-5 py-4 sm:px-6 ${current ? 'bg-[#f8faf4]' : ''}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-[#dce9ce] text-[#48633e]' : current ? 'bg-[#203c32] text-white' : 'bg-[#f1f2e9] text-[#8c9388]'}`}>
                    {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#354137]">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-[#7a8279]">{item.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {boostSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          {boostSuccess}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Quotation Comparison Section */}
      <div id="received-quotations" className="mb-8 scroll-mt-24">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#718044]">{isCustomerOwner ? 'Review your options' : 'Request proposals'}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#29382e]">
              {isCustomerOwner ? `Proposals (${quotations.length})` : `Quotations (${quotations.length})`}
            </h2>
            <p className="mt-1 text-sm text-[#737c73]">
              {isCustomerOwner ? 'Compare price, experience and availability. Hire only when you’re ready.' : 'Review offers from professionals who have responded to this request.'}
            </p>
          </div>
          {quotations.length > 1 && (
            <label className="flex min-h-11 items-center gap-2 self-start rounded-md border border-[#dfe2d9] bg-white px-3 text-xs font-semibold text-[#59645b] sm:self-auto">
              <span>Sort by</span>
              <select aria-label="Sort proposals" value={quoteSort} onChange={(event) => setQuoteSort(event.target.value as typeof quoteSort)} className="min-h-10 bg-transparent text-sm font-semibold text-[#344137] outline-none">
                <option value="RECOMMENDED">Best match</option>
                <option value="PRICE_LOW">Lowest price</option>
                <option value="EXPERIENCE">Most experience</option>
                <option value="RATING">Highest rating</option>
              </select>
            </label>
          )}
        </div>

        {quotations.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#cfd8c7] bg-[#fffefa] px-5 py-10 text-center sm:px-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9efdd] text-[#668044]"><Clock className="h-5 w-5" /></span>
            <h3 className="mt-4 text-lg font-semibold text-[#344137]">Your request is open</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#737c73]">
              When professionals respond, their quotations will appear here. You can refresh this page to check for new proposals.
            </p>
            <button type="button" onClick={() => fetchDetails(true)} disabled={refreshing || loading} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d8ddd3] bg-white px-4 text-sm font-semibold text-[#40583d] transition hover:bg-[#f7f7f1] disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Checking...' : 'Check for proposals'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {sortedQuotations.map((q) => {
              const prof = q.professional;

              return (
                <div
                  key={q.id}
                  className={`rounded-[10px] border bg-[#fffefa] p-5 flex flex-col justify-between shadow-[0_10px_30px_-26px_rgba(48,67,45,0.4)] transition sm:p-6 ${
                    q.status === 'SHORTLISTED'
                      ? 'border-[#78935f] ring-2 ring-[#78935f]/15'
                      : q.status === 'REJECTED'
                      ? 'border-[#e7e8df] opacity-65'
                      : 'border-[#e7e8df] hover:border-[#c5d5a8]'
                  }`}
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9efdd] text-base font-semibold text-[#48633e]">
                          {prof?.user?.firstName?.[0] || 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-base font-semibold text-[#29382e]">
                              {prof?.user?.firstName} {prof?.user?.lastName ? prof.user.lastName[0] + '.' : ''}
                            </h3>
                            {prof?.isVerified && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#dce8ce] bg-[#f1f4e9] px-2 py-0.5 text-[11px] font-semibold text-[#48633e]">
                                <ShieldCheck className="h-3.5 w-3.5" /> Verified
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[#737c73]">{prof?.title || 'Professional'}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#737c73]">
                            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />{prof?.rating ? prof.rating.toFixed(1) : 'New'}{prof?.reviewsCount ? ` (${prof.reviewsCount})` : ''}</span>
                            <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5 text-[#718044]" />{prof?.yearsOfExperience || 0} yrs experience</span>
                            {Boolean(prof?.completedJobsCount) && <span>{prof?.completedJobsCount} completed</span>}
                          </div>
                        </div>
                      </div>

                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${q.status === 'SHORTLISTED' ? 'border-[#dce8ce] bg-[#f1f4e9] text-[#48633e]' : q.status === 'REJECTED' ? 'border-[#e7e8df] bg-[#f7f7f1] text-[#737c73]' : 'border-[#e7e8df] bg-white text-[#737c73]'}`}>{q.status.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-[#e7e8df] bg-[#f7f7f1] p-4">
                      <div>
                        <span className="block text-xs font-semibold text-[#737c73]">Proposed price</span>
                        <span className="mt-0.5 block text-2xl font-semibold tracking-tight text-[#29382e]">₹{q.proposedPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-[#737c73]">Estimated time</span>
                        <span className="mt-1 block text-sm font-semibold text-[#354137]">{q.estimatedTimeline}</span>
                        {q.proposedStartDate && <span className="mt-1 block text-xs text-[#737c73]">Starts {new Date(`${q.proposedStartDate.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    </div>

                    {/* Message & Scope */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-sm font-semibold text-[#465248]">Message</span>
                        <p className="mt-1 rounded-md border border-[#e7e8df] bg-white p-3 text-sm leading-6 text-[#626e64]">
                          {q.message || 'No message provided.'}
                        </p>
                      </div>
                      {q.scopeSummary && (
                        <div>
                            <span className="text-sm font-semibold text-[#465248]">Scope summary</span>
                            <p className="mt-1 text-sm leading-6 text-[#737c73]">{q.scopeSummary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Section 27: Hire) */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#e7e8df] pt-4">
                    {prof?.id && <Link to={`/professionals/${prof.id}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8ddd3] px-3 text-sm font-semibold text-[#40583d] transition hover:bg-[#f7f7f1]">View profile</Link>}
                    {canManageRequirement && q.status !== 'REJECTED' && !isHired && (
                      <>
                        <button
                          onClick={() => handleShortlist(q.id)}
                          disabled={quoteActionId === q.id}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-[#d8ddd3] px-3 text-sm font-semibold text-[#40583d] transition hover:bg-[#f7f7f1] disabled:cursor-wait disabled:opacity-60"
                        >
                          {quoteActionId === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4 text-[#668044]" />}
                          {q.status === 'SHORTLISTED' ? 'Shortlisted' : 'Shortlist'}
                        </button>

                        <button
                          onClick={() => handleReject(q.id)}
                          disabled={quoteActionId === q.id}
                          aria-label={`Reject proposal from ${prof?.user?.firstName || 'professional'}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-[#e7e8df] px-3 text-sm font-semibold text-[#737c73] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" /> Decline
                        </button>
                      </>
                    )}

                    {canManageRequirement && !isHired && q.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleHire(q.id)}
                        disabled={Boolean(hiring) || quoteActionId === q.id}
                        className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#203c32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-wait disabled:opacity-60"
                      >
                        {hiring === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {hiring === q.id ? 'Creating contract...' : 'Hire professional'}
                      </button>
                    )}
                    {isHired && ['HIRED', 'ACCEPTED'].includes(q.status.toUpperCase()) && relatedJob && (
                      <Link to={`/jobs/${relatedJob.id}`} className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#203c32] px-4 text-sm font-semibold text-white transition hover:bg-[#2d5144]">Track service <ArrowRight className="h-4 w-4" /></Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOMER BOOST CHECKOUT MODAL (Section 25, 26) */}
      {isBoostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBoostModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 fill-amber-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Boost Your Requirement</h2>
              <p className="text-xs text-gray-500 mt-1">
                Pin your requirement to the top of discovery feeds for local verified professionals.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {boostPackages.map((pkg) => {
                const isSelected = selectedBoostPkg?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedBoostPkg(pkg)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-gray-900">{pkg.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {pkg.durationDays} {pkg.durationDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pkg.description || `Priority ranking for ${pkg.durationDays} days`}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-gray-900">₹{pkg.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 mb-6 leading-relaxed">
              <span className="font-bold text-neutral-900 block mb-0.5">Instant Activation Disclosure:</span>
              Boosts are activated immediately upon payment. Professional quotations are submitted directly by verified local experts. Posting requirements is always free; boosts are an optional acceleration tool.
            </div>

            <button
              onClick={() => selectedBoostPkg && handleBoostRequirement(selectedBoostPkg)}
              disabled={!selectedBoostPkg || boosting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {boosting ? 'Processing Payment...' : selectedBoostPkg ? `Pay ₹${selectedBoostPkg.price} & Activate Boost` : 'Select a Package'}
            </button>
          </div>
        </div>
      )}

      {/* Quotation Submission Modal for Professionals */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Quotation Proposal</h3>
                <p className="text-xs text-gray-500 mt-0.5">{requirement.title}</p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccess && (
              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quoteSuccess}</span>
              </div>
            )}

            {quoteError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                {quoteError}
              </div>
            )}

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Proposed Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimated Timeline *
                  </label>
                  <input
                    type="text"
                    value={estimatedTimeline}
                    onChange={(e) => setEstimatedTimeline(e.target.value)}
                    placeholder="e.g. 3 days / 2 hours daily"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Proposed Start Date
                </label>
                <input
                  type="date"
                  value={proposedStartDate}
                  onChange={(e) => setProposedStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Personal Message to Customer *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, your credentials, and why you are the best fit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scope Summary & Deliverables
                </label>
                <textarea
                  rows={2}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  placeholder="Specific tasks, hygiene standards, equipment provided..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              {/* Explicit Credit Confirmation & In-Context Warning */}
              <div className={`p-3.5 rounded-xl border text-xs transition-all ${
                currentBalance < (requirement.creditsRequired || 5)
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="font-bold text-neutral-900 flex items-center justify-between">
                  <span>Application Credit Deduction:</span>
                  <span className="text-amber-700 font-black">{requirement.creditsRequired || 5} Credits</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-600 mt-1 font-medium">
                  <span>Current Balance: <strong>{currentBalance} cr</strong></span>
                  <span>Balance After: <strong>{Math.max(0, currentBalance - (requirement.creditsRequired || 5))} cr</strong></span>
                </div>

                {currentBalance < (requirement.creditsRequired || 5) && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80">
                    <div className="flex items-start gap-2 text-amber-900 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        You need {requirement.creditsRequired || 5} credits to apply for this job, but your current balance is {currentBalance} credits.
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[11px] text-amber-800 font-medium">
                        Top up instantly without losing your quotation draft.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddCreditsOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Add Credit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote || currentBalance < (requirement.creditsRequired || 5)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuote ? 'Deducting & Submitting...' : 'Confirm & Spend Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Add Credits Modal: Keeps quotation modal intact */}
      <AddCreditsModal
        isOpen={isAddCreditsOpen}
        onClose={() => setIsAddCreditsOpen(false)}
        onSuccess={async () => {
          await fetchWallet();
        }}
        creditsNeeded={requirement?.creditsRequired || 5}
        currentBalance={currentBalance}
      />
    </div>
  );
};
