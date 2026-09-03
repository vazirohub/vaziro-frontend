import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Headphones,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || 'Order';
  const jobId = searchParams.get('jobId');
  const reason = searchParams.get('reason') || 'Transaction could not be completed or was cancelled by user.';

  const handleRetry = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
          {/* Header */}
          <div className="bg-rose-50 border-b border-rose-100 p-8 sm:p-10">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
              <AlertCircle className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold tracking-wide uppercase mb-2">
              Payment Incomplete
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment Could Not Be Completed
            </h1>
            <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
              No funds have been permanently deducted. You can safely retry your transaction.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-5 text-left">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status Reason:</span>
                <span className="text-rose-700 font-semibold">{reason}</span>
              </div>
            </div>

            {/* Why did this happen tip */}
            <div className="border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Common Reasons for Incomplete Transactions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
                <li>UPI App request timed out or cancelled on your mobile phone</li>
                <li>Temporary bank OTP or server downtime</li>
                <li>Insufficient bank balance or card international/online limits</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3.5 px-5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment Securely</span>
              </button>

              <Link
                to="/dashboard"
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 px-5 rounded-xl border border-slate-200 shadow-sm transition text-center flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Support Callout */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            If money was debited from your bank, Razorpay automatically initiates an auto-refund within 24-48 business hours.
          </p>
          <a
            href="mailto:support@vaziro.in"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-2"
          >
            <Headphones className="w-3.5 h-3.5" />
            Contact Vaziro Payment Support (support@vaziro.in)
          </a>
        </div>
      </div>
    </div>
  );
};
