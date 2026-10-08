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
  Sparkles,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  // Don't render inside admin view or dedicated chat fullscreen if desired, but general app mobile nav
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/verify/callback')) {
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
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e7e8df] bg-[#fffefa]/95 shadow-[0_-4px_20px_rgba(24,62,51,0.07)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1 sm:px-2">
        {isProfessional ? (
          // Professional Navigation
          <>
            <Link
              to="/dashboard"
              aria-current={isActive('/dashboard') && !location.search.includes('tab=jobs') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/dashboard') && !location.search.includes('tab=jobs')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {isActive('/dashboard') && !location.search.includes('tab=jobs') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#8bb647]" />
              )}
              <Home className="w-5 h-5 mb-0.5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/requirements"
              aria-current={isActive('/requirements') ? 'page' : undefined}
              aria-label="Find work: browse customer requests"
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/requirements')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {isActive('/requirements') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#8bb647]" />
              )}
              <Search className="w-5 h-5 mb-0.5" />
              <span>Find work</span>
            </Link>

            <Link
              to="/dashboard?tab=jobs"
              aria-current={location.pathname === '/dashboard' && location.search.includes('tab=jobs') ? 'page' : undefined}
              aria-label="My jobs: view active service contracts"
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                location.pathname === '/dashboard' && location.search.includes('tab=jobs')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {location.pathname === '/dashboard' && location.search.includes('tab=jobs') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#8bb647]" />
              )}
              <Briefcase className="w-5 h-5 mb-0.5" />
              <span>My jobs</span>
            </Link>

            <Link
              to="/credits"
              aria-current={isActive('/credits') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
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
              aria-current={isActive('/profile') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
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
        ) : isAuthenticated ? (
          // Customer (Logged-In) Navigation
          <>
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
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
              aria-current={isActive('/dashboard') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/dashboard')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
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
              aria-label="Post a service request"
              className="group -mt-3.5 flex min-h-[44px] flex-col items-center justify-center text-[11px] font-semibold transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#c9f27d] shadow-md transition-transform group-active:scale-95">
                <PlusCircle className="h-6 w-6 text-[#203c32]" />
              </div>
              <span className="mt-0.5 text-[#203c32]">Post</span>
            </Link>

            <Link
              to="/chat"
              aria-current={isActive('/chat') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/chat')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {isActive('/chat') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span>Chat</span>
            </Link>

            <Link
              to="/profile"
              aria-current={isActive('/profile') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
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
          // Visitor / Guest Navigation (No Dashboard or Messages shown)
          <>
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {isActive('/') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/requirements"
              aria-current={isActive('/requirements') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[11px] transition ${
                isActive('/requirements')
                  ? 'text-[#355e3e] font-semibold'
                  : 'text-[#737c73] hover:text-[#203c32] font-medium'
              }`}
            >
              {isActive('/requirements') && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Search className="w-5 h-5 mb-0.5" />
              <span>Browse</span>
            </Link>

            {/* Prominent Floating Center Action: Post Job */}
            <Link
              to="/post-requirement"
              aria-label="Post a service request"
              className="group -mt-3.5 flex min-h-[44px] flex-col items-center justify-center text-[11px] font-semibold transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#c9f27d] shadow-md transition-transform group-active:scale-95">
                <PlusCircle className="h-6 w-6 text-[#203c32]" />
              </div>
              <span className="mt-0.5 text-[#203c32]">Post</span>
            </Link>

            <button
              type="button"
              onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')}
              className="flex min-h-[44px] flex-col items-center justify-center text-[11px] font-medium text-[#737c73] transition hover:text-[#355e3e] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-amber-500" />
              <span>Join Pro</span>
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
              className="flex min-h-[44px] flex-col items-center justify-center text-[11px] font-semibold text-[#355e3e] transition hover:text-[#203c32] cursor-pointer"
            >
              <LogIn className="w-5 h-5 mb-0.5 text-emerald-600" />
              <span>Sign In</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
