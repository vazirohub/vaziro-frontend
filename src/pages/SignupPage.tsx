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
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    <div className="min-h-[85vh] bg-[#fcfbf8] px-4 py-8 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-12">
      <div className="w-full max-w-lg rounded-[10px] border border-[#e7e8df] bg-[#fffefa] p-5 shadow-[0_18px_55px_-42px_rgba(24,62,51,0.4)] sm:p-9">
        <div className="mb-7 text-center">
          <Link to="/">
            <img src="/logo.png" alt="Vaziro" className="h-11 mx-auto mb-3 object-contain" />
          </Link>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]">A good place to begin</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#29382e]">Create your Vaziro account</h2>
          <p className="mt-2 text-sm leading-5 text-[#737c73]">
            Join India’s trusted services marketplace as a Customer or Verified Professional
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-relaxed text-red-800 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#203c32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d5144] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

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
