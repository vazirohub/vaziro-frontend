import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  MessageSquare,
  AlertTriangle,
  FileText,
  Star,
  ChevronRight,
  Send,
  X,
  CreditCard,
  Sparkles,
  Truck,
  Wrench,
  Check,
  HelpCircle,
  AlertCircle,
  Lock,
  Info,
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';

// Operational Work Stages (strictly professional-controlled)
const WORK_STAGES = [
  { key: 'PREPARING', label: 'Preparing', desc: 'Gathering tools & materials', icon: Wrench },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'En route to customer location', icon: Truck },
  { key: 'WORK_STARTED', label: 'Work Started', desc: 'Service execution underway', icon: Clock },
  { key: 'WORK_COMPLETED', label: 'Work Completed', desc: 'Service finished by pro', icon: CheckCircle2 },
];

// Financial Escrow Stages (strictly customer-controlled)
const PAYMENT_STAGES = [
  { key: 'PAYMENT_PENDING', label: 'Escrow Pending', desc: 'Deposit by customer awaited' },
  { key: 'PAYMENT_SECURED', label: 'Escrow Secured', desc: 'Safely locked in Vaziro Escrow' },
  { key: 'READY_FOR_RELEASE', label: 'Ready for Release', desc: 'Customer inspected & approved' },
  { key: 'RELEASED', label: 'Payment Released', desc: 'Funds transferred to partner' },
];

