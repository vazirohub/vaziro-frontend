import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, login, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const isProfessional = user.roles?.includes('PROFESSIONAL');
      const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN');
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isProfessional) {
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

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your email or 10-digit mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanId, password);
      const savedUser = localStorage.getItem('vaziro_user');
      const savedDraft = localStorage.getItem('vaziro_pending_requirement_draft');
      let targetPath = '/dashboard';
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const isProf = parsed.roles?.includes('PROFESSIONAL');
          const isAdm = parsed.roles?.includes('ADMIN') || parsed.roles?.includes('SUPER_ADMIN');
          if (isAdm) targetPath = '/admin';
          else if (isProf) targetPath = '/requirements';
          else if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.pendingPublish) {
              targetPath = '/post-requirement';
            }
          }
        } catch {}
      }
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email/mobile or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[85vh] bg-[#fcfbf8] px-4 py-8 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-[10px] border border-[#e7e8df] bg-[#fffefa] p-5 shadow-[0_18px_55px_-42px_rgba(24,62,51,0.4)] sm:p-9">
        <div className="mb-7 text-center">
          <Link to="/">
            <img src="/logo.png" alt="Vaziro" className="h-11 mx-auto mb-3 object-contain" />
          </Link>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#718044]">Welcome back</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#29382e]">Sign in to Vaziro</h2>
          <p className="mt-2 text-sm leading-5 text-[#737c73]">
            Enter your registered email or 10-digit mobile number and password
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-relaxed text-red-800 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-identifier" className="mb-1.5 block text-sm font-semibold text-[#374239]">
              Email or mobile number
            </label>
            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              placeholder="name@example.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-[#374239]">
                Password
              </label>
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER', identifier, 'FORGOT_PASSWORD')}
                className="min-h-11 px-1 text-xs font-semibold text-[#506e40] hover:text-[#355e3e] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full rounded-md border border-[#dfe2d9] bg-white px-3 pr-12 text-base font-medium text-[#2e3930] placeholder:text-[#8b928c] outline-none transition focus:border-[#78935f] focus:ring-2 focus:ring-[#7a945f]/20"
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
        </form>

        <div className="mt-6 space-y-3 border-t border-[#e7e8df] pt-5 text-center">
          <p className="text-sm text-[#68716b]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#506e40] hover:text-[#355e3e] hover:underline">
              Create an Account
            </Link>
          </p>

          <button
            type="button"
            onClick={() => openAuthModal('CUSTOMER', identifier, 'OTP_LOGIN')}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 px-2 text-sm font-semibold text-[#59645b] hover:text-[#355e3e] cursor-pointer"
          >
            <Phone className="w-3 h-3 text-neutral-400" />
            <span>Sign in with SMS OTP instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
