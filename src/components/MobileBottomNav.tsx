import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Briefcase,
  Search,
  Coins,
  User,
  PlusCircle,
  FileText,
  MessageSquare,
  LogIn,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  // Don't render inside admin view or dedicated chat fullscreen if desired, but general app mobile nav
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string, exact = true) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
        {isProfessional ? (
          // Professional Navigation
          <>
            <Link
              to="/dashboard"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/dashboard') && !location.search.includes('tab=jobs')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/dashboard') && !location.search.includes('tab=jobs') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Home className="w-5 h-5 mb-0.5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/requirements"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/requirements')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/requirements') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Search className="w-5 h-5 mb-0.5" />
              <span>Leads</span>
            </Link>

            <Link
              to="/dashboard?tab=jobs"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                location.pathname === '/dashboard' && location.search.includes('tab=jobs')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {location.pathname === '/dashboard' && location.search.includes('tab=jobs') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Briefcase className="w-5 h-5 mb-0.5" />
              <span>Jobs</span>
            </Link>

            <Link
              to="/credits"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/credits')
                  ? 'text-amber-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/credits') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-amber-500" />
              )}
              <Coins className="w-5 h-5 mb-0.5 text-amber-500" />
              <span>Credits</span>
            </Link>

            <Link
              to="/profile"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/profile')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/profile') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <User className="w-5 h-5 mb-0.5" />
              <span>Account</span>
            </Link>
          </>
        ) : (
          // Customer & Visitor Navigation
          <>
            <Link
              to="/"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/dashboard')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/dashboard') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <FileText className="w-5 h-5 mb-0.5" />
              <span>Requests</span>
            </Link>

            {/* Prominent Floating Center Action: Post Job */}
            <Link
              to="/post-requirement"
              className="flex flex-col items-center justify-center min-h-[44px] -mt-3.5 text-[10.5px] font-extrabold transition group"
            >
              <div className="w-12 h-12 rounded-full bg-black group-hover:bg-neutral-800 flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-95">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-black text-[9.5px] font-black mt-0.5">Post Job</span>
            </Link>

            <Link
              to="/chat"
              className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                isActive('/chat')
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/chat') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span>Chat</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className={`relative flex flex-col items-center justify-center min-h-[44px] text-[10.5px] transition ${
                  isActive('/profile')
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-900 font-medium'
                }`}
              >
                {isActive('/profile') && (
                  <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
                )}
                <User className="w-5 h-5 mb-0.5" />
                <span>Account</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
                className="flex flex-col items-center justify-center min-h-[44px] text-[10.5px] font-medium text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
              >
                <LogIn className="w-5 h-5 mb-0.5" />
                <span>Sign In</span>
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

