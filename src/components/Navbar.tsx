import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Coins,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal, loginWithPassword } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoSwitching, setDemoSwitching] = useState(false);

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  const handleQuickLogin = async (role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN') => {
    try {
      setDemoSwitching(true);
      if (role === 'ADMIN') {
        await loginWithPassword('admin@vaziro.in', 'VaziroAdmin2026!');
      } else if (role === 'PROFESSIONAL') {
        // Quick demo login for professional
        await loginWithPassword('pro@vaziro.in', 'VaziroPass2026!').catch(async () => {
          openAuthModal('PROFESSIONAL');
        });
      } else {
        // Customer
        openAuthModal('CUSTOMER');
      }
    } catch {
      openAuthModal();
    } finally {
      setDemoSwitching(false);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-gray-900 leading-none">
                Vaziro<span className="text-emerald-600">.in</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mt-0.5">
                India Marketplace Platform
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-600">
            <Link to="/requirements" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-gray-500" />
              <span>Browse Requirements</span>
            </Link>

            <Link to="/post-requirement" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Post Requirement</span>
            </Link>

            <Link to="/credits" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Credits & Plans</span>
            </Link>

            <Link to="/chat" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Messages</span>
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hover:text-emerald-600 transition flex items-center gap-1.5 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/post-requirement"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post a Requirement</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.firstName[0]}
                  </div>
                  <span>{user.firstName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-[10px] text-gray-400 font-medium">Logged in as</div>
                      <div className="font-bold text-gray-900 truncate">
                        {user.phone || user.email}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span key={r} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>My Dashboard & Jobs</span>
                    </Link>

                    <Link
                      to="/credits"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>Credit Wallet & Ledger</span>
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>In-App Messages</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 font-bold"
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Governance</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 my-1 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-1.5 text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('CUSTOMER')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition"
              >
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
