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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {isProfessional ? (
          // Professional Navigation
          <>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/dashboard') && !location.search.includes('tab=jobs')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/requirements"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/requirements')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Search className="w-5 h-5 mb-0.5" />
              <span>Find Leads</span>
            </Link>

            <Link
              to="/dashboard?tab=jobs"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                location.pathname === '/dashboard' && location.search.includes('tab=jobs')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5 mb-0.5" />
              <span>Active Jobs</span>
            </Link>

            <Link
              to="/credits"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/credits')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Coins className="w-5 h-5 mb-0.5" />
              <span>Credits</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/profile')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </Link>
          </>
        ) : (
          // Customer & Visitor Navigation
          <>
            <Link
              to="/"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/dashboard')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span>My Requests</span>
            </Link>

            {/* Prominent Center Action: Post Job */}
            <Link
              to="/post-requirement"
              className="flex flex-col items-center justify-center min-h-[44px] -mt-3 text-[11px] font-bold text-white transition group"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-600 group-hover:bg-emerald-700 flex items-center justify-center shadow-md border-2 border-white transition-transform active:scale-95">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-emerald-800 text-[10px] font-bold mt-0.5">Post Job</span>
            </Link>

            <Link
              to="/chat"
              className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                isActive('/chat')
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span>Chat</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition ${
                  isActive('/profile')
                    ? 'text-emerald-700 font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span>Account</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
                className="flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium text-gray-500 hover:text-gray-900 transition"
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
