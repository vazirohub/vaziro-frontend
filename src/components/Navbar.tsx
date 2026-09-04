import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // 45s polling

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

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
              <div className="flex items-center gap-2">
                {/* In-App Notification Bell Center */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setNotificationOpen(!notificationOpen);
                      setDropdownOpen(false);
                    }}
                    className="relative p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition cursor-pointer flex items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
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
                            <p className="text-[11px] text-neutral-400 mt-0.5">We'll alert you about quotations, jobs, and payments.</p>
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
                              <div className="mt-0.5 shrink-0">
                                {getNotificationIcon(item.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`truncate text-xs ${!item.isRead ? 'font-black text-black' : 'font-semibold text-neutral-800'}`}>
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

                {/* Profile Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setNotificationOpen(false);
                    }}
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
