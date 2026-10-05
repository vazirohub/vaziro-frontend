import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { VerificationStatus } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ProfileVerificationCardProps {
  onVerificationUpdate?: () => void;
  className?: string;
}

export const ProfileVerificationCard: React.FC<ProfileVerificationCardProps> = ({
  onVerificationUpdate,
  className = '',
}) => {
  const [status, setStatus] = useState<VerificationStatus>('NOT_STARTED');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getVerificationStatus();
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setStatus(data.status as VerificationStatus);
        setIsVerified(Boolean(data.isVerified));
        setVerifiedAt(data.verifiedAt || null);
        setFailureReason(data.failureReason || null);
        setReviewReason(data.reviewReason || null);
      }
    } catch {
      // Fallback: remains NOT_STARTED if profile not yet loaded
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStartVerification = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await api.startVerification();
      if (res.data?.data?.authUrl) {
        // Redirect to official DigiLocker / API Setu / MeriPehchaan portal
        window.location.href = res.data.data.authUrl;
        return;
      }
      setActionError("We're unable to connect to the verification service right now. Please try again later.");
    } catch (err: any) {
      setActionError(
        err.response?.data?.error?.message ||
        "We're unable to connect to the verification service right now. Please try again later."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryVerification = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await api.retryVerification();
      if (res.data?.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
        return;
      }
      setActionError("We're unable to connect to the verification service right now. Please try again later.");
    } catch (err: any) {
      setActionError(
        err.response?.data?.error?.message ||
        "We're unable to connect to the verification service right now. Please try again later."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm flex items-center justify-center min-h-[140px] ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading verification records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-black tracking-tight">Profile Verification</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verify your identity through DigiLocker to build trust with customers.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-center">
          {status === 'VERIFIED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ✓ Verified via DigiLocker
            </span>
          )}
          {status === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Verification In Progress
            </span>
          )}
          {status === 'FAILED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-800 bg-red-50 border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              Verification Incomplete
            </span>
          )}
          {status === 'REVIEW_REQUIRED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Under Review
            </span>
          )}
          {status === 'EXPIRED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-300">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-500" />
              Verification Expired
            </span>
          )}
          {status === 'NOT_STARTED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-neutral-600 bg-neutral-100 border border-neutral-200">
              Not Verified
            </span>
          )}
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* STATE 1: NOT_STARTED */}
      {status === 'NOT_STARTED' && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed font-medium">
            Your identity has not been verified yet. Verified service partners receive 3x more quotation responses and prominent customer trust badges.
          </p>
          <div>
            <button
              type="button"
              onClick={handleStartVerification}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to DigiLocker...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify with DigiLocker</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: PENDING */}
      {status === 'PENDING' && (
        <div className="space-y-4 bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-amber-900">Your DigiLocker verification is in progress.</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                We are awaiting completion of your government authorization session. If you closed the window, you can resume your verification below.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartVerification}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>Resume DigiLocker Session</span>
            </button>
            <button
              type="button"
              onClick={fetchStatus}
              className="inline-flex items-center gap-1.5 text-amber-900 hover:text-black text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: VERIFIED */}
      {status === 'VERIFIED' && (
        <div className="space-y-3 bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/60">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-emerald-900">✓ Verified via DigiLocker</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your identity has been successfully verified. The government verification badge is active on all your public quotes and profile cards.
              </p>
              {verifiedAt && (
                <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                  Verified on: {formatDate(verifiedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: FAILED */}
      {status === 'FAILED' && (
        <div className="space-y-4 bg-red-50/60 rounded-2xl p-4 border border-red-200/60">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-red-900">Your verification could not be completed.</h4>
              <p className="text-xs text-red-800 leading-relaxed">
                {failureReason || "We couldn't verify your identity. Please check your details and try again."}
              </p>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleRetryVerification}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 5: REVIEW_REQUIRED */}
      {status === 'REVIEW_REQUIRED' && (
        <div className="space-y-3 bg-blue-50/60 rounded-2xl p-4 border border-blue-200/60">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-blue-900">Your verification requires manual review by Vaziro.</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {reviewReason || 'Your verification requires additional review. We will update your status once the review is complete.'}
              </p>
              <p className="text-[11px] font-semibold text-blue-700 mt-1">
                Our support compliance team reviews cases within 24–48 hours. Retries are paused during this period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 6: EXPIRED */}
      {status === 'EXPIRED' && (
        <div className="space-y-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-neutral-900">Your previous verification has expired.</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Identity credentials must be renewed periodically to maintain active trust placement on customer quotes.
              </p>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleStartVerification}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Again</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
