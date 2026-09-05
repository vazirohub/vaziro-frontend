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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-200">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Vaziro" className="h-11 mx-auto mb-3 object-contain" />
          </Link>
          <h2 className="text-2xl font-black text-black tracking-tight">Sign In to Vaziro</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Enter your registered email or 10-digit mobile number and password
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
              Email or Mobile Number *
            </label>
            <input
              type="text"
              placeholder="name@example.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-black uppercase tracking-wider">
                Password *
              </label>
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER', identifier, 'FORGOT_PASSWORD')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
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
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center space-y-3">
          <p className="text-xs text-neutral-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Create an Account
            </Link>
          </p>

          <button
            type="button"
            onClick={() => openAuthModal('CUSTOMER', identifier, 'OTP_LOGIN')}
            className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center justify-center gap-1 mx-auto cursor-pointer"
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
