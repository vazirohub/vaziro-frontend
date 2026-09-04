import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Coins,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Sliders,
  ShieldCheck,
  UserPlus,
  Bell,
  CheckCircle2,
  Menu,
  X,
  Compass,
  Zap,
  Sparkles,
  HeartHandshake,
  Dumbbell,
  ChefHat,
  Cross,
  GraduationCap,
  Baby,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

// Curated Master Categories for Explore Navigation
const MASTER_CATEGORIES = [
  { name: 'Elderly Caregiver', slug: 'elderly-caregiver', icon: HeartHandshake, desc: 'Verified senior care & companions' },
  { name: 'Fitness Trainer', slug: 'fitness-trainer', icon: Dumbbell, desc: 'Personal home fitness & weight loss' },
  { name: 'Home Cook / Chef', slug: 'home-cook-chef', icon: ChefHat, desc: 'Hygienic daily cooks & gourmet chefs' },
  { name: 'Home Nurse', slug: 'home-nurse', icon: Cross, desc: 'Clinical care, injections & dressing' },
  { name: 'Home Tutor', slug: 'home-tutor', icon: GraduationCap, desc: 'Academics, STEM & entrance prep' },
  { name: 'Baby Caregiver / Japa', slug: 'baby-caregiver-japa-maid', icon: Baby, desc: 'Postpartum care & newborn specialists' },
  { name: 'Physiotherapist', slug: 'physiotherapist', icon: Activity, desc: 'Pain relief & neuro-rehab at home' },
  { name: 'Yoga Trainer', slug: 'yoga-trainer', icon: Sparkles, desc: 'Mindfulness, flexibility & wellness' },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, openAuthModal } = useAuth();

  // State Management
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [proBalance, setProBalance] = useState<number | null>(null);

  // Refs for click outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setCategoriesOpen(false);
    setNotificationOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Fetch Notifications & Professional Credit Balance
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setProBalance(null);
      return;
    }

    if (isProfessional && user.professionalProfile?.creditWallet?.balance !== undefined) {
      setProBalance(user.professionalProfile.creditWallet.balance);
    }

    const fetchNotifications = () => {
      api.getNotifications({ limit: 15 })
        .then((res) => {
          if (res.data?.success && res.data.data) {
            setNotifications(res.data.data.notifications || []);
            setUnreadCount(res.data.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    };

    const fetchWallet = () => {
      if (isProfessional) {
        api.getCreditWallet()
          .then((res) => {
            if (res.data?.success && res.data.data) {
              setProBalance(res.data.data.balance);
            }
          })
          .catch(() => {});
      }
    };

    fetchNotifications();
    fetchWallet();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchWallet();
    }, 45000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user, isProfessional]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      api.markNotificationRead(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotificationOpen(false);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 3600000);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <Coins className="w-4 h-4 text-emerald-600" />;
      case 'HIRE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'JOB_STATUS':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'QUOTATION':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-[72px]">
            {/* Left: Brand Logo & Marketplace Badge */}
            <div className="flex items-center gap-5">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <img
                  src="/logo.png"
                  alt="Vaziro"
                  className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>

              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100/80 border border-neutral-200/60 text-[11px] font-semibold text-neutral-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>India's Verified Marketplace</span>
              </div>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-neutral-700">
              {/* Explore Categories Mega Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen(!categoriesOpen);
                    setDropdownOpen(false);
                    setNotificationOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    categoriesOpen
                      ? 'bg-neutral-100 text-black font-bold'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Explore Services</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      categoriesOpen ? 'rotate-180 text-black' : ''
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 mt-2 w-[520px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100">
                      <div>
                        <div className="text-xs font-black text-black uppercase tracking-wider">Top Service Domains</div>
                        <div className="text-[11px] text-neutral-500">Hire pre-verified background checked professionals</div>
                      </div>
                      <Link
                        to="/requirements"
                        onClick={() => setCategoriesOpen(false)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>Browse All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {MASTER_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.slug}
                            to={`/requirements?category=${cat.slug}`}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 transition">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-neutral-900 group-hover:text-emerald-700 truncate">
                                {cat.name}
                              </div>
                              <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                                {cat.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/80 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Need a custom quote? Post a request in under 2 minutes</span>
                      </div>
                      <Link
                        to="/post-requirement"
                        onClick={() => setCategoriesOpen(false)}
                        className="text-[11px] font-extrabold text-black hover:underline shrink-0"
                      >
                        Post Now &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Browse Jobs */}
              <Link
                to="/requirements"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                  isActive('/requirements')
                    ? 'bg-neutral-100 text-black font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-neutral-500" />
                <span>Browse Jobs</span>
              </Link>

              {/* Post Requirement for Customers & Guests */}
              {(!isProfessional || isAdmin) && (
                <Link
                  to="/post-requirement"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                    isActive('/post-requirement')
                      ? 'bg-neutral-100 text-black font-bold'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Post Requirement</span>
                </Link>
              )}

              {/* Credit Wallet for Professionals */}
              {isProfessional && !isAdmin && (
                <Link
                  to="/credits"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                    isActive('/credits')
                      ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Credit Wallet</span>
                </Link>
              )}

              {/* Messages */}
              <Link
                to="/chat"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                  isActive('/chat')
                    ? 'bg-neutral-100 text-black font-bold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-neutral-500" />
                <span>Messages</span>
              </Link>

              {/* Admin Console */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-black font-bold text-xs shadow-sm transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>

            {/* Right: Actions, Balance, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Pro Credit Balance Pill */}
              {isProfessional && !isAdmin && proBalance !== null && (
                <Link
                  to="/credits"
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition group"
                  title="Your Active Credit Balance"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>{proBalance}</span>
                  <span className="hidden sm:inline text-[10px] text-amber-700 font-semibold">Credits</span>
                </Link>
              )}

              {/* Primary Action Button (Desktop) */}
              {isProfessional && !isAdmin ? (
                <Link
                  to="/requirements"
                  className="hidden md:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-98"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Find Leads</span>
                </Link>
              ) : (
                <Link
                  to="/post-requirement"
                  className="hidden md:inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-98"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Post Requirement</span>
                </Link>
              )}

              {/* Logged-In User Actions */}
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Notification Center */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(!notificationOpen);
                        setDropdownOpen(false);
                        setCategoriesOpen(false);
                      }}
                      className="relative p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition cursor-pointer flex items-center justify-center"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown Panel */}
                    {notificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 pb-2.5 border-b border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-black">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-100 text-red-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center px-4">
                              <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                              <p className="font-bold text-neutral-700 text-xs">No notifications yet</p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                We'll alert you about quotations, jobs, and payments.
                              </p>
                            </div>
                          ) : (
                            notifications.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={`px-4 py-3 hover:bg-neutral-50 transition cursor-pointer flex items-start gap-3 ${
                                  !item.isRead ? 'bg-emerald-50/40' : ''
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">{getNotificationIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`truncate text-xs ${
                                        !item.isRead ? 'font-black text-black' : 'font-semibold text-neutral-800'
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                                      {formatRelativeTime(item.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5 leading-snug">
                                    {item.message}
                                  </p>
                                </div>
                                {!item.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Profile Dropdown Trigger */}
                  <div className="relative hidden md:block" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        setNotificationOpen(false);
                        setCategoriesOpen(false);
                      }}
                      className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </div>
                      <span className="truncate max-w-[90px]">{user.firstName}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                          dropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Desktop Profile Dropdown Panel */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Signed in as
                          </div>
                          <div className="font-extrabold text-black text-sm truncate mt-0.5">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {user.phone || user.email}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.roles?.map((r) => (
                              <span
                                key={r}
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                  r === 'PROFESSIONAL'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.includes('ADMIN')
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}
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
                          <Briefcase className="w-4 h-4 text-neutral-600" />
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
                            className="flex items-center justify-between px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                          >
                            <div className="flex items-center gap-2.5">
                              <Coins className="w-4 h-4 text-amber-500" />
                              <span>Credit Wallet</span>
                            </div>
                            {proBalance !== null && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {proBalance} Cr
                              </span>
                            )}
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
                            className="flex items-center gap-2.5 px-4 py-2.5 text-black bg-neutral-100/70 hover:bg-neutral-100 font-bold"
                          >
                            <Sliders className="w-4 h-4 text-black" />
                            <span>Admin Governance</span>
                          </Link>
                        )}

                        <div className="border-t border-neutral-100 my-1 pt-1">
                          <button
                            type="button"
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
                </div>
              ) : (
                /* Visitor / Guest Desktop Action Buttons */
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')}
                    className="text-xs font-bold text-neutral-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Become a Pro</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                      Free +10
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
                    className="text-xs font-bold text-neutral-700 hover:text-black px-3.5 py-2 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger Toggle Button (< md) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition flex items-center justify-center cursor-pointer min-h-[40px] min-w-[40px]"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE FULL-SCREEN SLIDE-OVER DRAWER MENU                    */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full w-full sm:w-80 bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250">
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 bg-white shrink-0">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <img src="/logo.png" alt="Vaziro" className="h-8 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* User Card (Logged In vs Guest) */}
              {user ? (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center font-black text-base shadow-sm">
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-black truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-neutral-500 truncate mt-0.5">
                        {user.phone || user.email}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span
                            key={r}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              r === 'PROFESSIONAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.includes('ADMIN')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-neutral-200 text-neutral-800'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Professional Wallet Pill in Mobile Drawer */}
                  {isProfessional && proBalance !== null && (
                    <div className="mt-3 pt-3 border-t border-neutral-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Credit Wallet:</span>
                        <span className="font-black text-sm">{proBalance}</span>
                      </div>
                      <Link
                        to="/credits"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                      >
                        Recharge &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest Welcome Card */
                <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-sm">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Welcome to Vaziro
                  </div>
                  <div className="text-sm font-black mt-1">India's Trusted Marketplace</div>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    Hire verified service professionals or register as a pro with 0% commission.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('CUSTOMER', undefined, 'LOGIN');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition text-center cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('CUSTOMER', undefined, 'SIGNUP');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition text-center shadow-sm cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Mobile Action Cards */}
              <div className="space-y-2">
                {(!isProfessional || isAdmin) && (
                  <Link
                    to="/post-requirement"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-black text-white shadow-md active:scale-98 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-400">
                        <PlusCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white">Post Requirement</div>
                        <div className="text-[10px] text-neutral-300">Get free quotes in 15 mins</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                <Link
                  to="/requirements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100/90 hover:bg-neutral-150 border border-neutral-200/80 active:scale-98 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-neutral-900">Browse Jobs & Leads</div>
                      <div className="text-[10px] text-neutral-500">View real customer requirements</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Collapsible Explore Categories Section */}
              <div className="border border-neutral-200/80 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesExpanded(!mobileCategoriesExpanded)}
                  className="w-full flex items-center justify-between p-3.5 bg-neutral-50 text-left font-bold text-xs text-neutral-900 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Explore Service Categories</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                      mobileCategoriesExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileCategoriesExpanded && (
                  <div className="p-2 divide-y divide-neutral-100 bg-white">
                    {MASTER_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.slug}
                          to={`/requirements?category=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-neutral-800">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Links List */}
              <div className="space-y-1">
                <div className="px-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Navigation
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-xs transition"
                >
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  <span>Dashboard & Active Jobs</span>
                </Link>

                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-xs transition"
                >
                  <MessageSquare className="w-4 h-4 text-neutral-500" />
                  <span>Messages & Quotations</span>
                </Link>

                {(isProfessional || isAdmin) && (
                  <Link
                    to="/credits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-xs transition"
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>Credit Wallet & Packs</span>
                    </div>
                    {proBalance !== null && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {proBalance} Cr
                      </span>
                    )}
                  </Link>
                )}

                {user && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-xs transition"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>My Profile & Settings</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 text-white font-bold text-xs transition"
                  >
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Admin Control Center</span>
                  </Link>
                )}
              </div>

              {/* Professional Onboarding Banner for Guests/Customers */}
              {!isProfessional && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-black text-xs text-emerald-900">Are you a Service Professional?</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1 leading-snug">
                    Get direct customer leads with zero commission. Get 10 free credits upon signup.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('PROFESSIONAL', undefined, 'SIGNUP');
                    }}
                    className="mt-2.5 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Register as Professional
                  </button>
                </div>
              )}

              {/* Trust & Support Footer Links */}
              <div className="pt-2 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Escrow Protection</span>
                  </span>
                  <span>🇮🇳 INR (₹)</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-neutral-400">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                    About Us
                  </Link>
                  <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                    Terms
                  </Link>
                  <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                    Privacy
                  </Link>
                  <Link to="/refund-policy" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                    Refunds
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            {user && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Vaziro</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

