import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  KeyRound,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  sendMsg91Otp,
  verifyMsg91Otp,
  retryMsg91Otp,
  initMsg91Sdk,
} from '../utils/msg91';

export const PhoneOtpModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    loginWithOtp,
    defaultRole,
    initialIdentifier,
  } = useAuth();

  // Mode: LOGIN vs REGISTER
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sign In method: OTP (fast 1-click via MSG91) vs PASSWORD
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PASSWORD'>('OTP');

  // OTP Sub-step: 'INPUT_PHONE' vs 'VERIFY_OTP'
  const [otpStep, setOtpStep] = useState<'INPUT_PHONE' | 'VERIFY_OTP'>('INPUT_PHONE');

  const [role, setRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(defaultRole);

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend Timer (30s)
  const [countdown, setCountdown] = useState(0);

  // Preload MSG91 SDK on component mount / open
  useEffect(() => {
    if (isAuthModalOpen) {
      initMsg91Sdk().catch(() => {});
    }
  }, [isAuthModalOpen]);

  // Reset state whenever modal opens or defaults change
  useEffect(() => {
    setRole(defaultRole);
    setMode('LOGIN');
    setAuthMethod('OTP');
    setOtpStep('INPUT_PHONE');
    setName('');
    const rememberedId =
      initialIdentifier ||
      (typeof window !== 'undefined' ? localStorage.getItem('vaziro_last_login_id') || '' : '');
    setIdentifier(rememberedId);
    setOtpCode('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setCountdown(0);
  }, [isAuthModalOpen, defaultRole, initialIdentifier]);

  // Handle Resend Countdown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Listen for global MSG91 verification event if triggered by widget
  useEffect(() => {
    const handleGlobalSuccess = async (e: any) => {
      if (otpStep === 'VERIFY_OTP') {
        const detail = e.detail;
        try {
          setIsLoading(true);
          await loginWithOtp({
            phone: identifier,
            msg91Verified: true,
            msg91Token: typeof detail === 'string' ? detail : detail?.token,
            role,
            firstName: name || undefined,
          });
        } catch (err: any) {
          setErrorMessage(err.message || 'Verification complete. Signing you in...');
        } finally {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('msg91:success', handleGlobalSuccess);
    return () => {
      window.removeEventListener('msg91:success', handleGlobalSuccess);
    };
  }, [otpStep, identifier, role, name, loginWithOtp]);

  if (!isAuthModalOpen) return null;

  // 1. Send OTP via MSG91 Web SDK
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }

    const digits = cleanInput.replace(/\D/g, '');
    const isPhone = digits.length >= 10;
    const isEmail = cleanInput.includes('@');

    if (!isPhone && !isEmail) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number or email.');
      return;
    }

    if (mode === 'REGISTER' && (!name.trim() || name.trim().length < 2)) {
      setErrorMessage('Full Name is required (minimum 2 characters).');
      return;
    }

    try {
      setIsLoading(true);
      // Dispatch OTP via MSG91 Web SDK
      try {
        await sendMsg91Otp(cleanInput);
        setSuccessMessage(`OTP sent successfully to ${isPhone ? '+91 ' + digits.slice(-10) : cleanInput}`);
      } catch (msg91Err: any) {
        // Fallback: If MSG91 SDK is blocked or offline, use backend SMS OTP endpoint
        if (isPhone) {
          await api.requestOtp(`+91${digits.slice(-10)}`);
          setSuccessMessage(`OTP sent successfully to +91 ${digits.slice(-10)}`);
        } else {
          throw msg91Err;
        }
      }

      setOtpStep('VERIFY_OTP');
      setCountdown(30);
      setOtpCode('');
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaziro_last_login_id', cleanInput);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please check the number.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Resend OTP via MSG91
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsLoading(true);
      try {
        await retryMsg91Otp(null);
        setSuccessMessage('A new verification code has been dispatched via SMS.');
      } catch {
        // Fallback to sending OTP again
        const cleanInput = identifier.trim();
        await sendMsg91Otp(cleanInput);
        setSuccessMessage('Verification code resent successfully.');
      }
      setCountdown(30);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP & Instant Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMessage('Please enter the 4 to 6-digit OTP code received on your phone.');
      return;
    }

    try {
      setIsLoading(true);
      let verifiedOnClient = false;
      let msg91Token: string | undefined;

      // 1. Verify via MSG91 Web SDK
      try {
        const verifyData = await verifyMsg91Otp(cleanOtp);
        verifiedOnClient = true;
        msg91Token =
          typeof verifyData === 'string'
            ? verifyData
            : verifyData?.['access-token'] || verifyData?.token || verifyData?.message || (window as any).__lastMsg91Token;
      } catch (sdkErr: any) {
        // If MSG91 SDK had an error, we still pass otp to backend for fallback verification
        console.warn('[MSG91] Client verification notice:', sdkErr.message);
      }

      // 2. Log in and issue JWT on backend
      const cleanDigits = identifier.replace(/\D/g, '');
      const formattedPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : identifier;

      await loginWithOtp({
        phone: formattedPhone,
        otp: cleanOtp,
        role,
        firstName: name.trim() || undefined,
        msg91Verified: verifiedOnClient,
        msg91Token,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect OTP code. Please check and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanId, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaziro_last_login_id', cleanId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid mobile/email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Password Registration
  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full Name is required (minimum 2 characters).');
      return;
    }

    const cleanPhone = identifier.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        phone: cleanPhone.slice(-10),
        password,
        role,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Vaziro"
            className="h-10 mx-auto object-contain mb-2"
          />
          <h3 className="text-2xl font-black text-black tracking-tight">
            {mode === 'LOGIN' ? 'Sign In to Vaziro' : 'Create an Account'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'LOGIN'
              ? 'Fast & secure verification for Delhi NCR marketplace'
              : 'Join Delhi NCR’s premier verified services network'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Sign In vs New Account) */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setOtpStep('INPUT_PHONE');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setOtpStep('INPUT_PHONE');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            New Account
          </button>
        </div>

        {/* In Sign In Mode: Authentication Method Switcher (OTP vs Password) */}
        {mode === 'LOGIN' && (
          <div className="flex items-center justify-center gap-4 mb-5 pb-3 border-b border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('OTP');
                setOtpStep('INPUT_PHONE');
                setErrorMessage(null);
              }}
              className={`text-xs font-bold pb-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                authMethod === 'OTP'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Phone OTP (Fastest)
            </button>
            <span className="text-neutral-300 text-xs">•</span>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('PASSWORD');
                setErrorMessage(null);
              }}
              className={`text-xs font-bold pb-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                authMethod === 'PASSWORD'
                  ? 'text-black border-b-2 border-black'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
              Password
            </button>
          </div>
        )}

        {/* Success / Info Notification */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* ============================================================ */}
        {/* CASE 1: 1-CLICK OTP AUTHENTICATION (MSG91 WEB SDK)           */}
        {/* ============================================================ */}
        {mode === 'LOGIN' && authMethod === 'OTP' && (
          <div>
            {otpStep === 'INPUT_PHONE' ? (
              /* STEP 1: ENTER MOBILE NUMBER */
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Role Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      role === 'CUSTOMER'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROFESSIONAL')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      role === 'PROFESSIONAL'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Service Partner
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white">
                    <span className="inline-flex items-center px-3.5 bg-neutral-100 text-neutral-600 font-bold text-xs border-r border-neutral-300 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Instant SMS verification via MSG91
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: ENTER OTP CODE */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Code Sent To
                    </span>
                    <span className="text-xs font-black text-black">
                      +91 {identifier.replace(/\D/g, '').slice(-10)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('INPUT_PHONE');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Enter Verification Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 4-6 digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-xl font-mono font-black rounded-xl border border-neutral-300 text-black placeholder:text-neutral-300 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-500">Didn't receive SMS?</span>
                  {countdown > 0 ? (
                    <span className="text-neutral-400 font-semibold">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-emerald-700 font-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Sign In</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CASE 2: PASSWORD LOGIN                                       */}
        {/* ============================================================ */}
        {mode === 'LOGIN' && authMethod === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Mobile Number or Email *
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or admin@vaziro.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-400 hover:text-black p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* ============================================================ */}
        {/* CASE 3: CREATE ACCOUNT (WITH 1-CLICK OTP OR PASSWORD)        */}
        {/* ============================================================ */}
        {mode === 'REGISTER' && (
          <div>
            {otpStep === 'INPUT_PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Account Role Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      role === 'CUSTOMER'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('PROFESSIONAL')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      role === 'PROFESSIONAL'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Service Partner
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white">
                    <span className="inline-flex items-center px-3.5 bg-neutral-100 text-neutral-600 font-bold text-xs border-r border-neutral-300 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Verify & Continue with OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* REGISTER STEP 2: VERIFY OTP TO COMPLETE ACCOUNT */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Code Sent To
                    </span>
                    <span className="text-xs font-black text-black">
                      +91 {identifier.replace(/\D/g, '').slice(-10)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('INPUT_PHONE');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Enter Verification Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 4-6 digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-xl font-mono font-black rounded-xl border border-neutral-300 text-black placeholder:text-neutral-300 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-500">Didn't receive SMS?</span>
                  {countdown > 0 ? (
                    <span className="text-neutral-400 font-semibold">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-emerald-700 font-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
