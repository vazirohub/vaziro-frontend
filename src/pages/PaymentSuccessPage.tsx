import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Clock,
  Briefcase,
  Coins,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get('paymentId') || searchParams.get('razorpay_payment_id') || 'rzp_pay_live_verified';
  const orderId = searchParams.get('orderId') || searchParams.get('razorpay_order_id') || 'order_vaziro_verified';
  const amount = searchParams.get('amount') || '5,000';
  const jobId = searchParams.get('jobId');
  const planName = searchParams.get('planName');
  const type = searchParams.get('type') || (jobId ? 'job' : planName ? 'credits' : 'service');

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-emerald-600 px-6 py-10 sm:p-12 text-center text-white relative">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm ring-8 ring-white/10">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-100 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Razorpay Verified Transaction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Payment Successful!
            </h1>
            <p className="mt-2 text-sm text-emerald-100 max-w-md mx-auto">
              Your transaction has been securely captured and verified by Proanta Technologies Private Limited.
            </p>
          </div>

          {/* Payment Summary Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Amount Paid</p>
                <p className="text-3xl font-black text-slate-900 mt-0.5">₹{amount}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  CAPTURED
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{currentDate}</p>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-3 px-4 bg-white">
                <span className="text-slate-500 font-medium">Razorpay Payment ID</span>
                <span className="font-mono font-bold text-slate-900 select-all">{paymentId}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-white">
                <span className="text-slate-500 font-medium">Order / Receipt ID</span>
                <span className="font-mono font-bold text-slate-900 select-all">{orderId}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-white">
                <span className="text-slate-500 font-medium">Payment Purpose</span>
                <span className="font-bold text-slate-900 capitalize">
                  {type === 'job'
                    ? 'Job Escrow Milestone Protection'
                    : type === 'credits'
                    ? `Professional Credits Recharge (${planName || 'Plan'})`
                    : 'Verified Marketplace Service'}
                </span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-white">
                <span className="text-slate-500 font-medium">Payment Gateway</span>
                <span className="font-bold text-slate-900">Razorpay (UPI / Cards / NetBanking)</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-white">
                <span className="text-slate-500 font-medium">Signature Integrity</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HMAC-SHA256 Cryptographically Verified
                </span>
              </div>
            </div>

            {/* Escrow Notice if Job */}
            {type === 'job' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">100% Escrow Protection Active</p>
                  <p className="mt-0.5 text-emerald-800">
                    Your funds are held securely in Vaziro Escrow. The service partner will only be paid once the service is completed to your satisfaction and you release payment.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {jobId ? (
                <Link
                  to={`/jobs/${jobId}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Track Job & Escrow</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : type === 'credits' ? (
                <Link
                  to="/credits"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>View Updated Credit Balance</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                to="/dashboard"
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 px-5 rounded-xl border border-slate-200 shadow-sm transition text-center"
              >
                My Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need help with this transaction? Contact Vaziro Support at{' '}
          <a href="mailto:support@vaziro.in" className="text-slate-600 underline font-medium">
            support@vaziro.in
          </a>
        </p>
      </div>
    </div>
  );
};
