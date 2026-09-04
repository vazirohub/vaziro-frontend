import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [termsAccepted, setTermsAccepted] = useState(true);

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
      setViewMode(initialMode === 'SIGNUP' ? 'SIGNUP' : 'LOGIN');
      setForgotStep('REQUEST');
      setOtpStep('ENTER_MOBILE');
      setErrorMessage(null);
      setSuccessMessage(null);
      setCountdown(0);
      setOtpDigits(['', '', '', '', '', '']);

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

  if (!isAuthModalOpen) return null;

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
      closeAuthModal();
      navigate(selectedRole === 'PROFESSIONAL' ? '/requirements' : '/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email/mobile or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 2. SIGNUP: Full Name, Email, Mobile, Password, Confirm Password, Role, Terms
  // ============================================================================
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
      await register({
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        phone: cleanMobile,
        password: signupPassword,
        role: selectedRole,
      });

      closeAuthModal();
      navigate(selectedRole === 'PROFESSIONAL' ? '/requirements' : '/dashboard');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
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

      closeAuthModal();
      navigate(selectedRole === 'PROFESSIONAL' ? '/requirements' : '/dashboard');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <img
            src="/logo.png"
            alt="Vaziro"
            className="h-10 mx-auto object-contain mb-2"
          />
          <h3 className="text-2xl font-black text-black tracking-tight">
            {viewMode === 'FORGOT_PASSWORD'
              ? 'Account Recovery'
              : viewMode === 'OTP_LOGIN'
              ? 'Sign In with OTP'
              : viewMode === 'SIGNUP'
              ? 'Create Your Account'
              : 'Sign In to Vaziro'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
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
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setViewMode('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                viewMode === 'LOGIN'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-black'
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
              className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                viewMode === 'SIGNUP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-black'
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
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 1: PASSWORD LOGIN (PRIMARY)                                 */}
        {/* ================================================================= */}
        {viewMode === 'LOGIN' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Email or Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="name@email.com or 10-digit mobile"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Password *
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
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !loginIdentifier.trim() || !loginPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Alternative OTP Login Trigger */}
            <div className="pt-2 text-center border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('OTP_LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-neutral-600 hover:text-black flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
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
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                I want to register as:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedRole === 'CUSTOMER'
                      ? 'border-black bg-neutral-50 ring-2 ring-black'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-black text-xs text-black">Customer</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">Post jobs & hire pros</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('PROFESSIONAL')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedRole === 'PROFESSIONAL'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-black text-xs text-emerald-800 flex items-center justify-between">
                    <span>Professional</span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">+10 Free</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 leading-tight">Get work & 0% cut</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white transition">
                <span className="inline-flex items-center gap-1 px-3 bg-neutral-100 text-neutral-700 font-bold text-xs border-r border-neutral-300 select-none">
                  <span>🇮🇳</span> +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Min 6 chars"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
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
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                required
              />
              <label htmlFor="termsConsent" className="text-[11px] text-neutral-600 leading-snug cursor-pointer">
                I agree to the <span className="text-black font-semibold">Terms of Service</span> and{' '}
                <span className="text-black font-semibold">Privacy Policy</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !signupName || !signupEmail || signupMobile.length < 10 || !signupPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
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
