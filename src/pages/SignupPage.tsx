import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name is required (minimum 2 characters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setErrorMessage('A valid email address is required.');
      return;
    }

    const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanDigits,
        password,
        role,
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
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-200">
        <div className="text-center mb-6">
          <Link to="/">
            <img src="/logo.png" alt="Vaziro" className="h-11 mx-auto mb-3 object-contain" />
          </Link>
          <h2 className="text-2xl font-black text-black tracking-tight">Create Your Account</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Join India’s trusted services marketplace as a Customer or Verified Professional
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              Select Your Account Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  role === 'CUSTOMER'
                    ? 'border-black bg-neutral-50 ring-2 ring-black'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-black text-sm text-black">Customer</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Post requirements & hire pros</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL')}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  role === 'PROFESSIONAL'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-black text-sm text-emerald-800 flex items-center justify-between">
                  <span>Professional</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold">+10 Free</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Get leads with 0% cut</div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
              Mobile Number *
            </label>
            <div className="flex rounded-2xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white transition">
              <span className="inline-flex items-center gap-1.5 px-3.5 bg-neutral-100 text-neutral-700 font-bold text-xs border-r border-neutral-300 select-none">
                <span>🇮🇳</span> +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
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
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              required
            />
            <label htmlFor="termsCheckbox" className="text-xs text-neutral-600 leading-normal cursor-pointer">
              I agree to the <span className="text-black font-semibold">Terms of Service</span> and{' '}
              <span className="text-black font-semibold">Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name || !email || mobile.length < 10 || !password}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
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

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
