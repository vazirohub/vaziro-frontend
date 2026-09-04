import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  ChevronDown,
  Coins,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Sliders,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Official Vaziro Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Vaziro"
              className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Center Navigation Links (Role-aware) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-700">
            <Link to="/requirements" className="hover:text-black transition-colors flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-neutral-500" />
              <span>Browse Jobs</span>
            </Link>

            {/* Customers & Admins post requirements; Professionals do not */}
            {(!isProfessional || isAdmin) && (
              <Link to="/post-requirement" className="hover:text-black transition-colors flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-neutral-900" />
                <span>Post Requirement</span>
              </Link>
            )}

            {/* Professionals have direct access to their credit wallet */}
            {isProfessional && !isAdmin && (
              <Link to="/credits" className="hover:text-black transition-colors flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Credit Wallet</span>
              </Link>
            )}

            <Link to="/chat" className="hover:text-black transition-colors flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-neutral-500" />
              <span>Messages</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-black transition-colors flex items-center gap-1.5 text-black font-extrabold bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-300"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isProfessional && !isAdmin ? (
              <Link
                to="/requirements"
                className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Jobs</span>
              </Link>
            ) : (
              <Link
                to="/post-requirement"
                className="hidden sm:inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Requirement</span>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs transition"
                >
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    {user.firstName[0]}
                  </div>
                  <span>{user.firstName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Logged in as</div>
                      <div className="font-bold text-black text-sm truncate mt-0.5">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {user.phone || user.email}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span
                            key={r}
                            className="text-[9px] font-black px-2 py-0.5 rounded bg-black text-white"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                    >
                      <User className="w-4 h-4 text-black" />
                      <span>My Dashboard & Jobs</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Edit Profile & Password</span>
                    </Link>

                    {(isProfessional || isAdmin) && (
                      <Link
                        to="/credits"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                      >
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Credit Wallet</span>
                      </Link>
                    )}

                    <Link
                      to="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-600" />
                      <span>Messages</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-black bg-neutral-100 hover:bg-neutral-200 font-bold"
                      >
                        <Sliders className="w-4 h-4 text-black" />
                        <span>Admin Governance</span>
                      </Link>
                    )}

                    <div className="border-t border-neutral-100 my-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-bold cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
                  className="text-xs font-bold text-neutral-700 hover:text-black px-3 py-2 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
