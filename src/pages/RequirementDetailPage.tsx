import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Requirement, Quotation, BoostPackage } from '../types';
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
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';
import { CategoryIcon } from '../components/CategoryIcon';

export const RequirementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedBoostPkg, setSelectedBoostPkg] = useState<BoostPackage | null>(null);
  const [boosting, setBoosting] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState<string | null>(null);
  const [usePaymentProtection, setUsePaymentProtection] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [reqRes, quotesRes, boostRes] = await Promise.all([
        api.getRequirementById(id),
        api.getQuotationsForRequirement(id),
        api.getBoostPackages().catch(() => null),
      ]);

      if (reqRes.data?.data) {
        setRequirement(reqRes.data.data);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleHire = async (quotationId: string) => {
    try {
      setHiring(quotationId);
      setError(null);

      const res = await api.hireProfessional(quotationId, usePaymentProtection);
      if (res.data?.success && res.data?.data) {
        navigate(`/jobs/${res.data.data.id}`);
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
      await api.shortlistQuotation(quoteId);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async (quoteId: string) => {
    try {
      await api.rejectQuotation(quoteId);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
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
  const canManageRequirement = Boolean(isCustomerOwner || isAdmin);
  const isBoostActive = Boolean(requirement.isBoosted);

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

        {/* Payment Protection Option Toggle (Section 34) */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
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
        </div>
      </div>

      {boostSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          {boostSuccess}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Quotation Comparison Section (Section 24 & 25) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Received Quotations ({quotations.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Side-by-side comparison powered by DigiLocker credentials and AI Match Scores.
            </p>
          </div>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Waiting for Quotations</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Local professionals in your area are evaluating your requirement. You will receive quotation proposals shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotations.map((q) => {
              const prof = q.professional;
              const ai = q.aiMatch;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition ${
                    q.status === 'SHORTLISTED'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : q.status === 'REJECTED'
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    {/* Professional Header & DigiLocker Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                          {prof?.user?.firstName?.[0] || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900 text-base">
                              {prof?.user?.firstName} {prof?.user?.lastName ? prof.user.lastName[0] + '.' : ''}
                            </h3>
                            {prof?.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ✓ Verified via DigiLocker
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{prof?.title || 'Professional Service Partner'}</p>
                        </div>
                      </div>

                      {/* AI Match Score Badge (Section 26) */}
                      {ai && (
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 bg-violet-50 text-violet-800 border border-violet-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                            {ai.score}% AI Match
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Proposed Price & Timeline */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-4 flex items-center justify-between border border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block">Proposed Quote</span>
                        <span className="text-2xl font-black text-gray-900">₹{q.proposedPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block">Est. Timeline</span>
                        <span className="text-sm font-bold text-gray-800">{q.estimatedTimeline}</span>
                      </div>
                    </div>

                    {/* Message & Scope */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-700 block">Proposal Message:</span>
                        <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                          {q.message}
                        </p>
                      </div>
                      {q.scopeSummary && (
                        <div>
                          <span className="text-xs font-bold text-gray-700 block">Scope Summary:</span>
                          <p className="text-xs text-gray-600 leading-relaxed">{q.scopeSummary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Section 27: Hire) */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    {q.status !== 'REJECTED' && (
                      <>
                        <button
                          onClick={() => handleShortlist(q.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Shortlist"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleReject(q.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleHire(q.id)}
                      disabled={hiring === q.id || q.status === 'REJECTED' || requirement.status === 'HIRED'}
                      className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {hiring === q.id ? 'Hiring...' : 'Hire Professional'}
                    </button>
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
    </div>
  );
};
