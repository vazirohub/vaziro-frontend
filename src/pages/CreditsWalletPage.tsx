import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreditWallet, CreditPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { Coins, Check, ShieldCheck, ArrowUpRight, ArrowDownLeft, Sparkles, CreditCard, RefreshCw } from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';

export const CreditsWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, plansRes] = await Promise.all([
        api.getCreditWallet().catch(() => null),
        api.getCreditPlans(),
      ]);

      if (walletRes?.data?.data) {
        setWallet(walletRes.data.data);
      }
      if (plansRes?.data?.data) {
        setPlans(plansRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handlePurchase = async (plan: CreditPlan) => {
    if (!isAuthenticated) {
      openAuthModal('PROFESSIONAL');
      return;
    }

    try {
      setPurchasingPlan(plan.id);
      setMessage(null);

      // 1. Create Razorpay order on backend
      const orderRes = await api.createCreditOrder(plan.id);
      if (!orderRes.data?.data) {
        throw new Error('Could not initiate payment order.');
      }

      const { orderId, amount, keyId, user: userInfo } = orderRes.data.data;

      // 2. Open official Razorpay Checkout modal
      const paymentResponse = await openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        name: 'Vaziro™ Partner Credits',
        description: `${plan.name} Pack — ${plan.creditsCount} Application Credits`,
        prefill: {
          name: userInfo?.name || `${user?.firstName} ${user?.lastName}`,
          email: userInfo?.email || user?.email,
          contact: userInfo?.phone || user?.phone,
        },
      });

      // 3. Cryptographically verify signature on backend and award credits
      const verifyRes = await api.verifyCreditPayment({
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        planId: plan.id,
      });

      if (verifyRes.data?.success) {
        navigate(
          `/payment/success?paymentId=${encodeURIComponent(paymentResponse.razorpay_payment_id)}&orderId=${encodeURIComponent(paymentResponse.razorpay_order_id)}&amount=${plan.price}&planName=${encodeURIComponent(plan.name)}&type=credits`
        );
      }
    } catch (err: any) {
      if (err.message?.includes('cancelled')) {
        setMessage('Payment was cancelled. No amount was charged.');
      } else {
        setMessage(err.response?.data?.error?.message || err.message || 'Failed to complete credit purchase');
      }
    } finally {
      setPurchasingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading Vaziro Credit Wallet...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-neutral-200 text-center shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Coins className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-black">Sign In to View Wallet</h2>
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          Please sign in to view your real-time credit balance, transaction history, and choose a recharge plan.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('PROFESSIONAL', undefined, 'LOGIN')}
            className="flex-1 bg-black hover:bg-neutral-800 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            Register as Pro
          </button>
        </div>
      </div>
    );
  }

  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Customers should NEVER see credit wallets, packs, or pricing
  if (user && !isProfessional && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-neutral-200 text-center shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Customer Account
          </span>
          <h1 className="text-2xl font-black text-black tracking-tight mt-3">
            Posting Requirements is 100% Free
          </h1>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-medium">
            Credit wallets and application packs are used exclusively by <strong>Service Professionals</strong> to submit quotes. As a customer, you never pay to post requirements or receive verified quotes.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/post-requirement"
            className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition"
          >
            Post a Requirement (Free)
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-6 py-3.5 rounded-2xl font-bold text-xs transition"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 10;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Professional Credit Wallet
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Credits are used by professionals to apply and quote on customer requirements. No fixed commission upfront.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Wallet Balance Cards (Section 17 & 21) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Current Available Balance</span>
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-4xl font-extrabold">
              {balance} <span className="text-sm font-normal text-emerald-100">Credits</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/40 text-xs text-emerald-100">
            Nominal Value: ~₹{(balance * 50).toLocaleString('en-IN')} INR
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Lifetime Purchased
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {wallet?.lifetimePurchased ?? 0} <span className="text-xs text-gray-500 font-normal">Credits</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Across plan subscriptions
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Lifetime Spent
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {wallet?.lifetimeSpent ?? 0} <span className="text-xs text-gray-500 font-normal">Credits</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4 text-amber-600" /> Spent on customer job proposals
          </div>
        </div>
      </div>

      {/* Credit Plans (Section 20) */}
      <div className="mb-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Choose Your Credit Plan
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Recharge your credit wallet to quote on higher-value requirements and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition relative ${
                plan.isRecommended
                  ? 'bg-white border-2 border-emerald-600 shadow-lg ring-4 ring-emerald-500/10'
                  : 'bg-white border border-gray-200 shadow-sm hover:border-gray-300'
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                  RECOMMENDED
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-gray-900 text-base">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center mb-4">
                  <span className="text-xl font-extrabold text-emerald-950 block">{plan.creditsCount}</span>
                  <span className="text-[11px] text-emerald-800 font-medium">Credits Included</span>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Apply to verified requirements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>In-app chat & masked calling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{plan.perks || 'Standard profile visibility'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={purchasingPlan === plan.id}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${
                  plan.isRecommended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                {purchasingPlan === plan.id ? 'Processing...' : plan.price === 0 ? 'Current Plan' : `Get ${plan.name} Plan`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Ledger History (Section 21) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Credit Ledger History</h3>
          <span className="text-xs text-gray-400">Audited Immutable Log</span>
        </div>

        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {wallet.transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-900 block">{tx.transactionType.replace(/_/g, ' ')}</span>
                  <p className="text-gray-500 mt-0.5 text-[11px]">{tx.notes || 'Transaction recorded'}</p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-extrabold text-sm ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Balance: {tx.balanceAfter} cr
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No transactions recorded yet.</p>
        )}
      </div>
    </div>
  );
};
