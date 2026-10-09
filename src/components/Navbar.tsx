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
  Search,
  Home,
  UserCheck,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

// Curated Master Categories for Upwork-style Sub-header and Mega Menus
const MASTER_CATEGORIES = [
  { name: 'Elderly Caregiver', slug: 'elderly-caregiver', icon: HeartHandshake, desc: 'Verified senior care & companions' },
  { name: 'Physiotherapist', slug: 'physiotherapist', icon: Activity, desc: 'Pain relief & neuro-rehab at home' },
  { name: 'Home Nurse', slug: 'home-nurse', icon: Cross, desc: 'Clinical care, injections & dressing' },
  { name: 'Home Cook / Chef', slug: 'home-cook-chef', icon: ChefHat, desc: 'Hygienic daily cooks & gourmet chefs' },
  { name: 'Home Tutor', slug: 'home-tutor', icon: GraduationCap, desc: 'Academics, STEM & entrance prep' },
  { name: 'Fitness Trainer', slug: 'fitness-trainer', icon: Dumbbell, desc: 'Personal home fitness & weight loss' },
  { name: 'Yoga Trainer', slug: 'yoga-trainer', icon: Sparkles, desc: 'Mindfulness, flexibility & wellness' },
  { name: 'Baby Caregiver / Japa', slug: 'baby-caregiver-japa-maid', icon: Baby, desc: 'Postpartum care & newborn specialists' },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, openAuthModal } = useAuth();

  // Desktop Navigation Dropdowns
  const [activeNavDropdown, setActiveNavDropdown] = useState<'PRO' | 'WORK' | 'WHY' | 'MORE' | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Search State (Header & Drawer)
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchMode, setHeaderSearchMode] = useState<'PROFESSIONAL' | 'JOBS'>('PROFESSIONAL');
  const [headerSearchDropdownOpen, setHeaderSearchDropdownOpen] = useState(false);

  // Mobile State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState<string | null>(null);

  // Data & Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [proBalance, setProBalance] = useState<number | null>(null);

  // Refs for click outside
  const headerSearchRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'FINANCE', 'VERIFICATION_ADMIN'].includes(r));
  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const effectiveCredits = proBalance !== null ? proBalance : (user?.professionalProfile?.creditWallet?.balance ?? 10);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) return;

    if (headerSearchMode === 'PROFESSIONAL') {
      navigate(`/professionals?q=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      navigate(`/requirements?q=${encodeURIComponent(headerSearchQuery.trim())}`);
    }

    setHeaderSearchQuery('');
    setHeaderSearchDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  // Close all open menus on route change
  useEffect(() => {
    setActiveNavDropdown(null);
    setProfileDropdownOpen(false);
    setNotificationOpen(false);
    setHeaderSearchDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', closeOnEsc);
    };
  }, [mobileMenuOpen]);

  // Click outside listener for all desktop popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (headerSearchRef.current && !headerSearchRef.current.contains(target)) {
        setHeaderSearchDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setActiveNavDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notifications and Credit Polling
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

    return () => clearInterval(interval);
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

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
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
        return <Coins className="w-4 h-4 text-[#108a00]" />;
      case 'HIRE':
        return <CheckCircle2 className="w-4 h-4 text-[#108a00]" />;
      case 'JOB_STATUS':
        return <Briefcase className="w-4 h-4 text-neutral-700" />;
      case 'QUOTATION':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  const toggleMobileAccordion = (key: string) => {
    setMobileActiveAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/90 shadow-2xs backdrop-blur-md">
        {/* ==================================================================== */}
        {/* 1. TOP HEADER ROW (Upwork Style)                                     */}
        {/* ==================================================================== */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-[68px] items-center justify-between gap-3 lg:gap-6">
            
            {/* LEFT: Logo & Primary Desktop Dropdowns */}
            <div className="flex items-center gap-6 xl:gap-8" ref={navContainerRef}>
              {/* Brand Logo */}
              <Link to="/" className="flex items-center shrink-0 group">
                <img
                  src="/logo.png"
                  alt="Vaziro"
                  className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>

              {/* Desktop Nav Links (Clean Upwork typography) */}
              <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-neutral-800">
                
                {/* 1. Find Professionals ▾ */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveNavDropdown((prev) => (prev === 'PRO' ? null : 'PRO'))}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNavDropdown === 'PRO'
                        ? 'text-[#108a00] bg-neutral-100/70 font-semibold'
                        : 'hover:text-[#108a00] hover:bg-neutral-50'
                    }`}
                  >
                    <span>Find Professionals</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                        activeNavDropdown === 'PRO' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {/* Find Professionals Dropdown Menu */}
                  {activeNavDropdown === 'PRO' && (
                    <div className="absolute left-0 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100">
                        <Link
                          to="/professionals"
                          onClick={() => setActiveNavDropdown(null)}
                          className="p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50/60 border border-neutral-200/60 hover:border-emerald-300 transition group"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 group-hover:text-[#108a00]">
                            <UserCheck className="w-4 h-4 text-[#108a00]" />
                            <span>Browse Professionals</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                            Search and compare pre-verified independent experts in Delhi NCR.
                          </p>
                        </Link>

                        <Link
                          to="/post-requirement"
                          onClick={() => setActiveNavDropdown(null)}
                          className="p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50/60 border border-neutral-200/60 hover:border-emerald-300 transition group"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 group-hover:text-[#108a00]">
                            <PlusCircle className="w-4 h-4 text-[#108a00]" />
                            <span>Post a Requirement</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                            Post your service needs and receive verified proposals in minutes.
                          </p>
                        </Link>
                      </div>

                      {/* Featured Categories */}
                      <div className="pt-3">
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-1">
                          Popular Categories
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {MASTER_CATEGORIES.slice(0, 6).map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <Link
                                key={cat.slug}
                                to={`/professionals?category=${cat.slug}`}
                                onClick={() => setActiveNavDropdown(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-xs font-semibold text-neutral-700 hover:text-[#108a00] transition"
                              >
                                <Icon className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="truncate">{cat.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between px-1">
                          <Link
                            to="/professionals"
                            onClick={() => setActiveNavDropdown(null)}
                            className="text-xs font-bold text-[#108a00] hover:underline flex items-center gap-1"
                          >
                            <span>View all verified professionals &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Find Work ▾ */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveNavDropdown((prev) => (prev === 'WORK' ? null : 'WORK'))}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNavDropdown === 'WORK'
                        ? 'text-[#108a00] bg-neutral-100/70 font-semibold'
                        : 'hover:text-[#108a00] hover:bg-neutral-50'
                    }`}
                  >
                    <span>Find Work</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                        activeNavDropdown === 'WORK' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {/* Find Work Dropdown Menu */}
                  {activeNavDropdown === 'WORK' && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <Link
                        to="/requirements"
                        onClick={() => setActiveNavDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-emerald-50 text-neutral-600 group-hover:text-[#108a00] flex items-center justify-center shrink-0 transition">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900 group-hover:text-[#108a00]">
                            Browse Jobs
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Find customer requests across Delhi NCR
                          </div>
                        </div>
                      </Link>

                      {!isProfessional && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNavDropdown(null);
                            openAuthModal('PROFESSIONAL', undefined, 'SIGNUP');
                          }}
                          className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#108a00] flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#108a00] flex items-center gap-1.5">
                              <span>Become a Professional</span>
                              <span className="text-[9px] bg-[#108a00] text-white font-extrabold px-1.5 py-0.2 rounded-full">
                                +10 Cr
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              Direct leads with zero commission
                            </div>
                          </div>
                        </button>
                      )}

                      {isProfessional && (
                        <Link
                          to="/credits"
                          onClick={() => setActiveNavDropdown(null)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Coins className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-neutral-900 group-hover:text-amber-800">
                              Proposal Credits Wallet
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              Balance: {effectiveCredits} credits
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Why Vaziro ▾ */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveNavDropdown((prev) => (prev === 'WHY' ? null : 'WHY'))}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNavDropdown === 'WHY'
                        ? 'text-[#108a00] bg-neutral-100/70 font-semibold'
                        : 'hover:text-[#108a00] hover:bg-neutral-50'
                    }`}
                  >
                    <span>Why Vaziro</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                        activeNavDropdown === 'WHY' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {/* Why Vaziro Dropdown Menu */}
                  {activeNavDropdown === 'WHY' && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <Link
                        to="/workflow-preview"
                        onClick={() => setActiveNavDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#108a00] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900 group-hover:text-[#108a00]">
                            How It Works
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Explore our milestone-protected 4-step workflow
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition group">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            100% Escrow Protection
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Funds held securely until service satisfaction
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition group">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            DigiLocker Verified Pros
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Government ID and background verification
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Enterprise / Admin Console (if Admin) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-black font-bold text-xs shadow-xs transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* CENTER / RIGHT: Upwork-Style Pill Search Box (Desktop) */}
            <div className="flex items-center gap-3 xl:gap-5">
              <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center">
                <div className="flex items-center bg-white hover:bg-neutral-50/80 focus-within:bg-white border border-neutral-300 focus-within:border-neutral-900 rounded-full pl-3.5 pr-1.5 py-1.5 shadow-2xs transition-all w-[270px] xl:w-[340px]">
                  {/* Left Search Icon */}
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />

                  {/* Search Input */}
                  <input
                    type="text"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="flex-1 text-xs xl:text-sm font-normal text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none px-2 min-w-0"
                  />

                  {headerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHeaderSearchQuery('')}
                      className="p-0.5 text-neutral-400 hover:text-neutral-600 mr-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Vertical Divider */}
                  <div className="w-px h-4 bg-neutral-200 mx-1 shrink-0" />

                  {/* Mode Dropdown Trigger (Professional vs Jobs) */}
                  <div className="relative shrink-0" ref={headerSearchRef}>
                    <button
                      type="button"
                      onClick={() => setHeaderSearchDropdownOpen(!headerSearchDropdownOpen)}
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-[#108a00] px-1.5 py-1 rounded-full cursor-pointer select-none"
                    >
                      <span>{headerSearchMode === 'PROFESSIONAL' ? 'Professional' : 'Jobs'}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-neutral-500 transition-transform ${
                          headerSearchDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Search Mode Dropdown Menu */}
                    {headerSearchDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setHeaderSearchMode('PROFESSIONAL');
                            setHeaderSearchDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            headerSearchMode === 'PROFESSIONAL'
                              ? 'text-[#108a00] bg-emerald-50/70 font-bold'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>Professionals</span>
                          {headerSearchMode === 'PROFESSIONAL' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#108a00]" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHeaderSearchMode('JOBS');
                            setHeaderSearchDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            headerSearchMode === 'JOBS'
                              ? 'text-[#108a00] bg-emerald-50/70 font-bold'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>Jobs</span>
                          {headerSearchMode === 'JOBS' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#108a00]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Green Search Submit Button (Upwork Signature) */}
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="w-7 h-7 rounded-full bg-[#108a00] hover:bg-[#14a800] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition ml-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* FAR RIGHT: Guest CTAs OR Logged-In User Actions */}
              {!user ? (
                /* Guest Desktop View: Log In + Green Sign Up Button */
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
                    className="text-sm font-semibold text-neutral-800 hover:text-[#108a00] px-3.5 py-2 cursor-pointer transition"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
                    className="bg-[#108a00] hover:bg-[#14a800] text-white font-semibold text-sm px-5 py-2.5 rounded-full cursor-pointer transition shadow-xs"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                /* Logged-In Desktop View */
                <div className="hidden lg:flex items-center gap-2.5">
                  {/* Post a request (for Customers) */}
                  {(!isProfessional || isAdmin) && (
                    <Link
                      to="/post-requirement"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Post a request</span>
                    </Link>
                  )}

                  {/* Pro Credit Balance Pill */}
                  {isProfessional && !isAdmin && (
                    <Link
                      to="/credits"
                      className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100/80 cursor-pointer"
                      title="Credit Balance — Click to recharge"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>{effectiveCredits} Cr</span>
                    </Link>
                  )}

                  {/* Messages Icon */}
                  <Link
                    to="/chat"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-[#108a00] hover:bg-neutral-100 transition"
                    title="Messages & Proposals"
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {/* Notifications Center */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(!notificationOpen)}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-[#108a00] hover:bg-neutral-100 transition cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-[#108a00] text-white font-extrabold text-[9px] rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-sm">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Panel */}
                    {notificationOpen && (
                      <div className="absolute right-0 mt-2 w-88 rounded-2xl border border-neutral-200 bg-white py-3 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 pb-2.5 border-b border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-neutral-900">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-[11px] font-bold text-[#108a00] hover:underline cursor-pointer"
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
                                We'll alert you about quotes, jobs, and payments.
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
                                        !item.isRead ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'
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
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Avatar Trigger & Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-1.5 p-1 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                          profileDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Signed in as
                          </div>
                          <div className="font-extrabold text-neutral-900 text-sm truncate mt-0.5">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
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
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Dropdown Links */}
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                          >
                            <Home className="w-4 h-4 text-neutral-500" />
                            <span>My Dashboard</span>
                          </Link>

                          {isProfessional && (
                            <Link
                              to="/requirements"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[#108a00] hover:bg-emerald-50/70 font-semibold"
                            >
                              <Briefcase className="w-4 h-4 text-[#108a00]" />
                              <span>Find Job Leads</span>
                            </Link>
                          )}

                          {(isProfessional || isAdmin) && (
                            <Link
                              to="/credits"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-neutral-800 hover:bg-amber-50/60 font-semibold"
                            >
                              <div className="flex items-center gap-2.5">
                                <Coins className="w-4 h-4 text-amber-500" />
                                <span>Credit Wallet</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                {effectiveCredits} Cr
                              </span>
                            </Link>
                          )}

                          <Link
                            to="/chat"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                          >
                            <MessageSquare className="w-4 h-4 text-neutral-500" />
                            <span>Messages & Quotations</span>
                          </Link>

                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 font-semibold"
                          >
                            <User className="w-4 h-4 text-neutral-500" />
                            <span>Profile & Account</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 font-bold"
                            >
                              <Sliders className="w-4 h-4 text-neutral-900" />
                              <span>Admin Governance</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-neutral-100 pt-1">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-bold cursor-pointer transition"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MOBILE HEADER ACTIONS (< lg) */}
              <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
                {!user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
                      className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#108a00] px-2 py-1 cursor-pointer transition shrink-0 whitespace-nowrap"
                    >
                      Sign up
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                      className="p-2 text-neutral-800 hover:text-black rounded-full cursor-pointer transition"
                      aria-label="Toggle search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                      className="p-2 text-neutral-800 hover:text-black rounded-full cursor-pointer"
                      aria-label="Toggle search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(!notificationOpen)}
                      className="relative p-2 text-neutral-800 hover:text-black rounded-full cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#108a00]" />
                      )}
                    </button>
                  </>
                )}

                {/* Hamburger Menu Toggle (Clean 3 lines) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 -mr-1 text-neutral-800 hover:text-black rounded-lg transition cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

            </div>
          </div>

          {/* ================================================================== */}
          {/* MOBILE QUICK INLINE SEARCH (Expands on Search Icon Click)          */}
          {/* ================================================================== */}
          {mobileSearchOpen && (
            <div className="lg:hidden pb-3 pt-1 border-t border-neutral-100 animate-in fade-in slide-in-from-top-1 duration-150">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex items-center w-full bg-neutral-100 rounded-full border border-neutral-300 px-3 py-1.5 gap-2">
                  <select
                    value={headerSearchMode}
                    onChange={(e) => setHeaderSearchMode(e.target.value as 'PROFESSIONAL' | 'JOBS')}
                    className="text-xs font-bold text-neutral-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="JOBS">Jobs</option>
                  </select>
                  <div className="w-px h-4 bg-neutral-300" />
                  <input
                    type="text"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    placeholder={headerSearchMode === 'PROFESSIONAL' ? 'Search professionals...' : 'Search jobs...'}
                    autoFocus
                    className="flex-1 text-xs font-medium text-neutral-900 bg-transparent placeholder:text-neutral-400 focus:outline-none"
                  />
                  {headerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHeaderSearchQuery('')}
                      className="p-1 text-neutral-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-7 h-7 rounded-full bg-[#108a00] text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 2. SUB-HEADER ROW: CATEGORY NAVIGATION (Upwork media_1791484212919) */}
        {/* ==================================================================== */}
        <div className="hidden lg:block border-t border-neutral-200/70 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex h-11 items-center justify-between text-[13px] font-normal text-neutral-600">
              {/* Category links row */}
              <div className="flex items-center gap-6 xl:gap-8 overflow-x-auto no-scrollbar py-1">
                {MASTER_CATEGORIES.map((cat) => {
                  const isCurrent = location.search.includes(cat.slug);
                  return (
                    <Link
                      key={cat.slug}
                      to={`/professionals?category=${cat.slug}`}
                      className={`whitespace-nowrap transition-colors hover:text-[#108a00] ${
                        isCurrent
                          ? 'text-[#108a00] font-semibold border-b-2 border-[#108a00] pb-2.5'
                          : ''
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>

              {/* "More ▾" Dropdown */}
              <div className="relative pl-4 border-l border-neutral-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveNavDropdown((prev) => (prev === 'MORE' ? null : 'MORE'))}
                  className="flex items-center gap-1 hover:text-[#108a00] cursor-pointer whitespace-nowrap font-medium"
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      activeNavDropdown === 'MORE' ? 'rotate-180 text-[#108a00]' : ''
                    }`}
                  />
                </button>

                {/* More Mega Menu */}
                {activeNavDropdown === 'MORE' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-1">
                      All Service Categories
                    </div>
                    <div className="space-y-1">
                      {MASTER_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.slug}
                            to={`/professionals?category=${cat.slug}`}
                            onClick={() => setActiveNavDropdown(null)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-neutral-50 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-[#108a00]" />
                              <span className="text-xs font-semibold text-neutral-800">{cat.name}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-2 pt-2 border-t border-neutral-100 px-1">
                      <Link
                        to="/professionals"
                        onClick={() => setActiveNavDropdown(null)}
                        className="text-xs font-bold text-[#108a00] hover:underline block text-center"
                      >
                        Explore all professionals directory &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 3. MOBILE SLIDE-OVER DRAWER MENU (Upwork Style)                     */}
      {/* ==================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer Panel (Slides in from Left, clean modern Upwork style) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-[340px] sm:max-w-[380px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-250"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <img src="/logo.png" alt="Vaziro" className="h-7 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              
              {/* Drawer Search Box */}
              <form onSubmit={handleSearchSubmit} className="pt-1">
                <div className="flex items-center bg-neutral-100 rounded-full border border-neutral-300 p-1.5 shadow-2xs gap-1.5">
                  <select
                    value={headerSearchMode}
                    onChange={(e) => setHeaderSearchMode(e.target.value as 'PROFESSIONAL' | 'JOBS')}
                    className="text-xs font-bold text-neutral-800 bg-transparent px-2 py-1 focus:outline-none cursor-pointer shrink-0"
                  >
                    <option value="PROFESSIONAL">Pro</option>
                    <option value="JOBS">Jobs</option>
                  </select>
                  <div className="w-px h-4 bg-neutral-300 shrink-0" />
                  <input
                    type="text"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    placeholder={headerSearchMode === 'PROFESSIONAL' ? 'Search professionals...' : 'Search jobs...'}
                    className="flex-1 min-w-0 text-xs font-medium text-neutral-900 bg-transparent placeholder:text-neutral-400 focus:outline-none px-1"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="w-7 h-7 rounded-full bg-[#108a00] text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Guest CTA Buttons OR Logged-In User Profile Card */}
              {!user ? (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('CUSTOMER', undefined, 'SIGNUP');
                    }}
                    className="w-full py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-semibold text-sm rounded-full text-center shadow-xs transition cursor-pointer"
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('CUSTOMER', undefined, 'LOGIN');
                    }}
                    className="w-full py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-semibold text-sm rounded-full text-center transition cursor-pointer"
                  >
                    Log in
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-neutral-900 truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {user.phone || user.email}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
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

                  {/* Professional Wallet Info */}
                  {isProfessional && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700">Credit Balance:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-900">{effectiveCredits} Cr</span>
                        <Link
                          to="/credits"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[11px] font-bold text-[#108a00] hover:underline"
                        >
                          Recharge
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Navigation Accordions */}
              <div className="space-y-1 border-t border-neutral-100 pt-3">
                {/* 1. Find Professionals Accordion */}
                <div className="border-b border-neutral-100 pb-1">
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('PRO')}
                    className="w-full flex items-center justify-between py-2.5 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
                  >
                    <span>Find Professionals</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        mobileActiveAccordion === 'PRO' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {mobileActiveAccordion === 'PRO' && (
                    <div className="pl-3 pb-2 space-y-1.5 animate-in fade-in duration-150">
                      <Link
                        to="/professionals"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs font-semibold text-[#108a00]"
                      >
                        Browse All Professionals &rarr;
                      </Link>
                      <Link
                        to="/post-requirement"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs text-neutral-700 hover:text-black"
                      >
                        Post a Service Requirement
                      </Link>
                      <div className="pt-1 text-[11px] font-bold text-neutral-400 uppercase">
                        Top Categories
                      </div>
                      {MASTER_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/professionals?category=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 text-xs text-neutral-600 hover:text-[#108a00]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Find Work Accordion */}
                <div className="border-b border-neutral-100 pb-1">
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('WORK')}
                    className="w-full flex items-center justify-between py-2.5 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
                  >
                    <span>Find Work</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        mobileActiveAccordion === 'WORK' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {mobileActiveAccordion === 'WORK' && (
                    <div className="pl-3 pb-2 space-y-1.5 animate-in fade-in duration-150">
                      <Link
                        to="/requirements"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs font-semibold text-neutral-800 hover:text-[#108a00]"
                      >
                        Browse Jobs / Requests
                      </Link>
                      {!isProfessional && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openAuthModal('PROFESSIONAL', undefined, 'SIGNUP');
                          }}
                          className="w-full py-2 text-xs font-bold text-[#108a00] text-left cursor-pointer flex items-center justify-between gap-1.5"
                        >
                          <span>Become a Professional</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            +10 Credits
                          </span>
                        </button>
                      )}
                      {isProfessional && (
                        <Link
                          to="/credits"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 text-xs text-neutral-700 hover:text-black"
                        >
                          Credit Wallet
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Why Vaziro Accordion */}
                <div className="border-b border-neutral-100 pb-1">
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('WHY')}
                    className="w-full flex items-center justify-between py-2.5 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
                  >
                    <span>Why Vaziro</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        mobileActiveAccordion === 'WHY' ? 'rotate-180 text-[#108a00]' : ''
                      }`}
                    />
                  </button>

                  {mobileActiveAccordion === 'WHY' && (
                    <div className="pl-3 pb-2 space-y-1.5 animate-in fade-in duration-150">
                      <Link
                        to="/workflow-preview"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs font-semibold text-neutral-800 hover:text-[#108a00]"
                      >
                        How the Workflow Works
                      </Link>
                      <Link
                        to="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs text-neutral-700 hover:text-black"
                      >
                        Escrow Protection & Verification
                      </Link>
                    </div>
                  )}
                </div>

                {/* Logged-In User Navigation Links */}
                {user && (
                  <div className="pt-2 space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black"
                    >
                      <Home className="w-4 h-4 text-neutral-500" />
                      <span>Dashboard & Contracts</span>
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>Messages & Quotations</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black"
                    >
                      <User className="w-4 h-4 text-neutral-500" />
                      <span>Profile & Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-xs font-bold text-neutral-900"
                      >
                        <Sliders className="w-4 h-4 text-amber-500" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Ask Isha AI Support Tile */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('vaziro:open_ai_chat'));
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 text-white shadow-xs transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#108a00] flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Ask Isha AI Assistant</div>
                    <div className="text-[10px] text-neutral-300">24/7 Verified Support & Guidelines</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              {/* Pro Onboarding Card for Non-pros */}
              {!isProfessional && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-950">Are you a Service Professional?</div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Join Vaziro to get direct customer inquiries with zero commission and free welcome credits.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('PROFESSIONAL', undefined, 'SIGNUP');
                    }}
                    className="mt-2.5 w-full py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs rounded-full transition cursor-pointer"
                  >
                    Register as Professional
                  </button>
                </div>
              )}

              {/* Drawer Trust & Policy Footer */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                    <span>100% Escrow Protection</span>
                  </span>
                  <span>🇮🇳 Delhi NCR</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-neutral-400">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
                    About
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

            {/* Drawer Bottom Actions (Sign Out if logged in) */}
            {user && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
