import React, { useState, useEffect } from 'react';
import { X, Coins, Check, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { ProfessionalPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout } from '../utils/razorpay';

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance?: number) => void | Promise<void>;
  creditsNeeded?: number;
  currentBalance?: number;
}

const defaultPlans: ProfessionalPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Pack',
    slug: 'starter-pack',
    price: 499,
    baseCredits: 50,
    bonusCredits: 5,
    totalCredits: 55,
    visibilityTier: 'STANDARD',
    description: 'Perfect for getting started and bidding on high-priority leads.',
    isPopular: false,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'plan_growth',
    name: 'Growth Pack',
    slug: 'growth-pack',
    price: 999,
    baseCredits: 100,
    bonusCredits: 20,
    totalCredits: 120,
    visibilityTier: 'PRO',
    description: 'Most popular choice for active professionals. Includes bonus credits.',
    isPopular: true,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'plan_pro',
    name: 'Pro Pack',
    slug: 'pro-pack',
    price: 1999,
    baseCredits: 200,
    bonusCredits: 50,
    totalCredits: 250,
    visibilityTier: 'PREMIUM',
    description: 'Maximum value with premier lead priority and 50 bonus credits.',
    isPopular: false,
    isActive: true,
    displayOrder: 3,
  },
];

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  creditsNeeded,
  currentBalance,
}) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ProfessionalPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(false);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setPurchasingPlanId(null);
      setLoading(true);

      api.getCreditPlans()
        .then((res) => {
          if (res.data?.data && res.data.data.length > 0) {
            setPlans(res.data.data);
          }
        })
        .catch(() => {
          // Keep default plans
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async (plan: ProfessionalPlan) => {
    try {
      setPurchasingPlanId(plan.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      // 1. Create order on backend
      const orderRes = await api.createCreditOrder(plan.id);
      if (!orderRes.data?.data) {
        throw new Error('Failed to initiate credit payment order.');
      }

      const { orderId, amount, keyId, user: userInfo } = orderRes.data.data;

      // 2. Open Razorpay Checkout modal
      const paymentResponse = await openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        name: 'Vaziro™ Credits',
        description: `${plan.name} — ${plan.totalCredits} Credits`,
        prefill: {
          name: userInfo?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Professional',
          email: userInfo?.email || user?.email || '',
          contact: userInfo?.phone || user?.phone || '',
        },
      });

      // 3. Verify Payment
      const verifyRes = await api.verifyCreditPayment({
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        planId: plan.id,
      });

      if (verifyRes.data?.success) {
        setSuccessMessage(`Payment successful! Added ${plan.totalCredits} credits to your wallet.`);
        await onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error('Payment verification could not be completed.');
      }
    } catch (err: any) {
      if (err.message?.includes('cancelled')) {
        setErrorMessage('Payment was cancelled. No amount was charged.');
      } else {
        setErrorMessage(
          err.response?.data?.error?.message || err.message || 'Failed to complete credit purchase. Please try again.'
        );
      }
    } finally {
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Top Up Credit Wallet
            </h2>
            <p className="text-xs text-neutral-500">
              Add credits to submit your proposal. Your application draft is preserved.
            </p>
          </div>
        </div>

        {/* Shortage Warning Banner */}
        {creditsNeeded !== undefined && currentBalance !== undefined && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 font-semibold">
                You need <strong className="text-amber-950 font-black">{creditsNeeded} credits</strong> to apply for this job, but your current balance is <strong className="text-amber-950 font-black">{currentBalance} credits</strong>.
              </span>
            </div>
            <span className="text-[11px] font-black uppercase text-amber-700 shrink-0 bg-amber-100 px-2 py-0.5 rounded-full">
              Short by {Math.max(0, creditsNeeded - currentBalance)} cr
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-4">
          {plans.map((plan) => {
            const isPurchasing = purchasingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-4 border-2 flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-600/10'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-black text-black text-sm">{plan.name}</h3>
                  <div className="mt-1 mb-2">
                    <span className="text-2xl font-black text-black">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2 bg-neutral-100 rounded-xl text-center mb-3">
                    <span className="text-base font-black text-emerald-700 block">
                      {plan.totalCredits} Credits
                    </span>
                    {plan.bonusCredits > 0 && (
                      <span className="text-[10px] text-neutral-500 font-semibold block">
                        Includes {plan.bonusCredits} Bonus
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1 text-[11px] text-neutral-600 mb-4">
                    <li className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>90-Day Validity</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>100% Refund if unhired</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasingPlanId !== null}
                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${
                    plan.isPopular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  } disabled:opacity-50`}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Add {plan.totalCredits} Credits</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
          <span>Credits are deducted only after you confirm submitting your quote.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-neutral-700 hover:text-black cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
