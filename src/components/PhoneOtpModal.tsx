import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  User,
  Briefcase,
  ArrowLeft,
  Check,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  sendMsg91Otp,
  verifyMsg91Otp,
  retryMsg91Otp,
  initMsg91Sdk,
} from '../utils/msg91';

const POPULAR_CATEGORIES = [
  'Elderly Caregiver',
  'Fitness Trainer',
  'Home Cook / Chef',
  'Yoga Instructor',
  'Physiotherapist',
  'Housekeeping & Cleaning',
  'Electrician & Appliance Repair',
  'Plumber & Home Maintenance',
  'Carpenter',
  'Painter',
  'AC Repair & Service',
  'Other Professional Service',
];

const MAJOR_CITIES = [
  'Delhi',
  'Noida',
  'Gurugram',
  'Ghaziabad',
  'Faridabad',
  'Bengaluru',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Other City',
];

export const PhoneOtpModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    loginWithOtp,
    completeSignup,
    defaultRole,
    initialIdentifier,
    initialMode,
  } = useAuth();

  // Mode: LOGIN (sign in existing account) vs SIGNUP (create new account)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Auth Method: OTP (primary/recommended) vs PASSWORD
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PASSWORD'>('OTP');

  // Multi-step Flow:
  // 1. 'ENTER_MOBILE': Input 10-digit mobile number
  // 2. 'CONFIRM_SIGNUP': User doesn't exist yet, confirm they want to create an account
  // 3. 'VERIFY_OTP': 6-box OTP entry with 30s countdown
  // 4. 'COMPLETE_PROFILE': New users select role and fill profile details
  const [step, setStep] = useState<'ENTER_MOBILE' | 'CONFIRM_SIGNUP' | 'VERIFY_OTP' | 'COMPLETE_PROFILE'>('ENTER_MOBILE');

  // User State
  const [mobileNumber, setMobileNumber] = useState('');
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [signupToken, setSignupToken] = useState<string>('');

  // 6-box OTP digits
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile Form State (Step 3)
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Delhi');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Electrician & Appliance Repair');
  const [experience, setExperience] = useState('3');

  // Password Login State
  const [passwordIdentifier, setPasswordIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0); // 30s resend cooldown
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(0); // 300s (5 min) OTP expiration

  const formatExpiryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaskedPhone = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) return '+91 XXXXXXXXXX';
    return `+91 ${clean.slice(0, 2)}XXXXXX${clean.slice(8)}`;
  };

  // Preload MSG91 SDK on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      initMsg91Sdk().catch(() => {});
    }
  }, [isAuthModalOpen]);

  // Reset state on open or role change
  useEffect(() => {
    if (isAuthModalOpen) {
      setSelectedRole(defaultRole);
      setAuthMode(initialMode || 'LOGIN');
      setAuthMethod('OTP');
      setStep('ENTER_MOBILE');
      setErrorMessage(null);
      setSuccessMessage(null);
      setCountdown(0);
      setOtpExpirySeconds(0);
      setOtpDigits(['', '', '', '', '', '']);
      setSignupToken('');
      setIsExistingUser(null);

      const remembered = initialIdentifier || (typeof window !== 'undefined' ? localStorage.getItem('vaziro_last_login_id') || '' : '');
      const cleanDigits = remembered.replace(/\D/g, '').slice(-10);
      setMobileNumber(cleanDigits);
      setPasswordIdentifier(remembered);
    }
  }, [isAuthModalOpen, defaultRole, initialIdentifier, initialMode]);

  // Handle countdown timers (30s resend + 5m expiry)
  useEffect(() => {
    let timer: any;
    if (countdown > 0 || otpExpirySeconds > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, otpExpirySeconds]);

  if (!isAuthModalOpen) return null;

  const normalizedPhone = `+91${mobileNumber.trim().replace(/\D/g, '').slice(-10)}`;

  // ============================================================================
  // STEP 1: CHECK MOBILE NUMBER & DISPATCH OTP
  // ============================================================================
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setIsLoading(true);

      // Check if user exists in Vaziro DB
      const checkRes = await api.checkMobile(clean);
      const userFound = Boolean(checkRes.data?.data?.exists ?? (checkRes.data as any)?.exists);
      setIsExistingUser(userFound);

      if (authMode === 'SIGNUP') {
        if (userFound) {
          setErrorMessage(`An account already exists for +91 ${clean}. Please switch to the Sign In tab.`);
          setIsLoading(false);
          return;
        }

        // Direct happy path for Sign Up: Dispatch signup OTP immediately
        await dispatchOtp(clean, 'signup');
        setStep('VERIFY_OTP');
        return;
      }

      // authMode === 'LOGIN'
      if (!userFound) {
        // Unregistered mobile number in login mode: Ask user to confirm signup
        setStep('CONFIRM_SIGNUP');
        setIsLoading(false);
        return;
      }

      // Existing User -> Send Login OTP immediately
      await dispatchOtp(clean, 'login');
      setStep('VERIFY_OTP');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Unable to process mobile number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch OTP: Always trigger MSG91 OTP Widget for real SMS/WhatsApp delivery, and sync with backend
  const dispatchOtp = async (cleanDigits: string, purpose: string) => {
    const formatted = `+91${cleanDigits}`;
    let sdkDispatched = false;

    // 1. Trigger MSG91 OTP Widget (delivers SMS through the configured MSG91 widget)
    try {
      await sendMsg91Otp(cleanDigits);
      sdkDispatched = true;
      console.log('[Auth] OTP dispatched via MSG91 Widget for', cleanDigits);
    } catch (sdkErr: any) {
      console.warn('[Auth] MSG91 Widget notice:', sdkErr?.message || sdkErr);
    }

    // 2. Also register OTP request with Backend API
    try {
      const res = await api.sendOtp(cleanDigits, purpose, sdkDispatched);
      const cd = res.data?.data?.cooldownSeconds || 30;
      setCountdown(cd);
      setOtpExpirySeconds(300);
      setSuccessMessage(`Verification code sent to ${getMaskedPhone(cleanDigits)}`);
    } catch (apiErr: any) {
      console.warn('[Auth] Backend OTP sync notice:', apiErr?.message || apiErr);
      if (!sdkDispatched) {
        throw new Error(apiErr.response?.data?.error?.message || apiErr.message || 'Could not send OTP right now. Please try again.');
      }
      setCountdown(30);
      setOtpExpirySeconds(300);
      setSuccessMessage(`Verification code sent to ${getMaskedPhone(cleanDigits)}`);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('vaziro_last_login_id', formatted);
    }
  };

  // User clicked "Continue to Create Account" from CONFIRM_SIGNUP
  const handleConfirmSignup = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const clean = mobileNumber.replace(/\D/g, '').slice(-10);

    try {
      setIsLoading(true);
      setAuthMode('SIGNUP');
      await dispatchOtp(clean, 'signup');
      setStep('VERIFY_OTP');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP. Please check the number.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // STEP 2: 6-BOX OTP VERIFICATION
  // ============================================================================
  const handleOtpBoxChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpBoxPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    const nextFocus = Math.min(pasted.length, 5);
    otpRefs.current[nextFocus]?.focus();
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    try {
      setIsLoading(true);
      let sdkResent = false;
      try {
        await retryMsg91Otp(null);
        sdkResent = true;
      } catch {
        try {
          await sendMsg91Otp(clean);
          sdkResent = true;
        } catch {}
      }
      await api.resendOtp(clean, isExistingUser ? 'login' : 'signup', sdkResent).catch(() => {});
      setSuccessMessage('A new verification code has been dispatched via SMS.');
      setCountdown(30);
      setOtpExpirySeconds(300); // Reset 5-min timer
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length < 4) {
      setErrorMessage('Please enter the complete OTP code sent to your phone.');
      return;
    }

    try {
      setIsLoading(true);
      const clean = mobileNumber.replace(/\D/g, '').slice(-10);
      const formatted = `+91${clean}`;

      // 1. Try client SDK verification via MSG91 Widget
      let verifiedOnClient = false;
      let msg91Token: string | undefined;

      if (typeof window !== 'undefined' && typeof window.verifyOtp === 'function') {
        try {
          const verifyData = await verifyMsg91Otp(fullCode);
          verifiedOnClient = true;
          msg91Token = typeof verifyData === 'string'
            ? verifyData
            : (verifyData?.['access-token'] || verifyData?.token || verifyData?.message || window.__lastMsg91Token || 'widget_verified');
          console.log('[Auth] Client OTP verified via MSG91:', verifyData);
        } catch (sdkErr: any) {
          console.warn('[Auth] MSG91 client verify error:', sdkErr?.message || sdkErr);
          const msg = String(sdkErr?.message || '');
          if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('invalid')) {
            setErrorMessage('The OTP is incorrect. Please check and try again.');
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Call backend verify endpoint
      const result: any = await loginWithOtp({
        mobile: formatted,
        phone: formatted,
        otp: fullCode,
        msg91Verified: verifiedOnClient,
        msg91Token,
        role: selectedRole,
      });

      if (result?.isNewUser && result?.signupToken) {
        // New user verified! Transition to Step 3: Complete Profile
        setSignupToken(result.signupToken);
        setStep('COMPLETE_PROFILE');
        setSuccessMessage('Mobile number verified! Please complete your profile to continue.');
      } else {
        // Existing user successfully logged in!
        closeAuthModal();
        navigate(selectedRole === 'PROFESSIONAL' ? '/requirements' : '/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // STEP 3: COMPLETE SIGNUP PROFILE (NEW USERS)
  // ============================================================================
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    try {
      setIsLoading(true);
      const clean = mobileNumber.replace(/\D/g, '').slice(-10);

      await completeSignup({
        mobile: `+91${clean}`,
        signupToken,
        role: selectedRole,
        name: fullName.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        businessName: selectedRole === 'PROFESSIONAL' ? (businessName.trim() || undefined) : undefined,
        category: selectedRole === 'PROFESSIONAL' ? category : undefined,
        experience: selectedRole === 'PROFESSIONAL' ? Number(experience) : undefined,
      });

      closeAuthModal();
      navigate(selectedRole === 'PROFESSIONAL' ? '/requirements' : '/dashboard');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // PASSWORD LOGIN (ADMIN / LEGACY)
  // ============================================================================
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = passwordIdentifier.trim();
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
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
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
            {step === 'COMPLETE_PROFILE'
              ? 'Complete Your Profile'
              : step === 'VERIFY_OTP'
              ? (authMode === 'LOGIN' && isExistingUser ? 'Welcome Back!' : 'Verify Mobile Number')
              : (authMethod === 'PASSWORD' 
                  ? 'Sign In with Password' 
                  : (authMode === 'SIGNUP' ? 'Create Free Account' : 'Welcome Back'))}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            {step === 'COMPLETE_PROFILE'
              ? 'Choose your role and tell us a bit about yourself'
              : step === 'VERIFY_OTP'
              ? `We sent a 6-digit verification code to ${getMaskedPhone(mobileNumber)}`
              : (authMode === 'SIGNUP'
                  ? 'Join India’s trusted marketplace as Customer or Professional'
                  : 'Sign in with your mobile number to access your dashboard')}
          </p>
        </div>

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* TOP TABS: SIGN IN vs SIGN UP (Visible on initial phone input screen) */}
        {step === 'ENTER_MOBILE' && authMethod === 'OTP' && (
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                authMode === 'LOGIN'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('SIGNUP');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                authMode === 'SIGNUP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* FLOW A: OTP AUTHENTICATION                                        */}
        {/* ================================================================= */}
        {authMethod === 'OTP' && (
          <div>
            {/* STEP 1: MOBILE NUMBER INPUT */}
            {step === 'ENTER_MOBILE' && (
              <form onSubmit={handleMobileSubmit} className="space-y-4">
                {/* Account Type Selector for Sign Up mode */}
                {authMode === 'SIGNUP' && (
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                      I want to register as:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 mb-1">
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
                        <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">Hire verified pros</div>
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
                        <div className="text-[10px] text-emerald-700 mt-0.5 leading-tight">Get jobs & 0% cut</div>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Enter Mobile Number *
                  </label>
                  <div className="flex rounded-2xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white transition">
                    <span className="inline-flex items-center gap-1.5 px-3.5 bg-neutral-100 text-neutral-700 font-bold text-xs border-r border-neutral-300 select-none">
                      <span className="text-base leading-none">🇮🇳</span> +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3.5 text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Instant SMS OTP dispatch via MSG91
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || mobileNumber.replace(/\D/g, '').length < 10}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{authMode === 'SIGNUP' ? 'Sending Signup OTP...' : 'Checking account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'SIGNUP' ? 'Send OTP & Create Account' : 'Continue with OTP'}</span>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                    </>
                  )}
                </button>

                {/* Switcher & Password mode */}
                <div className="pt-2 text-center space-y-2.5">
                  <p className="text-xs text-neutral-600">
                    {authMode === 'LOGIN' ? (
                      <>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('SIGNUP');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                        >
                          Sign Up Free
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('LOGIN');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('PASSWORD');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-neutral-400 hover:text-black font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Administrator or password sign in</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 1.5: CONFIRM ACCOUNT CREATION (FOR UNREGISTERED MOBILES IN LOGIN MODE) */}
            {step === 'CONFIRM_SIGNUP' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">No account found</h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        We couldn’t find an existing Vaziro account for{' '}
                        <span className="font-bold text-black">{normalizedPhone}</span>.
                        Would you like to create a new free account?
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSignup}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account & Verify</span>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('ENTER_MOBILE');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-neutral-500 hover:text-black font-bold py-1 transition cursor-pointer"
                  >
                    ← Use different number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGNUP');
                      setStep('ENTER_MOBILE');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-emerald-700 hover:underline font-bold py-1 transition cursor-pointer"
                  >
                    Go to Sign Up tab →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: 6-BOX OTP VERIFICATION */}
            {step === 'VERIFY_OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                {/* Mobile confirmation badge with Masked number and Change button */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                        OTP Sent via SMS
                      </span>
                      <span className="text-xs font-black text-black tracking-wide">
                        {getMaskedPhone(mobileNumber)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('ENTER_MOBILE');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs transition"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change
                  </button>
                </div>

                {/* 6-box input */}
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpBoxKeyDown(index, e)}
                        onPaste={handleOtpBoxPaste}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-xl border border-neutral-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition shadow-sm"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Expiry countdown and Resend OTP */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <div className="text-neutral-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    {otpExpirySeconds > 0 ? (
                      <span>Expires in <strong className="text-neutral-800 font-mono font-bold">{formatExpiryTime(otpExpirySeconds)}</strong></span>
                    ) : (
                      <span className="text-red-600 font-bold">OTP expired</span>
                    )}
                  </div>

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

                {otpExpirySeconds === 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium animate-in fade-in">
                    This OTP has expired. Please click <strong>Resend OTP</strong> above to receive a fresh code.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length < 4 || otpExpirySeconds === 0}
                  className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>{isExistingUser ? 'Verify & Sign In' : 'Verify & Continue'}</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: ROLE SELECTION & PROFILE COMPLETION (FOR NEW USERS) */}
            {step === 'COMPLETE_PROFILE' && (
              <form onSubmit={handleCompleteProfile} className="space-y-4 animate-in fade-in max-h-[75vh] overflow-y-auto pr-1">
                {/* Verified Mobile Pill */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-neutral-800 tracking-wide">{getMaskedPhone(mobileNumber)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>

                {/* Role Cards */}
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                    I want to join Vaziro as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('CUSTOMER')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'CUSTOMER'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <User className={`w-5 h-5 mb-2 ${selectedRole === 'CUSTOMER' ? 'text-emerald-700' : 'text-neutral-400'}`} />
                      <div>
                        <div className="text-xs font-black text-black">Customer</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">Hire verified professionals</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('PROFESSIONAL')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'PROFESSIONAL'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <Briefcase className={`w-5 h-5 mb-2 ${selectedRole === 'PROFESSIONAL' ? 'text-emerald-700' : 'text-neutral-400'}`} />
                      <div>
                        <div className="text-xs font-black text-black">Professional</div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Claim 10 Free Credits</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Common Field: Full Name */}
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    autoFocus
                  />
                </div>

                {/* Professional Specific Fields */}
                {selectedRole === 'PROFESSIONAL' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                        Business / Trade Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma Electricals & AC Care"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                          Primary Service
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-3 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          {POPULAR_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                          Experience (Yrs)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-3 py-3 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Location & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-3 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {MAJOR_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-3 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !fullName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>
                      {selectedRole === 'PROFESSIONAL'
                        ? 'Join as Partner & Go to Dashboard (+10 Free Credits)'
                        : 'Complete & Go to Dashboard'}
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* FLOW B: PASSWORD LOGIN (ADMIN / LEGACY)                           */}
        {/* ================================================================= */}
        {authMethod === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Mobile Number or Email *
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or admin@vaziro.in"
                value={passwordIdentifier}
                onChange={(e) => setPasswordIdentifier(e.target.value)}
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('OTP');
                  setStep('ENTER_MOBILE');
                  setErrorMessage(null);
                }}
                className="text-xs text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch back to 1-Click Mobile OTP</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
