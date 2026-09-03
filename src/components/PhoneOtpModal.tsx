import React, { useState } from 'react';
import { X, ShieldCheck, Phone, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PhoneOtpModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithOtp, defaultRole } = useAuth();
  const [role, setRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(defaultRole);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    setRole(defaultRole);
    setStep('PHONE');
    setPhone('');
    setOtp('');
    setErrorMessage(null);
  }, [isAuthModalOpen, defaultRole]);

  React.useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isAuthModalOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Format phone to +91XXXXXXXXXX
    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone = phone.trim();
    if (cleanPhone.length === 10) {
      formattedPhone = `+91${cleanPhone}`;
    }

    if (!/^\+91[6-9]\d{9}$/.test(formattedPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.requestOtp(formattedPhone);
      if (res.data.success) {
        setPhone(formattedPhone);
        setStep('OTP');
        setCooldown(res.data.data?.cooldownSeconds || 60);
      } else {
        setErrorMessage(res.data.error?.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to dispatch OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOtp({
        phone,
        otp,
        role,
        firstName: firstName.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {step === 'PHONE' ? 'Welcome to Vaziro' : 'Enter Verification Code'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'PHONE'
              ? 'Enter your Indian mobile number to sign in or register'
              : `A 6-digit code was sent via SMS to ${phone}`}
          </p>
        </div>

        {/* Role Toggle */}
        {step === 'PHONE' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'CUSTOMER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              I am a Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('PROFESSIONAL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'PROFESSIONAL' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              I am a Professional
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-1 text-sm font-bold text-slate-500 border-r border-slate-200 pr-2">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-20 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We'll send an OTP to verify your mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
                required
              />
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-semibold">
              <span>Demo Testing: Enter <strong>123456</strong> to verify</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Enter Platform'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-slate-500 hover:text-slate-800"
              >
                Change mobile number
              </button>

              <button
                type="button"
                disabled={cooldown > 0 || isLoading}
                onClick={handleRequestOtp}
                className="text-emerald-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
