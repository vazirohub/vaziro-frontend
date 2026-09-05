import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  DetailedCreditWallet,
  ProfessionalPlan,
  CreditBatch,
  CreditLedgerItem,
  ProfessionalTransaction,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Check,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CreditCard,
  RefreshCw,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  History,
  RotateCcw,
  ExternalLink,
  Wallet,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';

export const CreditsWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const plansSectionRef = useRef<HTMLDivElement>(null);

  const [wallet, setWallet] = useState<DetailedCreditWallet | null>(null);
  const [plans, setPlans] = useState<ProfessionalPlan[]>([]);
  const [batches, setBatches] = useState<CreditBatch[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerItem[]>([]);
  const [transactions, setTransactions] = useState<ProfessionalTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'transactions' | 'batches' | 'ledger'>('plans');
  const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'CREDIT' | 'PAYMENT' | 'REFUND'>('ALL');
  const [loading, setLoading] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, plansRes, batchesRes, ledgerRes, txRes] = await Promise.all([
        api.getCreditWallet().catch(() => null),
        api.getCreditPlans().catch(() => null),
        api.getCreditBatches().catch(() => null),
        api.getCreditLedger().catch(() => null),
        api.getProfessionalTransactions().catch(() => null),
      ]);

      if (walletRes?.data?.data) {
        setWallet(walletRes.data.data);
      }
      if (plansRes?.data?.data) {
        setPlans(plansRes.data.data);
      }
      if (batchesRes?.data?.data) {
        setBatches(batchesRes.data.data);
      }
      if (ledgerRes?.data?.data) {
        setLedger(ledgerRes.data.data);
      }
      if (txRes?.data?.data?.transactions) {
        setTransactions(txRes.data.data.transactions);
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

  const handlePurchase = async (plan: ProfessionalPlan) => {
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
        name: 'Vaziro™ Professional Plan',
        description: `${plan.name} Plan — ${plan.totalCredits} Credits (${plan.visibilityTier} Visibility)`,
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
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading Vaziro Credit Wallet & History...</p>
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
          Please sign in to view your real-time credit balance, batch validity, and choose a Vaziro Professional Plan.
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
            Credit wallets and application plans are used exclusively by <strong>Service Professionals</strong> to submit quotes. As a customer, you never pay to post requirements or receive verified quotes.
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
  const creditValue = wallet?.creditValueInr ?? balance * 10;
  const purchased = wallet?.purchasedCredits ?? 0;
  const bonus = wallet?.bonusCredits ?? 0;
  const expiringSoon = wallet?.creditsExpiringSoon ?? wallet?.expiringCredits90Days ?? wallet?.expiringCredits30Days ?? 0;
  const tier = wallet?.visibilityTier ?? 'STANDARD';

  const getTransactionCategory = (tx: ProfessionalTransaction): 'CREDIT' | 'PAYMENT' | 'REFUND' => {
    if (tx.category) return tx.category;
    if (tx.type.includes('REFUND')) return 'REFUND';
    if (tx.type.includes('PAYMENT') || tx.type.includes('TRANSFER')) return 'PAYMENT';
    return 'CREDIT';
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (transactionFilter === 'ALL') return true;
    const cat = getTransactionCategory(tx);
    return cat === transactionFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Professional Credit Wallet & History
            </h1>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {tier} Visibility
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            1 Credit = ₹10. Full credit refund guarantee if customer chooses another professional or if requirement expires.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">Wallet Quick Actions</div>
            <div className="text-sm font-bold text-white">
              {balance} Available Credits (₹{creditValue.toLocaleString('en-IN')} Value)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveTab('plans');
              setTimeout(() => {
                plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Buy Professional Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            View Transaction History
          </button>
        </div>
      </div>

      {/* Real-time Credit Wallet Breakdown (Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Metric 1: Available Credits & Value */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Available Credits</span>
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black">
              {balance} <span className="text-sm font-normal text-emerald-100">Credits</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-500/40 text-xs text-emerald-100 flex justify-between items-center">
            <span className="font-semibold">Value: ₹{creditValue.toLocaleString('en-IN')}</span>
            <span>{purchased} Base • {bonus} Bonus</span>
          </div>
        </div>

        {/* Metric 2: Expiring in 90 days */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Expiring in 90 days</span>
              <Clock className={`w-4 h-4 ${expiringSoon > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
            </div>
            <div className={`text-3xl font-extrabold ${expiringSoon > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {expiringSoon} <span className="text-xs text-gray-500 font-normal">Credits</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            {wallet?.nextExpiryDate ? (
              <span>Next expiry: {new Date(wallet.nextExpiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            ) : (
              <span>No credits expiring soon</span>
            )}
          </div>
        </div>

        {/* Metric 3: Visibility Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Visibility Status</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-gray-900 capitalize">
              {tier.toLowerCase().replace(/_/g, ' ')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            Directory ranking & algorithm priority for new leads.
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-8 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Vaziro Professional Plans
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <History className="w-4 h-4" />
          Transaction History ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
            activeTab === 'batches'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Credit Batches ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Audit Ledger
        </button>
      </div>

      {/* TAB 1: 5 VAZIRO PROFESSIONAL PLANS */}
      {activeTab === 'plans' && (
        <div ref={plansSectionRef}>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Choose Your Vaziro Professional Plan
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select a plan that fits your business volume. 1 Credit = ₹10. Unused base credits valid for 90 days with full refund guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {plans.map((plan) => {
              const isPopular = plan.isPopular || plan.slug === 'popular' || plan.price === 500;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 flex flex-col justify-between transition relative ${
                    isPopular
                      ? 'bg-white border-2 border-emerald-600 shadow-xl ring-4 ring-emerald-500/10 scale-[1.02]'
                      : 'bg-white border border-gray-200 shadow-sm hover:border-gray-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded-full shadow-sm">
                      POPULAR
                    </div>
                  )}

                  <div>
                    <h3 className="font-black text-gray-900 text-base">{plan.name}</h3>
                    <div className="my-3">
                      <span className="text-3xl font-black text-gray-900">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Credit Breakdown Badge */}
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center mb-3">
                      <span className="text-xl font-black text-emerald-950 block">{plan.totalCredits}</span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">
                        {plan.baseCredits} Base + {plan.bonusCredits} Bonus Credits
                      </span>
                    </div>

                    {/* Visibility Tier */}
                    <div className="mb-4 text-center">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {plan.visibilityTier} Visibility
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-gray-600 mb-5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Quote on verified jobs</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Chat & masked calls</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>90-Day Validity</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Unused base refund guarantee</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={purchasingPlan === plan.id}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer ${
                      isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-900 hover:bg-black text-white'
                    }`}
                  >
                    {purchasingPlan === plan.id ? 'Processing...' : `Get ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Fair Refund Guarantee:</strong> When you submit a quotation on a lead, credits are held temporarily. If the customer hires another professional, or if the requirement expires or is cancelled without hiring, 100% of your application credits are automatically restored to your wallet.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTION HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Complete Financial & Credit History</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Transparent records of all plan purchases, application credit debits, automated refunds, and escrow payments.
              </p>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start sm:self-auto overflow-x-auto">
              {(['ALL', 'CREDIT', 'PAYMENT', 'REFUND'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTransactionFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    transactionFilter === filter
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {filter === 'ALL'
                    ? 'All'
                    : filter === 'CREDIT'
                    ? 'Credits'
                    : filter === 'PAYMENT'
                    ? 'Payments'
                    : 'Refunds'}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.direction === 'CREDIT';
                const cat = getTransactionCategory(tx);
                const title = tx.displayType || tx.title || tx.type.replace(/_/g, ' ');
                const desc = tx.description || tx.reason || '';
                const reqTitle = tx.requirement?.title || tx.metadata?.requirementTitle;
                const reqId = tx.requirement?.id || tx.metadata?.requirementId;
                const amountFormatted = tx.amount;

                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          cat === 'REFUND'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isCredit
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {cat === 'REFUND' ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {title}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              cat === 'REFUND'
                                ? 'bg-blue-100 text-blue-800'
                                : isCredit
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cat}
                          </span>
                        </div>

                        {desc && (
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
                        )}

                        {reqTitle && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700">
                            <span className="text-gray-400">Requirement:</span>
                            {reqId ? (
                              <Link
                                to={`/requirements/${reqId}`}
                                className="font-semibold hover:underline inline-flex items-center gap-1"
                              >
                                {reqTitle}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="font-medium">{reqTitle}</span>
                            )}
                          </div>
                        )}

                        <div className="mt-1 text-[11px] text-gray-400 flex items-center gap-2">
                          <span>
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                            <>
                              <span>•</span>
                              <span>Balance: {tx.balanceAfter} cr</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Direction Badge */}
                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex sm:flex-col items-center sm:items-end justify-between">
                      <span
                        className={`text-sm sm:text-base font-black px-2.5 py-1 rounded-lg ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-900 text-white'
                        }`}
                      >
                        {amountFormatted}
                      </span>
                      {tx.status && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <History className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No transactions match this filter</p>
              <p className="text-xs text-gray-400 mt-1">
                Your credits debited for applications and subsequent refunds will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREDIT BATCHES */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Active Credit Batches</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                FIFO consumption tracking. Each batch maintains an independent 90-day validity clock.
              </p>
            </div>
            <span className="text-xs text-gray-400">{batches.length} Batches</span>
          </div>

          {batches && batches.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {batches.map((batch) => {
                const totalInit = batch.initialPurchasedCredits + batch.initialBonusCredits;
                const totalRem = batch.remainingPurchasedCredits + batch.remainingBonusCredits;
                return (
                  <div key={batch.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {batch.planPurchase?.plan?.name || 'Professional Plan Batch'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            batch.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'REFUND_PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : batch.status === 'REFUNDED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {batch.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                        <span>Granted: {new Date(batch.grantedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Expires: {new Date(batch.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {batch.refundAmountPaise > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              Refund: ₹{(batch.refundAmountPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Remaining</span>
                        <span className="font-black text-sm text-gray-900">
                          {totalRem} / {totalInit} cr
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          ({batch.remainingPurchasedCredits} base, {batch.remainingBonusCredits} bonus)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              No credit batches found. Purchase a Professional Plan above to activate your first batch!
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Credit Audit Ledger</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every application debit, plan purchase, and cancellation refund is immutably recorded.
              </p>
            </div>
            <span className="text-xs text-gray-400">Audited Immutable Log</span>
          </div>

          {ledger && ledger.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {ledger.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{item.transactionType.replace(/_/g, ' ')}</span>
                    <p className="text-gray-500 mt-0.5 text-[11px]">{item.reason || 'Credit transaction recorded'}</p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-extrabold text-sm ${
                        item.amount > 0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {item.amount > 0 ? `+${item.amount}` : item.amount} cr
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Balance: {item.balanceAfter} cr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No ledger records found yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditsWalletPage;
