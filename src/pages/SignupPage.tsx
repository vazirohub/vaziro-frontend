import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SignupPage: React.FC = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [role, setRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(
    roleParam?.toUpperCase() === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CUSTOMER'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Verification step state
  const [signupStep, setSignupStep] = useState<'DETAILS' | 'VERIFY_OTP'>('DETAILS');
  const [verifyChannel, setVerifyChannel] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Focus first OTP input when entering verification step
  useEffect(() => {
    if (signupStep === 'VERIFY_OTP') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [signupStep, verifyChannel]);

  useEffect(() => {
    if (user) {
      const isProfessional = user.roles?.includes('PROFESSIONAL');
      if (isProfessional) {
        navigate('/requirements', { replace: true });
      } else {
        const savedDraft = localStorage.getItem('vaziro_pending_requirement_draft');
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (draft.pendingPublish) {
              navigate('/post-requirement', { replace: true });
              return;
            }
          } catch {}
        }
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Validate form details
  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name is required (minimum 2 characters).');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setErrorMessage('A valid email address is required.');
      return false;
    }

    const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return false;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy.');
      return false;
    }

    return true;
  };

  // Dispatch OTP code
  const sendVerificationOtp = async (channel: 'EMAIL' | 'MOBILE') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtpHint(null);
    setIsSendingOtp(true);

    try {
      if (channel === 'EMAIL') {
        const canonicalEmail = email.trim().toLowerCase();
        const res = await api.sendEmailOtp(canonicalEmail, 'signup', name.trim());
        setSuccessMessage(`A 6-digit verification code has been dispatched to ${canonicalEmail}.`);
        setCountdown(res.data?.data?.cooldownSeconds || 30);
        if (res.data?.data?.devOtp) {
          setDevOtpHint(res.data.data.devOtp);
        }
      } else {
        const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
        const res = await api.sendOtp(`+91${cleanDigits}`, 'signup');
        setSuccessMessage(`A 6-digit verification code has been dispatched to +91 ${cleanDigits}.`);
        setCountdown(res.data?.data?.cooldownSeconds || 30);
        if (res.data?.data?.devOtp) {
          setDevOtpHint(res.data.data.devOtp);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to dispatch verification code.';
      setErrorMessage(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Switch verification channel
  const handleSwitchChannel = (newChannel: 'EMAIL' | 'MOBILE') => {
    if (newChannel === verifyChannel) return;
    setVerifyChannel(newChannel);
    setOtpDigits(['', '', '', '', '', '']);
    sendVerificationOtp(newChannel);
  };

  // Step 1 Submit: Check user exists and trigger OTP verification step
  const handleProceedToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const cleanDigits = mobile.replace(/\D/g, '').slice(-10);

      // Pre-check if mobile is registered
      const checkRes = await api.checkMobile(cleanDigits);
      if (checkRes.data?.data?.exists) {
        setErrorMessage('An account with this mobile number already exists. Please sign in instead.');
        setIsLoading(false);
        return;
      }

      // Transition to OTP step and send default Email OTP
      setSignupStep('VERIFY_OTP');
      setVerifyChannel('EMAIL');
      setOtpDigits(['', '', '', '', '', '']);
      await sendVerificationOtp('EMAIL');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Could not verify account availability.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Submit: Verify OTP & Create Account
  const handleVerifyAndCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otpDigits.join('').trim();
    if (fullCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      const cleanDigits = mobile.replace(/\D/g, '').slice(-10);

      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanDigits,
        password,
        role,
        verificationChannel: verifyChannel,
        otpCode: fullCode,
      });

      if (role === 'PROFESSIONAL') {
        navigate('/requirements');
      } else {
        const savedDraft = localStorage.getItem('vaziro_pending_requirement_draft');
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (draft.pendingPublish) {
              navigate('/post-requirement');
              return;
            }
          } catch {}
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Box Key Handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const copy = [...otpDigits];
      copy[index] = '';
      setOtpDigits(copy);
      return;
    }

    // Single digit or paste
    if (clean.length === 1) {
      const copy = [...otpDigits];
      copy[index] = clean;
      setOtpDigits(copy);
      if (index < 5) {
        otpInputsRef.current[index + 1]?.focus();
      }
    } else {
      // Pasted multi-digit code
      const digitsArr = clean.slice(0, 6).split('');
      const copy = [...otpDigits];
      digitsArr.forEach((d, i) => {
        if (i < 6) copy[i] = d;
      });
      setOtpDigits(copy);
      const nextIndex = Math.min(digitsArr.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#fcfbf8] px-4 py-8 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-12">
      <div className="w-full max-w-lg rounded-[10px] border border-[#e7e8df] bg-[#fffefa] p-5 shadow-[0_18px_55px_-42px_rgba(24,62,51,0.4)] sm:p-9">
        <div className="mb-7 text-center">
          <Link to="/">
            <img src="/logo.png" alt="Vaziro" className="h-11 mx-auto mb-3 object-contain" />
          </Link>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]">
            {signupStep === 'VERIFY_OTP' ? 'Security Verification' : 'A good place to begin'}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#29382e]">
            {signupStep === 'VERIFY_OTP' ? 'Verify Your Account' : 'Create your Vaziro account'}
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#737c73]">
            {signupStep === 'VERIFY_OTP'
              ? 'Enter the 6-digit code to verify your contact and complete registration.'
              : 'Join India’s trusted services marketplace as a Customer or Verified Professional'}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-relaxed text-red-800 animate-in fade-in flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div>{errorMessage}</div>
              {signupStep === 'VERIFY_OTP' && verifyChannel === 'MOBILE' && (
                <div className="mt-2.5 pt-2 border-t border-red-200/60">
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('EMAIL')}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Switch to Email OTP Verification (Instant)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium leading-relaxed text-emerald-800 animate-in fade-in flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION DETAILS FORM */}
        {signupStep === 'DETAILS' ? (
          <form onSubmit={handleProceedToVerification} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374239]">
                I&apos;m here to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  aria-pressed={role === 'CUSTOMER'}
                  className={`min-h-[76px] rounded-md border p-3.5 text-left transition cursor-pointer ${
                    role === 'CUSTOMER'
                      ? 'border-[#78935f] bg-[#f1f4e9] ring-1 ring-[#78935f]/20'
                      : 'border-[#e7e8df] hover:border-[#c5d5a8]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#344137]">Hire a professional</div>
                  <div className="mt-1 text-xs leading-4 text-[#737c73]">Post a request and compare quotations</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PROFESSIONAL')}
                  aria-pressed={role === 'PROFESSIONAL'}
                  className={`min-h-[76px] rounded-md border p-3.5 text-left transition cursor-pointer ${
                    role === 'PROFESSIONAL'
                      ? 'border-[#78935f] bg-[#f1f4e9] ring-1 ring-[#78935f]/20'
                      : 'border-[#e7e8df] hover:border-[#c5d5a8]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#344137]">Find professional work</div>
                  <div className="mt-1 text-xs leading-4 text-[#737c73]">Build a profile and respond to requests</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="signup-mobile" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                Mobile number
              </label>
              <div className="flex min-h-12 overflow-hidden rounded-md border border-[#dfe2d9] bg-white transition focus-within:border-[#78935f] focus-within:ring-2 focus-within:ring-[#7a945f]/20">
                <span className="inline-flex items-center border-r border-[#e7e8df] bg-[#f7f7f1] px-3 text-sm font-medium text-[#59645b] select-none">
                  +91
                </span>
                <input
                  id="signup-mobile"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-11 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-[#f1f2e9] hover:text-[#203c32] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-11 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-[#f1f2e9] hover:text-[#203c32] cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="termsCheckbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#dfe2d9] accent-[#527346] focus:ring-[#78935f] cursor-pointer"
                required
              />
              <label htmlFor="termsCheckbox" className="text-xs leading-5 text-[#68716b] cursor-pointer">
                I agree to the <Link to="/terms" className="font-semibold text-[#40583d] underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="font-semibold text-[#40583d] underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying info...</span>
                </>
              ) : (
                <span>Verify & Create Account</span>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: MANDATORY OTP VERIFICATION STEP */
          <form onSubmit={handleVerifyAndCompleteSignup} className="space-y-5 animate-in fade-in">
            {/* Channel Switch Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#374239] uppercase tracking-wider">
                Choose Verification Method:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSwitchChannel('EMAIL')}
                  disabled={isSendingOtp}
                  className={`flex items-center justify-center gap-2 p-3 rounded-md border text-xs font-bold transition cursor-pointer ${
                    verifyChannel === 'EMAIL'
                      ? 'border-[#78935f] bg-[#f1f4e9] text-[#203c32] ring-1 ring-[#78935f]/20'
                      : 'border-[#dfe2d9] bg-white text-[#68716b] hover:bg-neutral-50'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Verify Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchChannel('MOBILE')}
                  disabled={isSendingOtp}
                  className={`flex items-center justify-center gap-2 p-3 rounded-md border text-xs font-bold transition cursor-pointer ${
                    verifyChannel === 'MOBILE'
                      ? 'border-[#78935f] bg-[#f1f4e9] text-[#203c32] ring-1 ring-[#78935f]/20'
                      : 'border-[#dfe2d9] bg-white text-[#68716b] hover:bg-neutral-50'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Verify Mobile OTP</span>
                </button>
              </div>
            </div>

            {/* Target indicator */}
            <div className="rounded-md border border-[#e7e8df] bg-[#f7f7f1] p-3 text-xs text-[#59645b] flex items-center justify-between">
              <span className="font-medium">
                Sent to: <strong className="text-[#203c32]">{verifyChannel === 'EMAIL' ? email : `+91 ${mobile}`}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSignupStep('DETAILS')}
                className="text-[#40583d] font-bold underline hover:text-[#203c32] cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Dev mode OTP hint */}
            {devOtpHint && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 font-mono text-center">
                Demo/QA helper: Code is <strong>{devOtpHint}</strong>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="space-y-2">
              <label className="block text-center text-xs font-bold text-[#374239] uppercase tracking-wider">
                Enter 6-digit verification code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold rounded-md border border-[#dfe2d9] bg-white text-[#203c32] focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20 outline-none transition shadow-xs"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP button & timer */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => sendVerificationOtp(verifyChannel)}
                disabled={countdown > 0 || isSendingOtp}
                className="font-bold text-[#40583d] hover:text-[#203c32] disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchChannel(verifyChannel === 'EMAIL' ? 'MOBILE' : 'EMAIL')}
                className="text-[#68716b] hover:text-[#203c32] underline cursor-pointer"
              >
                {verifyChannel === 'EMAIL' ? 'Didn’t get email? Try Mobile SMS' : 'Didn’t get SMS? Try Email OTP'}
              </button>
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & creating account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Complete Registration</span>
                </>
              )}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setSignupStep('DETAILS')}
              disabled={isLoading}
              className="w-full text-center text-xs font-semibold text-[#68716b] hover:text-[#203c32] flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Registration Details</span>
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-[#e7e8df] pt-5 text-center">
          <p className="text-sm text-[#68716b]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#506e40] hover:text-[#355e3e] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
