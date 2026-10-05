import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight, Clock } from 'lucide-react';

export const DigiLockerCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'REVIEW_REQUIRED' | 'ERROR'>('PROCESSING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error') || searchParams.get('error_description');

    if (errorParam) {
      setStatus('ERROR');
      if (
        errorParam.toLowerCase().includes('cancel') ||
        errorParam.toLowerCase().includes('access_denied') ||
        errorParam.toLowerCase().includes('denied')
      ) {
        setErrorMessage("Verification was cancelled. You can try again whenever you're ready.");
      } else {
        setErrorMessage("We couldn't verify your identity. Please check your details and try again.");
      }
      return;
    }

    if (!code || !state) {
      setStatus('ERROR');
      setErrorMessage("Your verification session expired. Please start verification again.");
      return;
    }

    // Call backend to exchange code and record verified status
    api.completeVerification(code, state)
      .then((res) => {
        if (res.data?.success) {
          const vData = res.data.data;
          setVerificationData(vData);

          if (vData?.verificationStatus === 'REVIEW_REQUIRED') {
            setStatus('REVIEW_REQUIRED');
          } else {
            setStatus('SUCCESS');
          }

          // Update user profile in local auth context
          api.getMe().then((meRes) => {
            if (meRes.data?.data?.user) {
              updateUser(meRes.data.data.user);
            }
          }).catch(() => {});

          // Auto-redirect to dashboard after 4 seconds if successful
          if (vData?.verificationStatus !== 'REVIEW_REQUIRED') {
            setTimeout(() => {
              navigate('/dashboard');
            }, 4000);
          }
        } else {
          setStatus('ERROR');
          setErrorMessage(
            res.data?.message || "We couldn't verify your identity. Please check your details and try again."
          );
        }
      })
      .catch((err: any) => {
        setStatus('ERROR');
        const rawErr = (err.response?.data?.error?.message || err.message || '').toLowerCase();

        if (rawErr.includes('expired') || rawErr.includes('timeout')) {
          setErrorMessage("Your verification session expired. Please start verification again.");
        } else if (rawErr.includes('network') || rawErr.includes('connect') || rawErr.includes('service unavailable')) {
          setErrorMessage("We're unable to connect to the verification service right now. Please try again later.");
        } else if (rawErr.includes('review')) {
          setStatus('REVIEW_REQUIRED');
        } else if (rawErr.includes('cancel')) {
          setErrorMessage("Verification was cancelled. You can try again whenever you're ready.");
        } else {
          setErrorMessage("We couldn't verify your identity. Please check your details and try again.");
        }
      });
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Processing State */}
        {status === 'PROCESSING' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">Verifying DigiLocker Credentials</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Communicating with National API Setu / MeriPehchaan to confirm government identity records...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digital India • MeitY • DigiLocker</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'SUCCESS' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">✓ Identity Verified Successfully!</h2>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Your professional profile is now officially verified via DigiLocker. You will receive priority placement and the verified shield badge on all your quotations.
              </p>
            </div>

            {verificationData?.verifiedName && (
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Verified Name:</span>
                  <span className="font-bold text-black">{verificationData.verifiedName}</span>
                </div>
                {verificationData?.digiLockerId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">DigiLocker Reference:</span>
                    <span className="font-mono text-[11px] text-neutral-700">{verificationData.digiLockerId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">Badge Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    ✓ Verified via DigiLocker
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Review Required State */}
        {status === 'REVIEW_REQUIRED' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">Verification Under Review</h2>
              <p className="text-xs text-neutral-600 mt-1.5 font-medium leading-relaxed">
                Your verification requires additional review by Vaziro. We will update your status once the review is complete.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'ERROR' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">Verification Incomplete</h2>
              <p className="text-xs text-red-600 mt-1.5 font-medium leading-relaxed">
                {errorMessage || "We couldn't verify your identity. Please check your details and try again."}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/profile"
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition text-center"
              >
                Try Again
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
