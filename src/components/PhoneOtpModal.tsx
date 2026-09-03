import React, { useState, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PhoneOtpModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, defaultRole } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>(defaultRole);

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setRole(defaultRole);
    setMode('LOGIN');
    setName('');
    setIdentifier('');
    setPhone('');
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  }, [isAuthModalOpen, defaultRole]);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your registered mobile number or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(cleanIdentifier, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid mobile/email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full Name is required (minimum 2 characters).');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password is required and must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-2 rounded-full hover:bg-neutral-100 transition"
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
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full mb-2">
            <MapPin className="w-3 h-3 text-black" />
            <span>Delhi • Noida • Gurugram • Ghaziabad • Greater Noida</span>
          </div>
          <h3 className="text-2xl font-black text-black tracking-tight mt-1">
            {mode === 'LOGIN' ? 'Sign In to Vaziro' : 'Create an Account'}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {mode === 'LOGIN'
              ? 'Enter your mobile number or email to access your account'
              : 'Join Delhi NCR’s verified home & personal care platform'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
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
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              mode === 'REGISTER'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="absolute right-3 text-neutral-400 hover:text-black p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>
        ) : (
          /* CREATE ACCOUNT FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'CUSTOMER' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
                }`}
              >
                I am a Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'PROFESSIONAL' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
                }`}
              >
                I am a Service Partner
              </button>
            </div>

            {/* Name is STRICTLY REQUIRED */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-600 font-black">* (Required)</span>
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

            {/* Mobile Number - Clean separate prefix */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-red-600 font-black">* (10-Digit Mobile)</span>
              </label>
              <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-black transition">
                <span className="bg-neutral-100 text-neutral-700 px-3.5 py-3 text-sm font-bold flex items-center gap-1 border-r border-neutral-300 shrink-0 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Create Password <span className="text-red-600 font-black">* (Min 6 chars)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-neutral-300 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-400 hover:text-black p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account & Continue</span>}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
