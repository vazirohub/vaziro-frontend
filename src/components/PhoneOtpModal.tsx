import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Sparkles,
  RotateCw,
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
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    loginWithOtp,
    defaultRole,
    initialIdentifier,
    initialMode,
  } = useAuth();

  // Primary view: LOGIN | SIGNUP | FORGOT_PASSWORD | OTP_LOGIN
  const [viewMode, setViewMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN'>('LOGIN');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form State
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(defaultRole);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Signup OTP Verification State
  const [signupStep, setSignupStep] = useState<'DETAILS' | 'VERIFY_OTP'>('DETAILS');
  const [signupVerifyChannel, setSignupVerifyChannel] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  const [signupOtpDigits, setSignupOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const signupOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [signupCountdown, setSignupCountdown] = useState(0);
  const [signupDevOtp, setSignupDevOtp] = useState<string | null>(null);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');

  // OTP Login State (Alternative)
  const [otpMobile, setOtpMobile] = useState('');
  const [otpStep, setOtpStep] = useState<'ENTER_MOBILE' | 'ENTER_OTP'>('ENTER_MOBILE');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(0);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state when modal opens or initial values change
  useEffect(() => {
    if (isAuthModalOpen) {
      setSelectedRole(defaultRole || 'CUSTOMER');
      setTermsAccepted(false);
      setViewMode(
        initialMode === 'SIGNUP'
          ? 'SIGNUP'
          : initialMode === 'FORGOT_PASSWORD'
          ? 'FORGOT_PASSWORD'
          : initialMode === 'OTP_LOGIN'
          ? 'OTP_LOGIN'
          : 'LOGIN'
      );
      setForgotStep('REQUEST');
      setOtpStep('ENTER_MOBILE');
      setErrorMessage(null);
      setSuccessMessage(null);
      setCountdown(0);
      setOtpDigits(['', '', '', '', '', '']);

      setSignupStep('DETAILS');
      setSignupVerifyChannel('EMAIL');
      setSignupOtpDigits(['', '', '', '', '', '']);
      setSignupCountdown(0);
      setSignupDevOtp(null);

      const remembered = initialIdentifier || (typeof window !== 'undefined' ? localStorage.getItem('vaziro_last_login_id') || '' : '');
      setLoginIdentifier(remembered);
      setForgotIdentifier(remembered);
      const cleanDigits = remembered.replace(/\D/g, '').slice(-10);
      setOtpMobile(cleanDigits);
      setSignupMobile(cleanDigits);
    }
  }, [isAuthModalOpen, defaultRole, initialIdentifier, initialMode]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Countdown timer for Signup OTP
  useEffect(() => {
    let timer: any;
    if (signupCountdown > 0) {
      timer = setInterval(() => {
        setSignupCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupCountdown]);

  if (!isAuthModalOpen) return null;

  const navigateAfterAuth = (userRole?: string) => {
    closeAuthModal();
    const isProf = userRole === 'PROFESSIONAL' || selectedRole === 'PROFESSIONAL';
    if (isProf) {
      navigate('/requirements');
      return;
    }
    const savedUser = localStorage.getItem('vaziro_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const isAdm = parsed.roles?.includes('ADMIN') || parsed.roles?.includes('SUPER_ADMIN');
        if (isAdm) {
          navigate('/admin');
          return;
        }
      } catch {}
    }

    const savedDraft = localStorage.getItem('vaziro_pending_requirement_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.pendingPublish) {
          if (window.location.pathname !== '/post-requirement') {
            navigate('/post-requirement');
          }
          return;
        }
      } catch {}
    }

    if (window.location.pathname !== '/post-requirement') {
      navigate('/dashboard');
    }
  };

  // ============================================================================
  // 1. PRIMARY LOGIN: Email or Mobile + Password
  // ============================================================================
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your email or 10-digit mobile number.');
      return;
    }

    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanId, loginPassword);
      navigateAfterAuth();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email/mobile or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 2. SIGNUP: Full Name, Email, Mobile, Password, Confirm Password, Role, Terms
  // ============================================================================
  const sendSignupOtp = async (channel: 'EMAIL' | 'MOBILE') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSignupDevOtp(null);
    setIsLoading(true);

    try {
      if (channel === 'EMAIL') {
        const canonicalEmail = signupEmail.trim().toLowerCase();
        const res = await api.sendEmailOtp(canonicalEmail, 'signup', signupName.trim());
        setSuccessMessage(`A 6-digit verification code has been dispatched to ${canonicalEmail}.`);
        setSignupCountdown(res.data?.data?.cooldownSeconds || 30);
        if (res.data?.data?.devOtp) {
          setSignupDevOtp(res.data.data.devOtp);
        }
      } else {
        const cleanMobile = signupMobile.replace(/\D/g, '').slice(-10);
        const res = await api.sendOtp(`+91${cleanMobile}`, 'signup');
        setSuccessMessage(`A 6-digit verification code has been dispatched to +91 ${cleanMobile}.`);
        setSignupCountdown(res.data?.data?.cooldownSeconds || 30);
        if (res.data?.data?.devOtp) {
          setSignupDevOtp(res.data.data.devOtp);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchSignupChannel = (newChannel: 'EMAIL' | 'MOBILE') => {
    if (newChannel === signupVerifyChannel) return;
    setSignupVerifyChannel(newChannel);
    setSignupOtpDigits(['', '', '', '', '', '']);
    sendSignupOtp(newChannel);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupName.trim() || signupName.trim().length < 2) {
      setErrorMessage('Full name is required (minimum 2 characters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail.trim() || !emailPattern.test(signupEmail.trim())) {
      setErrorMessage('A valid email address is required.');
      return;
    }

    const cleanMobile = signupMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      setErrorMessage('Please provide a valid 10-digit Indian mobile number.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      setIsLoading(true);
      const checkRes = await api.checkMobile(cleanMobile);
      if (checkRes.data?.data?.exists) {
        setErrorMessage('An account with this mobile number already exists. Please sign in.');
        setIsLoading(false);
        return;
      }

      setSignupStep('VERIFY_OTP');
      setSignupVerifyChannel('EMAIL');
      setSignupOtpDigits(['', '', '', '', '', '']);
      await sendSignupOtp('EMAIL');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Could not verify account availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = signupOtpDigits.join('').trim();
    if (fullCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      const cleanMobile = signupMobile.replace(/\D/g, '').slice(-10);

      await register({
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: cleanMobile,
        password: signupPassword,
        role: selectedRole,
        verificationChannel: signupVerifyChannel,
        otpCode: fullCode,
      });

      navigateAfterAuth(selectedRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const copy = [...signupOtpDigits];
      copy[index] = '';
      setSignupOtpDigits(copy);
      return;
    }

    if (clean.length === 1) {
      const copy = [...signupOtpDigits];
      copy[index] = clean;
      setSignupOtpDigits(copy);
      if (index < 5) {
        signupOtpRefs.current[index + 1]?.focus();
      }
    } else {
      const digitsArr = clean.slice(0, 6).split('');
      const copy = [...signupOtpDigits];
      digitsArr.forEach((d, i) => {
        if (i < 6) copy[i] = d;
      });
      setSignupOtpDigits(copy);
      const nextIndex = Math.min(digitsArr.length, 5);
      signupOtpRefs.current[nextIndex]?.focus();
    }
  };

  const handleSignupDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !signupOtpDigits[index] && index > 0) {
      signupOtpRefs.current[index - 1]?.focus();
    }
  };

  // ============================================================================
  // 3. FORGOT PASSWORD / ACCOUNT RECOVERY FLOW
  // ============================================================================
  const handleForgotRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = forgotIdentifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your registered email address or mobile number.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.forgotPassword(cleanId);
      setSuccessMessage(res.data?.message || 'If an account exists, a 6-digit verification code has been dispatched.');
      setForgotStep('RESET');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Could not send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCode = forgotCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.resetPassword({
        identifier: forgotIdentifier.trim(),
        code: cleanCode,
        resetToken: resetToken || undefined,
        newPassword: forgotNewPassword,
      });

      setSuccessMessage(res.data?.message || 'Password updated successfully! You can now log in.');
      setLoginIdentifier(forgotIdentifier.trim());
      setLoginPassword('');
      setViewMode('LOGIN');
      setForgotStep('REQUEST');
      setForgotCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to update password. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 4. OTP LOGIN (ALTERNATIVE FLOW)
  // ============================================================================
  const handleOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = otpMobile.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setIsLoading(true);
      try {
        await sendMsg91Otp(clean);
      } catch {}
      await api.sendOtp(clean, 'login');
      setOtpStep('ENTER_OTP');
      setCountdown(30);
      setSuccessMessage(`OTP sent to +91 ${clean.slice(0, 2)}XXXXXX${clean.slice(8)}`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to dispatch OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length < 4) {
      setErrorMessage('Please enter the complete OTP code.');
      return;
    }

    try {
      setIsLoading(true);
      const clean = otpMobile.replace(/\D/g, '').slice(-10);
      const formatted = `+91${clean}`;

      await loginWithOtp({
        mobile: formatted,
        phone: formatted,
        otp: fullCode,
        role: selectedRole,
      });

      navigateAfterAuth(selectedRole);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#203c32]/55 p-3 backdrop-blur-sm animate-in fade-in duration-150 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !isLoading) closeAuthModal(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[10px] border border-[#e7e8df] bg-[#fffefa] p-5 shadow-[0_24px_80px_rgba(24,62,51,0.28)] animate-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-3rem)] sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          type="button"
          disabled={isLoading}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-md text-neutral-500 transition hover:bg-[#f1f2e9] hover:text-[#203c32] disabled:opacity-50 sm:right-4 sm:top-4"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-5 pr-9 sm:pr-0 sm:text-center">
          <img
            src="/logo.png"
            alt="Vaziro"
            className="mb-2 h-9 object-contain sm:mx-auto sm:h-10"
          />
          <h3 id="auth-title" className="text-2xl font-semibold tracking-tight text-[#29382e]">
            {viewMode === 'FORGOT_PASSWORD'
              ? 'Account Recovery'
              : viewMode === 'OTP_LOGIN'
              ? 'Sign In with OTP'
              : viewMode === 'SIGNUP'
              ? 'Create Your Account'
              : 'Sign In to Vaziro'}
          </h3>
          <p className="mt-1 text-sm leading-5 text-[#737c73]">
            {viewMode === 'FORGOT_PASSWORD'
              ? 'Reset your password securely with a 6-digit code'
              : viewMode === 'OTP_LOGIN'
              ? 'Enter your mobile number to receive an instant OTP'
              : viewMode === 'SIGNUP'
              ? 'Join India’s trusted professional marketplace'
              : 'Sign in with your email or mobile and password'}
          </p>
        </div>

        {/* Top Navigation Tabs (Visible on Login & Signup) */}
        {(viewMode === 'LOGIN' || viewMode === 'SIGNUP') && (
          <div className="mb-5 grid grid-cols-2 rounded-md border border-[#e7e8df] bg-[#f7f7f1] p-1">
            <button
              type="button"
              onClick={() => {
                setViewMode('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`min-h-11 rounded-sm text-sm font-semibold transition cursor-pointer text-center ${
                viewMode === 'LOGIN'
                  ? 'bg-[#203c32] text-white shadow-sm'
                  : 'text-[#68716b] hover:text-[#203c32]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('SIGNUP');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`min-h-11 rounded-sm text-sm font-semibold transition cursor-pointer text-center ${
                viewMode === 'SIGNUP'
                  ? 'bg-[#203c32] text-white shadow-sm'
                  : 'text-[#68716b] hover:text-[#203c32]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Global Feedback Banners */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-relaxed text-red-800 animate-in fade-in">
            <div>{errorMessage}</div>
            {viewMode === 'SIGNUP' && signupStep === 'VERIFY_OTP' && signupVerifyChannel === 'MOBILE' && (
              <div className="mt-2 pt-2 border-t border-red-200/60">
                <button
                  type="button"
                  onClick={() => handleSwitchSignupChannel('EMAIL')}
                  className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Switch to Email OTP Verification (Instant)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 1: PASSWORD LOGIN (PRIMARY)                                 */}
        {/* ================================================================= */}
        {viewMode === 'LOGIN' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label htmlFor="auth-login-identifier" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                Email or mobile number
              </label>
              <div className="relative">
                <input
                  id="auth-login-identifier"
                  type="text"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="name@email.com or 10-digit mobile"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-login-password" className="text-sm font-semibold text-[#374239]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('FORGOT_PASSWORD');
                    setForgotStep('REQUEST');
                    setForgotIdentifier(loginIdentifier);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="min-h-11 px-1 text-xs font-semibold text-[#506e40] hover:text-[#355e3e] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="auth-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-12 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-[#f1f2e9] hover:text-[#203c32] cursor-pointer"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Alternative OTP Login Trigger */}
            <div className="border-t border-[#e7e8df] pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('OTP_LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 px-2 text-sm font-semibold text-[#59645b] hover:text-[#355e3e] cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Or sign in with SMS OTP</span>
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: SIGNUP FORM (FULL NAME, EMAIL, MOBILE, PASSWORD, ROLE)   */}
        {/* ================================================================= */}
        {viewMode === 'SIGNUP' && (
          signupStep === 'DETAILS' ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374239]">
                  I&apos;m here to
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CUSTOMER')}
                    aria-pressed={selectedRole === 'CUSTOMER'}
                    className={`min-h-[76px] rounded-md border p-3 text-left transition cursor-pointer ${
                      selectedRole === 'CUSTOMER'
                        ? 'border-[#78935f] bg-[#f1f4e9] ring-1 ring-[#78935f]/20'
                        : 'border-[#e7e8df] hover:border-[#c5d5a8]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#344137]">Hire a professional</div>
                    <div className="mt-1 text-xs leading-4 text-[#737c73]">Post a request and compare quotations</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('PROFESSIONAL')}
                    aria-pressed={selectedRole === 'PROFESSIONAL'}
                    className={`min-h-[76px] rounded-md border p-3 text-left transition cursor-pointer ${
                      selectedRole === 'PROFESSIONAL'
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
                <label htmlFor="auth-signup-name" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                  Full name
                </label>
                <input
                  id="auth-signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="auth-signup-email" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                  Email address
                </label>
                <input
                  id="auth-signup-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="auth-signup-mobile" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                  Mobile number
                </label>
                <div className="flex min-h-12 overflow-hidden rounded-md border border-[#dfe2d9] bg-white transition focus-within:border-[#78935f] focus-within:ring-2 focus-within:ring-[#7a945f]/20">
                  <span className="inline-flex items-center border-r border-[#e7e8df] bg-[#f7f7f1] px-3 text-sm font-medium text-[#59645b] select-none">
                    +91
                  </span>
                  <input
                    id="auth-signup-mobile"
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={signupMobile}
                    onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="auth-signup-password" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="Min 6 chars"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-11 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-[#f1f2e9] hover:text-[#203c32] cursor-pointer"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-signup-confirm" className="mb-1.5 block text-sm font-semibold text-[#374239]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-signup-confirm"
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-11 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-[#f1f2e9] hover:text-[#203c32] cursor-pointer"
                      aria-label={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="termsConsent"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#dfe2d9] accent-[#527346] focus:ring-[#78935f] cursor-pointer"
                  required
                />
                <label htmlFor="termsConsent" className="text-xs leading-5 text-[#68716b] cursor-pointer">
                  I agree to the <Link to="/terms" className="font-semibold text-[#40583d] underline">Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="font-semibold text-[#40583d] underline">Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
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
            /* OTP VERIFICATION VIEW FOR SIGNUP */
            <form onSubmit={handleSignupOtpVerify} className="space-y-4 animate-in fade-in">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-[#374239] uppercase tracking-wider mb-2">
                  Choose Verification Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchSignupChannel('EMAIL')}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-md border text-xs font-bold transition cursor-pointer ${
                      signupVerifyChannel === 'EMAIL'
                        ? 'border-[#78935f] bg-[#f1f4e9] text-[#203c32] ring-1 ring-[#78935f]/20'
                        : 'border-[#dfe2d9] bg-white text-[#68716b] hover:bg-neutral-50'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchSignupChannel('MOBILE')}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-md border text-xs font-bold transition cursor-pointer ${
                      signupVerifyChannel === 'MOBILE'
                        ? 'border-[#78935f] bg-[#f1f4e9] text-[#203c32] ring-1 ring-[#78935f]/20'
                        : 'border-[#dfe2d9] bg-white text-[#68716b] hover:bg-neutral-50'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile SMS</span>
                  </button>
                </div>
              </div>

              {/* Target info card */}
              <div className="rounded-md border border-[#e7e8df] bg-[#f7f7f1] p-3 text-xs text-[#59645b] flex items-center justify-between">
                <span>
                  Code sent to: <strong className="text-[#203c32]">{signupVerifyChannel === 'EMAIL' ? signupEmail : `+91 ${signupMobile}`}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSignupStep('DETAILS')}
                  className="text-[#40583d] font-bold underline hover:text-[#203c32] cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Dev hint */}
              {signupDevOtp && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900 font-mono text-center">
                  QA helper code: <strong>{signupDevOtp}</strong>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div className="space-y-1.5">
                <label className="block text-center text-xs font-bold text-[#374239] uppercase tracking-wider">
                  Enter 6-digit verification code
                </label>
                <div className="flex items-center justify-center gap-2">
                  {signupOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (signupOtpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleSignupDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleSignupDigitKeyDown(idx, e)}
                      className="w-10 h-11 text-center text-lg font-bold rounded-md border border-[#dfe2d9] bg-white text-[#203c32] focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20 outline-none transition"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              {/* Resend actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => sendSignupOtp(signupVerifyChannel)}
                  disabled={signupCountdown > 0 || isLoading}
                  className="font-bold text-[#40583d] hover:text-[#203c32] disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{signupCountdown > 0 ? `Resend in ${signupCountdown}s` : 'Resend Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchSignupChannel(signupVerifyChannel === 'EMAIL' ? 'MOBILE' : 'EMAIL')}
                  className="text-[#68716b] hover:text-[#203c32] underline cursor-pointer"
                >
                  {signupVerifyChannel === 'EMAIL' ? 'Switch to SMS' : 'Switch to Email'}
                </button>
              </div>

              {/* Complete Registration Button */}
              <button
                type="submit"
                disabled={isLoading || signupOtpDigits.join('').length < 6}
                className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Complete Signup</span>
                  </>
                )}
              </button>

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
          )
        )}

        {/* ================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD / ACCOUNT RECOVERY                       */}
        {/* ================================================================= */}
        {viewMode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4">
            {forgotStep === 'REQUEST' ? (
              <form onSubmit={handleForgotRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Registered Email or Mobile Number *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email or 10-digit mobile"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    We will send a 6-digit recovery code to verify your identity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !forgotIdentifier.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('LOGIN');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-neutral-600 hover:text-black flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 583921"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-base font-bold text-center tracking-widest text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || forgotCode.length < 4 || !forgotNewPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setForgotStep('REQUEST')}
                    className="font-bold text-neutral-600 hover:text-black cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('LOGIN');
                      setForgotStep('REQUEST');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: ALTERNATIVE OTP LOGIN                                    */}
        {/* ================================================================= */}
        {viewMode === 'OTP_LOGIN' && (
          <div className="space-y-4">
            {otpStep === 'ENTER_MOBILE' ? (
              <form onSubmit={handleOtpSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Enter Mobile Number *
                  </label>
                  <div className="flex rounded-2xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white transition">
                    <span className="inline-flex items-center gap-1 px-3.5 bg-neutral-100 text-neutral-700 font-bold text-xs border-r border-neutral-300 select-none">
                      <span>🇮🇳</span> +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={otpMobile}
                      onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3.5 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpMobile.length < 10}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Login OTP</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-1);
                          const updated = [...otpDigits];
                          updated[idx] = val;
                          setOtpDigits(updated);
                          if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                            otpRefs.current[idx - 1]?.focus();
                          }
                        }}
                        className="w-11 h-12 text-center text-lg font-black rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length < 4}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-neutral-600 hover:text-black flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sign in with Password instead</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneOtpModal;
