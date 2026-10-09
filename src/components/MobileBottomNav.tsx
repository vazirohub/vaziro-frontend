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

  // Don't render inside admin view or auth pages
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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/80 bg-white/95 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {isProfessional ? (
          // Professional Navigation
          <>
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Home className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Home</span>
            </Link>

            <Link
              to="/requirements"
              aria-current={isActive('/requirements') ? 'page' : undefined}
              aria-label="Find work: browse customer requests"
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/requirements')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/requirements') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Search className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Find Work</span>
            </Link>

            <Link
              to="/dashboard?tab=jobs"
              aria-current={location.pathname === '/dashboard' && location.search.includes('tab=jobs') ? 'page' : undefined}
              aria-label="My jobs: view active service contracts"
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                location.pathname === '/dashboard' && location.search.includes('tab=jobs')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {location.pathname === '/dashboard' && location.search.includes('tab=jobs') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Briefcase className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">My Jobs</span>
            </Link>

            <Link
              to="/credits"
              aria-current={isActive('/credits') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/credits')
                  ? 'text-amber-800 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/credits') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-amber-500" />
              )}
              <Coins className="w-5 h-5 mb-0.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[62px]">Credits</span>
            </Link>

            <Link
              to="/profile"
              aria-current={isActive('/profile') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/profile')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/profile') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <User className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Account</span>
            </Link>
          </>
        ) : isAuthenticated ? (
          // Customer (Logged-In) Navigation
          <>
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Home className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Home</span>
            </Link>

            <Link
              to="/dashboard?tab=requests"
              aria-current={location.pathname === '/dashboard' && location.search.includes('tab=requests') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                location.pathname === '/dashboard' && location.search.includes('tab=requests')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {location.pathname === '/dashboard' && location.search.includes('tab=requests') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <FileText className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Requests</span>
            </Link>

            {/* Prominent Floating Center Action: Post Job */}
            <Link
              to="/post-requirement"
              aria-label="Post a service request"
              className="group -mt-4 flex min-h-[44px] flex-col items-center justify-center text-[10px] font-bold transition touch-manipulation"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-[#108a00] text-white shadow-lg transition-transform group-active:scale-90">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              <span className="mt-0.5 text-neutral-900 font-bold truncate max-w-[62px]">Post</span>
            </Link>

            <Link
              to="/chat"
              aria-current={isActive('/chat') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/chat')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/chat') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <MessageSquare className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Chat</span>
            </Link>

            <Link
              to="/profile"
              aria-current={isActive('/profile') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/profile')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/profile') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <User className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Account</span>
            </Link>
          </>
        ) : (
          // Visitor / Guest Navigation
          <>
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Home className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Home</span>
            </Link>

            <Link
              to="/professionals"
              aria-current={isActive('/professionals') ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] transition touch-manipulation active:scale-95 ${
                isActive('/professionals')
                  ? 'text-[#108a00] font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              {isActive('/professionals') && (
                <span className="absolute top-0 w-7 h-0.5 rounded-full bg-[#108a00]" />
              )}
              <Search className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="truncate max-w-[62px]">Find Pros</span>
            </Link>

            {/* Prominent Floating Center Action: Post Job */}
            <Link
              to="/post-requirement"
              aria-label="Post a service request"
              className="group -mt-4 flex min-h-[44px] flex-col items-center justify-center text-[10px] font-bold transition touch-manipulation"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-[#108a00] text-white shadow-lg transition-transform group-active:scale-90">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              <span className="mt-0.5 text-neutral-900 font-bold truncate max-w-[62px]">Post</span>
            </Link>

            <button
              type="button"
              onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')}
              className="flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] font-medium text-neutral-500 hover:text-[#108a00] transition cursor-pointer touch-manipulation active:scale-95"
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[62px]">Join Pro</span>
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
              className="flex min-h-[44px] flex-col items-center justify-center text-[10px] sm:text-[11px] font-extrabold text-[#108a00] hover:text-[#14a800] transition cursor-pointer touch-manipulation active:scale-95"
            >
              <LogIn className="w-5 h-5 mb-0.5 text-[#108a00] shrink-0" />
              <span className="truncate max-w-[62px]">Sign In</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
