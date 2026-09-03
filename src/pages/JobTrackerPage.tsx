import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';

const LIFECYCLE_STEPS = [
  { key: 'HIRED', label: 'Hired', desc: 'Agreement finalized' },
  { key: 'SCHEDULED', label: 'Scheduled', desc: 'Date & time set' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Gathering tools' },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'En route to location' },
  { key: 'ARRIVED', label: 'Arrived', desc: 'At service address' },
  { key: 'SERVICE_STARTED', label: 'In Progress', desc: 'Service execution' },
  { key: 'SERVICE_COMPLETED', label: 'Completed', desc: 'Delivery finished' },
  { key: 'CUSTOMER_APPROVED', label: 'Approved', desc: 'Quality verified' },
  { key: 'PAYMENT_RELEASED', label: 'Paid', desc: 'Funds transferred' },
];

export const JobTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const isCustomer = user?.id === job?.customer?.user && true; // or customer profile link
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  const handleUpdateStatus = async (newStatus: string) => {
    if (!job) return;
    try {
      setUpdating(true);
      setError(null);
      await api.updateJobStatus(job.id, newStatus);
      await fetchJob();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

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
      await api.raiseDispute({
        jobId: job.id,
        reason: disputeReason,
        description: disputeDesc,
      });
      setDisputeModal(false);
      await fetchJob();
    } catch (err: any) {
      alert('Failed to submit dispute: ' + err.message);
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
      alert('Failed to submit review: ' + err.message);
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
          className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition"
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

  // Calculate current stage index
  const currentStageIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === job.status);

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
              Category: {job.requirement?.category?.name} • Location: {job.requirement?.city?.name}, {job.requirement?.pincodeId || '560038'}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shrink-0 text-right">
            <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">Agreed Contract Price</div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-0.5">
              ₹{job.agreedPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1">
              Current Status: {job.status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Communication & Invoicing Action Bar (Section 32, 33, 40) */}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            {callLoading ? 'Connecting...' : 'Masked Virtual Call'}
          </button>

          <button
            onClick={handleViewInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            GST Tax Invoice
          </button>

          <button
            onClick={() => setDisputeModal(true)}
            className="ml-auto inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Raise Dispute
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* DISCRETE LIFECYCLE PROGRESSION (Section 28 & 29: No Fake GPS) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Service Delivery Stages</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real discrete stage milestones logged in audit history. (No simulated movement or fake GPS markers).
          </p>
        </div>

        {/* Step Progression Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-70'
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
                    {step.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-1">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stage Advancement Controls */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">Current Active Phase</span>
            <span className="text-base font-extrabold text-gray-900">
              {job.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Workflow Buttons */}
          <div className="flex flex-wrap gap-2">
            {job.status === 'HIRED' && (
              <button
                onClick={() => handleUpdateStatus('SCHEDULED')}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Confirm Scheduled
              </button>
            )}

            {job.status === 'SCHEDULED' && (
              <button
                onClick={() => handleUpdateStatus('PREPARING')}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Start Preparation
              </button>
            )}

            {job.status === 'PREPARING' && (
              <button
                onClick={() => handleUpdateStatus('ON_THE_WAY')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Start Travel (On The Way)
              </button>
            )}

            {job.status === 'ON_THE_WAY' && (
              <button
                onClick={() => handleUpdateStatus('ARRIVED')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Mark Arrived at Location
              </button>
            )}

            {job.status === 'ARRIVED' && (
              <button
                onClick={() => handleUpdateStatus('SERVICE_STARTED')}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Start Service Delivery
              </button>
            )}

            {job.status === 'SERVICE_STARTED' && (
              <button
                onClick={() => handleUpdateStatus('SERVICE_COMPLETED')}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm"
              >
                Mark Service Completed
              </button>
            )}

            {job.status === 'SERVICE_COMPLETED' && (
              <button
                onClick={handleReleasePayment}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5 animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Quality & Release Payment (₹{job.agreedPrice.toLocaleString('en-IN')})
              </button>
            )}

            {job.status === 'CUSTOMER_APPROVED' && (
              <button
                onClick={handleReleasePayment}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
              >
                Release Payment to Professional
              </button>
            )}

            {job.status === 'PAYMENT_RELEASED' && (
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                ✓ Payment Released Successfully & Order Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status History Audit Log Timeline (Section 28) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
          Audited Status History Log
        </h3>
        <div className="space-y-3">
          {job.statusHistory?.map((entry) => (
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
      </div>

      {/* MASKED CALLING BRIDGE MODAL (Section 33) */}
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

            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              Vaziro will dial both parties simultaneously and bridge the line. No personal phone numbers are shared.
            </p>

            <button
              onClick={() => setCallModal(false)}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL (Section 41) */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Raise a Formal Dispute</h3>
              <button onClick={() => setDisputeModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmitDispute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="Quality not as expected">Service quality not as expected</option>
                  <option value="Professional did not arrive">Professional did not arrive</option>
                  <option value="Scope incomplete">Scope left incomplete</option>
                  <option value="Unprofessional behavior">Unprofessional conduct</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Explain what occurred in detail. A Vaziro Support Specialist will arbitrate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Formal Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFIED REVIEW MODAL (Section 42) */}
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
                      className="p-1"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GST INVOICE MODAL (Section 39 & 40) */}
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
              <button onClick={() => setInvoiceModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
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
              className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