export const JobTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingEscrow, setPayingEscrow] = useState(false);
  const [escrowMessage, setEscrowMessage] = useState<string | null>(null);

  // Masked Call Modal
  const [callModal, setCallModal] = useState(false);
  const [callSession, setCallSession] = useState<any>(null);
  const [callLoading, setCallLoading] = useState(false);

  // Dispute Modal
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Quality not as expected');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Review Modal
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Invoice Modal
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Payment button progression state
  const [paymentState, setPaymentState] = useState<'IDLE' | 'CREATING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');

  const fetchJob = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getJobDetails(id);
      if (res.data?.data) {
        setJob(res.data.data);
      }
    } catch (err: any) {
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const isCustomer = Boolean(
    user?.id === (job?.customer as any)?.userId ||
    user?.id === (job?.customer as any)?.user ||
    user?.id === (job?.customer as any)?.id ||
    user?.roles?.includes('CUSTOMER')
  );

  const isHiredProfessional = Boolean(
    (job?.professional as any)?.userId === user?.id ||
    (job?.professional as any)?.user?.id === user?.id ||
    (user?.roles?.includes('PROFESSIONAL') && (job?.professional as any)?.id === (user as any)?.professionalProfile?.id)
  );

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Payment protection status
  const currentPaymentStatus = (job?.paymentStatus as string) || (
    job?.payments?.some((p: any) => p.status === 'COMPLETED' || p.status === 'RELEASED')
      ? 'RELEASED'
      : job?.payments?.some((p: any) => p.status === 'SECURED')
      ? 'PAYMENT_SECURED'
      : 'PAYMENT_PENDING'
  );

  const isPaymentSecured = currentPaymentStatus === 'PAYMENT_SECURED' || currentPaymentStatus === 'READY_FOR_RELEASE' || currentPaymentStatus === 'RELEASED';
  const isDisputed = currentPaymentStatus === 'DISPUTED' || job?.status === 'DISPUTED';

  // Work stage status
  const currentWorkStatus = (job?.workStatus as string) || (
    job?.status === 'SERVICE_COMPLETED' || job?.status === 'CUSTOMER_APPROVED' || job?.status === 'COMPLETED'
      ? 'WORK_COMPLETED'
      : job?.status === 'SERVICE_STARTED'
      ? 'WORK_STARTED'
      : job?.status === 'ON_THE_WAY' || job?.status === 'ARRIVED'
      ? 'ON_THE_WAY'
      : 'PREPARING'
  );

  const handleDepositEscrow = async () => {
    if (!job) return;
    try {
      setPayingEscrow(true);
      setPaymentState('CREATING');
      setEscrowMessage(null);

      // 1. Create order on backend
      const orderRes = await api.createPaymentOrder(job.id, job.agreedPrice, 'RAZORPAY');
      if (!orderRes.data?.data) {
        throw new Error('Failed to create payment order.');
      }

      const { orderId, amount, keyId, customerName, email, phone, paymentId: internalPaymentId } = orderRes.data.data;

      // 2. Open official Razorpay Checkout modal
      setPaymentState('PROCESSING');
      const paymentResponse = await openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        name: 'Vaziro™ Escrow Deposit',
        description: `100% Escrow Protection for Job #${job.id.substring(0, 8).toUpperCase()}`,
        prefill: {
          name: customerName,
          email,
          contact: phone,
        },
      });

      // 3. Cryptographically verify signature and secure funds in escrow
      setPaymentState('PROCESSING');
      const verifyRes = await api.verifyJobPayment({
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        jobId: job.id,
        internalPaymentId,
      });

      if (verifyRes.data?.success) {
        setPaymentState('SUCCESS');
        navigate(
          `/payment/success?paymentId=${encodeURIComponent(paymentResponse.razorpay_payment_id)}&orderId=${encodeURIComponent(paymentResponse.razorpay_order_id)}&amount=${job.agreedPrice}&jobId=${job.id}&type=job`
        );
      }
    } catch (err: any) {
      setPaymentState('FAILED');
      if (err.message?.includes('cancelled')) {
        setEscrowMessage('Payment was cancelled. You can deposit escrow whenever you are ready.');
      } else {
        setEscrowMessage(err.response?.data?.error?.message || err.message || 'Payment failed.');
      }
    } finally {
      setPayingEscrow(false);
    }
  };

  // Operational Work Status (Professional only)
  const handleUpdateWorkStatus = async (newWorkStatus: string) => {
    if (!job) return;
    try {
      setUpdating(true);
      setError(null);
      await api.updateJobWorkStatus(job.id, newWorkStatus);
      await fetchJob();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update work status');
    } finally {
      setUpdating(false);
    }
  };

  // Customer Completion Confirmation
  const handleConfirmCompletion = async () => {
    if (!job) return;
    try {
      setUpdating(true);
      setError(null);
      await api.confirmJobCompletion(job.id);
      await fetchJob();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to confirm completion');
    } finally {
      setUpdating(false);
    }
  };

  // Customer Payment Release (Customer only)
  const handleReleasePayment = async () => {
    if (!job) return;
    try {
      setUpdating(true);
      setError(null);
      await api.releasePayment(job.id);
      await fetchJob();
      setReviewModal(true); // Open review dialogue upon payment release
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to release payment');
    } finally {
      setUpdating(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!job) return;
    try {
      setCallLoading(true);
      const res = await api.initiateMaskedCall(job.id);
      if (res.data?.data) {
        setCallSession(res.data.data);
        setCallModal(true);
      }
    } catch (err: any) {
      alert('Could not initiate masked call bridge.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    try {
      setSubmittingDispute(true);
      await api.raiseJobDispute(job.id, disputeReason, disputeDesc);
      setDisputeModal(false);
      await fetchJob();
    } catch (err: any) {
      alert('Failed to submit dispute: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    try {
      setSubmittingReview(true);
      await api.createReview({
        jobId: job.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModal(false);
      await fetchJob();
    } catch (err: any) {
      alert('Failed to submit review: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleViewInvoice = async () => {
    if (!job) return;
    try {
      const res = await api.getInvoice(job.id);
      if (res.data?.data) {
        setInvoiceData(res.data.data);
        setInvoiceModal(true);
      }
    } catch (err) {
      alert('Invoice will be available once payment is released.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading service execution tracker...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-neutral-200 text-center shadow-xl space-y-4">
        <ShieldCheck className="w-12 h-12 text-black mx-auto" />
        <h2 className="text-2xl font-black text-black">Sign In Required</h2>
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          Please sign in to your account to view this job milestone and tracking details.
        </p>
        <button
          onClick={() => openAuthModal()}
          className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">Job Not Found</h2>
        <Link to="/dashboard" className="mt-4 inline-block text-emerald-600 font-semibold hover:underline">
          Return to dashboard →
        </Link>
      </div>
    );
  }

  const workStageIndex = WORK_STAGES.findIndex((s) => s.key === currentWorkStatus);
  const paymentStageIndex = PAYMENT_STAGES.findIndex((s) => s.key === currentPaymentStatus);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner: Job Title & Contract Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Job #{job.id.substring(0, 8).toUpperCase()}
              </span>
              {job.paymentProtectionEnabled && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Vaziro Payment Protected
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {job.requirement?.title || 'Service Requirement'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Category: {job.requirement?.category?.name} • Location: {job.requirement?.city?.name || 'India'}
              {(() => {
                const req = job.requirement as any;
                const pin = typeof req?.pincode === 'string' ? req.pincode : req?.pincode?.pincode || (req?.pincodeId && req.pincodeId.length === 6 && !req.pincodeId.includes('-') ? req.pincodeId : null);
                return pin ? `, ${pin}` : '';
              })()}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shrink-0 text-right">
            <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">Agreed Contract Price</div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-0.5">
              ₹{job.agreedPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1">
              Work: {currentWorkStatus.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Communication & Invoicing Action Bar */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            In-App Chat
          </Link>

          <button
            onClick={handleInitiateCall}
            disabled={callLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            {callLoading ? 'Connecting...' : 'Masked Virtual Call'}
          </button>

          <button
            onClick={handleViewInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            GST Tax Invoice
          </button>

          {!isDisputed && currentPaymentStatus !== 'RELEASED' && (
            <button
              onClick={() => setDisputeModal(true)}
              className="ml-auto inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Issue / Dispute
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {escrowMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{escrowMessage}</span>
        </div>
      )}

      {/* DISPUTED BANNER */}
      {isDisputed && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-red-800 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-red-950">Job in Dispute — Escrow Frozen</span>
                <span className="text-[10px] uppercase font-bold bg-red-200 text-red-900 px-2.5 py-0.5 rounded-full">
                  Under Mediation
                </span>
              </div>
              <p className="text-xs text-red-800 mt-1 max-w-2xl leading-relaxed">
                A formal dispute was raised for this job. Escrow funds of ₹{job.agreedPrice.toLocaleString('en-IN')} are locked securely under Vaziro Payment Protection. A Vaziro mediation officer is reviewing the communication history and photos to resolve this.
              </p>
              {job.disputeReason && (
                <div className="mt-2 text-xs text-red-900 font-semibold bg-red-100/70 p-2.5 rounded-xl">
                  Dispute Reason: {job.disputeReason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ESCROW STATUS BANNER */}
      {job.paymentProtectionEnabled && isPaymentSecured && !isDisputed && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-black text-white rounded-2xl p-6 shadow-md mb-8 border border-emerald-800/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">100% Escrow Protection Active</span>
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    {currentPaymentStatus === 'RELEASED' ? 'Released to Partner' : 'Secured in Escrow'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {currentPaymentStatus === 'RELEASED'
                    ? 'Payment has been released and transferred to the professional.'
                    : '₹' + job.agreedPrice.toLocaleString('en-IN') + ' is safely held in Vaziro Escrow. Only the customer can release payment upon work inspection.'}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10 text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold block">Escrow Amount</span>
              <span className="text-xl font-black text-white">₹{job.agreedPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ACTION 1: DEPOSIT ESCROW (If pending) */}
      {isCustomer && job.paymentProtectionEnabled && !isPaymentSecured && !isDisputed && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-amber-950">Escrow Deposit Required</span>
                  <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Customer Action
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 max-w-xl leading-relaxed">
                  Deposit the agreed contract amount of <strong className="font-bold text-amber-950">₹{job.agreedPrice.toLocaleString('en-IN')}</strong> via Razorpay. Your money stays 100% protected in Vaziro Escrow and cannot be released without your approval.
                </p>
              </div>
            </div>

            <button
              onClick={handleDepositEscrow}
              disabled={payingEscrow}
              className="w-full sm:w-auto shrink-0 bg-black hover:bg-neutral-800 active:scale-95 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 border border-black cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              {paymentState === 'CREATING'
                ? 'Creating secure payment...'
                : paymentState === 'PROCESSING'
                ? 'Processing payment...'
                : paymentState === 'SUCCESS'
                ? 'Payment Successful'
                : paymentState === 'FAILED'
                ? 'Payment Failed — Retry'
                : `Pay ₹${job.agreedPrice.toLocaleString('en-IN')} with Razorpay`}
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER ACTION 2: WORK COMPLETION INSPECTION & CONFIRMATION */}
      {isCustomer && currentWorkStatus === 'WORK_COMPLETED' && currentPaymentStatus !== 'RELEASED' && !isDisputed && (
        <div className="bg-emerald-50/80 border-2 border-emerald-500 rounded-2xl p-6 sm:p-7 shadow-md mb-8 ring-4 ring-emerald-500/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Verification Required
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">
                  Has the work been completed?
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-xl leading-relaxed">
                  The professional marked this service as finished. Please verify the completed work before releasing escrow payment. If satisfied, confirm completion below to authorize payment release.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto shrink-0">
              {currentPaymentStatus === 'READY_FOR_RELEASE' ? (
                <button
                  onClick={handleReleasePayment}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Release Payment (₹{job.agreedPrice.toLocaleString('en-IN')})
                </button>
              ) : (
                <>
                  <button
                    onClick={handleConfirmCompletion}
                    disabled={updating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Confirm Work Completed
                  </button>
                  <button
                    onClick={() => setDisputeModal(true)}
                    disabled={updating}
                    className="bg-white hover:bg-red-50 text-red-700 border border-red-300 font-bold text-xs px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Work Not Completed / Report Issue
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ACTION 3: RELEASE PAYMENT BUTTON (When confirmed and ready) */}
      {isCustomer && currentPaymentStatus === 'READY_FOR_RELEASE' && !isDisputed && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Ready for Release</span>
            <h4 className="text-base font-extrabold text-gray-900 mt-0.5">
              Work Confirmed by You • Release Escrow
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Click below to transfer the ₹{job.agreedPrice.toLocaleString('en-IN')} escrow balance directly to the professional's account.
            </p>
          </div>
          <button
            onClick={handleReleasePayment}
            disabled={updating}
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Release Payment (₹{job.agreedPrice.toLocaleString('en-IN')})
          </button>
        </div>
      )}

      {/* SECTION 1: WORK EXECUTION MILESTONES (Controlled by Professional) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Service Work Execution Stages</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Operational Tracking
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Strictly updated by the hired service professional at each physical phase of delivery.
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Work Phase</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {currentWorkStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Work Step Progression Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {WORK_STAGES.map((step, idx) => {
            const isCompleted = workStageIndex > idx || currentWorkStatus === 'WORK_COMPLETED';
            const isCurrent = currentWorkStatus === step.key;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900'
                    : 'border-gray-200 bg-gray-50/40 text-gray-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-950' : 'text-gray-900'}`}>
                    {step.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Professional Work Advancement Controls */}
        {(isHiredProfessional || isAdmin) && (
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">Professional Actions:</span>
              <p className="text-xs text-gray-600 mt-0.5">
                Keep the customer updated by clicking your active work stage.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {currentWorkStatus === 'PREPARING' && (
                <button
                  onClick={() => handleUpdateWorkStatus('ON_THE_WAY')}
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Mark On The Way
                </button>
              )}

              {currentWorkStatus === 'ON_THE_WAY' && (
                <button
                  onClick={() => handleUpdateWorkStatus('WORK_STARTED')}
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  Mark Work Started
                </button>
              )}

              {currentWorkStatus === 'WORK_STARTED' && (
                <button
                  onClick={() => handleUpdateWorkStatus('WORK_COMPLETED')}
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Work Completed
                </button>
              )}

              {currentWorkStatus === 'WORK_COMPLETED' && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Work Completed! Waiting for customer confirmation & escrow release.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer view notice: Cannot advance work status */}
        {isCustomer && !isAdmin && (
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Work stages are updated in real-time by your verified service professional.</span>
          </div>
        )}
      </div>

      {/* SECTION 2: PAYMENT & ESCROW FLOW (Controlled by Customer) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Escrow Payment Protection Milestones</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Customer Authorized
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Escrow funds cannot be released by the professional. Releasing payment is strictly gated by customer confirmation.
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Payment State</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {currentPaymentStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Payment Stage Progression */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {PAYMENT_STAGES.map((pStep, idx) => {
            const isCompleted = paymentStageIndex > idx || currentPaymentStatus === 'RELEASED';
            const isCurrent = currentPaymentStatus === pStep.key;

            return (
              <div
                key={pStep.key}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900'
                    : 'border-gray-200 bg-gray-50/40 text-gray-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </div>
                  )}
                  <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-950' : 'text-gray-900'}`}>
                    {pStep.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{pStep.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Escrow Role Separation Callout */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-3">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong>Vaziro Escrow Safety Guarantee:</strong>
            {isHiredProfessional ? (
              <span className="ml-1">
                Your payment of ₹{job.agreedPrice.toLocaleString('en-IN')} is locked in escrow. Once the customer confirms work completion, funds are immediately routed to your bank account. Service professionals do not have access to manually release escrow funds.
              </span>
            ) : (
              <span className="ml-1">
                You maintain complete control of your funds. Never pay the professional directly outside the platform. Release payment only after inspecting the finished service.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status History Audit Log Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
          Audited Status History Log
        </h3>
        {job.statusHistory && job.statusHistory.length > 0 ? (
          <div className="space-y-3">
            {job.statusHistory.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-xs border-l-2 border-emerald-500 pl-3 py-1">
                <div>
                  <span className="font-bold text-gray-900">{entry.newStatus}</span>
                  {entry.reason && <p className="text-gray-600 mt-0.5">{entry.reason}</p>}
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(entry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Job milestones and timestamped audits will appear here.</p>
        )}
      </div>

      {/* MASKED CALLING BRIDGE MODAL */}
      {callModal && callSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-7 h-7 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Connecting Virtual Masked Bridge</h3>
            <p className="text-xs text-gray-500 mt-1">
              Your personal mobile number remains 100% private.
            </p>

            <div className="my-5 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Virtual Bridge Number:</span>
                <span className="font-bold text-emerald-800">{callSession.maskedVirtualNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold text-gray-900">Exotel / Cloud PBX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Session ID:</span>
                <span className="font-mono text-gray-600">{callSession.providerSessionId}</span>
              </div>
            </div>

            <button
              onClick={() => setCallModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Report Issue / Raise Dispute</h3>
              <button onClick={() => setDisputeModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmitDispute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="Work not completed">Work not completed / Incomplete</option>
                  <option value="Quality not as expected">Service quality not as expected</option>
                  <option value="Professional did not arrive">Professional did not arrive</option>
                  <option value="Unprofessional behavior">Unprofessional conduct</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Explain what occurred in detail. A Vaziro Support Specialist will arbitrate and hold escrow funds..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Formal Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFIED REVIEW MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Review Your Experience</h3>
            <p className="text-xs text-gray-500 mb-4">Rate the professional to help maintain quality on Vaziro.</p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the punctuality, hygiene, and work quality?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GST INVOICE MODAL */}
      {invoiceModal && invoiceData?.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">Tax Invoice (India)</span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {invoiceData.invoice.invoiceNumber}
                </h3>
              </div>
              <button onClick={() => setInvoiceModal(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="text-xs text-gray-600 space-y-3">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 font-semibold block text-[10px]">ISSUED BY</span>
                  <span className="font-bold text-gray-900">Proanta Technologies Private Limited</span>
                  <p className="text-[11px] text-gray-500">vaziro.in • GSTIN: 29AABCP1234F1Z9</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[10px]">JOB REFERENCE</span>
                  <span className="font-bold text-gray-900">Job #{job.id.substring(0, 8)}</span>
                  <p className="text-[11px] text-gray-500">Date: {new Date(invoiceData.invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-right">Taxable (₹)</th>
                    <th className="p-2.5 text-right">GST (18%)</th>
                    <th className="p-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.invoice.items?.map((item: any) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="p-2.5">{item.description}</td>
                      <td className="p-2.5 text-right">₹{item.unitPrice}</td>
                      <td className="p-2.5 text-right">18%</td>
                      <td className="p-2.5 text-right font-bold">₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Taxable Platform Fee (6%):</span>
                  <span>₹{invoiceData.invoice.taxableAmount}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>CGST (9%):</span>
                  <span>₹{invoiceData.invoice.cgstAmount}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>SGST (9%):</span>
                  <span>₹{invoiceData.invoice.sgstAmount}</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-950 pt-1 border-t border-emerald-200">
                  <span>Total Platform Invoice:</span>
                  <span>₹{invoiceData.invoice.taxableAmount + invoiceData.invoice.cgstAmount + invoiceData.invoice.sgstAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInvoiceModal(false)}
              className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTrackerPage;
