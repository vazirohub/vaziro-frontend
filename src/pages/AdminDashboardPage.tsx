import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShieldCheck,
  Coins,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  Settings,
  MapPin,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  Lock,
  Edit2,
  Key,
  Trash2,
  Search,
  RefreshCw,
  Layers,
  X,
  Plus,
  Minus,
  Check,
  CreditCard,
  Phone,
  AlertCircle,
  Clock,
  Mail,
  ShieldAlert,
  FileText,
  Home,
  Activity,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const defaultAdminLocations = [
  {
    id: 'state-ncr',
    name: 'National Capital Region (NCR)',
    code: 'NCR',
    isActive: true,
    cities: [
      { id: 'city-delhi', name: 'Delhi', slug: 'delhi', isActive: true },
      { id: 'city-noida', name: 'Noida', slug: 'noida', isActive: true },
      { id: 'city-gurugram', name: 'Gurugram', slug: 'gurugram', isActive: true },
      { id: 'city-ghaziabad', name: 'Ghaziabad', slug: 'ghaziabad', isActive: true },
      { id: 'city-greater-noida', name: 'Greater Noida', slug: 'greater-noida', isActive: true },
    ],
  },
  {
    id: 'state-up',
    name: 'Uttar Pradesh',
    code: 'UP',
    isActive: true,
    cities: [
      { id: 'city-noida-up', name: 'Noida', slug: 'noida-up', isActive: true },
      { id: 'city-ghaziabad-up', name: 'Ghaziabad', slug: 'ghaziabad-up', isActive: true },
    ],
  },
  {
    id: 'state-hr',
    name: 'Haryana',
    code: 'HR',
    isActive: true,
    cities: [
      { id: 'city-gurugram-hr', name: 'Gurugram', slug: 'gurugram-hr', isActive: true },
      { id: 'city-faridabad', name: 'Faridabad', slug: 'faridabad', isActive: false },
    ],
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>(defaultAdminLocations);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('ALL');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingActionKey, setSavingActionKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'marketplace' | 'verifications' | 'locations' | 'settings' | 'payments'>('metrics');
  const [marketplaceSubTab, setMarketplaceSubTab] = useState<'requirements' | 'jobs'>('requirements');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Setting edit state
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Credit Adjustment Modal State
  const [creditModalUser, setCreditModalUser] = useState<any | null>(null);
  const [creditMode, setCreditMode] = useState<'ADD' | 'DEDUCT' | 'SET'>('ADD');
  const [creditAmount, setCreditAmount] = useState<number>(20);
  const [creditNotes, setCreditNotes] = useState<string>('');
  const [submittingCredit, setSubmittingCredit] = useState<boolean>(false);

  // User Edit Modal State
  const [editModalUser, setEditModalUser] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Professional Verification Queue States
  const [verificationFilterStatus, setVerificationFilterStatus] = useState<string>('ALL');
  const [verificationSearch, setVerificationSearch] = useState<string>('');
  const [overrideModalCase, setOverrideModalCase] = useState<any | null>(null);
  const [overrideAction, setOverrideAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);
  const [reviewModalCase, setReviewModalCase] = useState<any | null>(null);
  const [reviewReasonInput, setReviewReasonInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [viewDetailsModalCase, setViewDetailsModalCase] = useState<any | null>(null);

  const fetchAdminData = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setLoadError(null);
      const [mRes, uRes, reqRes, jobsRes, vRes, sRes, statesRes, payRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminUsers().catch(() => null),
        api.getAdminRequirements().catch(() => null),
        api.getAdminJobs().catch(() => null),
        api.getAdminVerifications().catch(() => null),
        api.getAdminSettings().catch(() => null),
        api.getAdminLocations().catch(() => null),
        api.getPaymentTransactions().catch(() => null),
      ]);

      const hasPartialFailure = [mRes, uRes, reqRes, jobsRes, vRes, sRes, statesRes, payRes].some((result) => result === null);
      if (hasPartialFailure) setLoadError('Some admin data could not be refreshed. Retry to load the latest platform information.');

      if (mRes?.data?.data) setMetrics(mRes.data.data);
      if (uRes?.data?.data) setUsers(uRes.data.data);
      if (reqRes?.data?.data) setRequirements(reqRes.data.data);
      if (jobsRes?.data?.data) setJobs(jobsRes.data.data);
      if (vRes?.data?.data) setVerifications(vRes.data.data);
      if (payRes?.data?.data?.payments) setPayments(payRes.data.data.payments);
      if (sRes?.data?.data) {
        setSettings(sRes.data.data);
        const map: Record<string, string> = {};
        sRes.data.data.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setEditingSettings(map);
      }
      if (statesRes?.data?.data && statesRes.data.data.length > 0) {
        setStates(statesRes.data.data);
      } else {
        setStates(defaultAdminLocations);
      }
    } catch (err) {
      setLoadError('Admin data could not be loaded. Check your connection and retry.');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 6500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && isAdmin) {
        fetchAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAdmin, isAuthLoading]);

  // Open Credit Modal
  const openCreditModal = (u: any) => {
    setCreditModalUser(u);
    setCreditMode('ADD');
    setCreditAmount(20);
    setCreditNotes('');
  };

  // Handle Credit Adjustment
  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalUser) return;
    try {
      setSubmittingCredit(true);
      const res = await api.adjustAdminUserCredits(creditModalUser.id, {
        amount: Number(creditAmount),
        mode: creditMode,
        notes: creditNotes,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'Credits adjusted successfully.' });
        setCreditModalUser(null);
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not adjust credits.' });
    } finally {
      setSubmittingCredit(false);
    }
  };

  // Open Edit User Modal
  const openEditModal = (u: any) => {
    setEditModalUser(u);
    setEditFirstName(u.firstName || '');
    setEditLastName(u.lastName || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditStatus(u.status || 'ACTIVE');
    const existingRoles = u.roles?.map((r: any) => r.role?.name || r.name || '') || ['CUSTOMER'];
    setEditRoles(existingRoles);
    setEditIsVerified(Boolean(u.professionalProfile?.isVerified));
  };

  // Handle Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    try {
      setSubmittingEdit(true);
      const res = await api.updateAdminUser(editModalUser.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        roles: editRoles,
        isVerified: editIsVerified,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'User details updated successfully.' });
        setEditModalUser(null);
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not update the user.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open Password Reset Modal
  const openPasswordModal = (u: any) => {
    setPasswordModalUser(u);
    setNewPassword('');
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    try {
      setSubmittingPassword(true);
      const res = await api.resetAdminUserPassword(passwordModalUser.id, {
        newPassword,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'Password reset successfully.' });
        setPasswordModalUser(null);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not reset the password.' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (u: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete user ${u.firstName} ${u.lastName}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.deleteAdminUser(u.id);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'User deleted successfully.' });
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not delete the user.' });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (nextStatus === 'SUSPENDED' && !window.confirm('Suspend this account? The user will lose access until an administrator reactivates it.')) return;
    try {
      await api.updateUserStatus(userId, nextStatus);
      setFeedback({ type: 'success', message: `User ${nextStatus === 'ACTIVE' ? 'activated' : 'suspended'}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update user status: ' + err.message });
    }
  };

  const handleReviewVerification = async (id: string, status: 'VERIFIED' | 'FAILED') => {
    try {
      await api.reviewVerification(id, status);
      setFeedback({ type: 'success', message: `Verification marked ${status.toLowerCase()}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update verification: ' + err.message });
    }
  };

  const handleMarkReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalCase) return;
    try {
      setSubmittingReview(true);
      await api.markAdminVerificationReview(reviewModalCase.id, reviewReasonInput || 'Flagged for compliance review');
      setFeedback({ type: 'success', message: 'Verification case marked for review.' });
      setReviewModalCase(null);
      setReviewReasonInput('');
       await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to mark for review: ' + (err.response?.data?.error?.message || err.message) });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalCase) return;
    if (!overrideReason.trim()) {
      setFeedback({ type: 'error', message: 'Enter an audit reason before submitting an override.' });
      return;
    }
    try {
      setSubmittingOverride(true);
      await api.adminVerificationOverride(overrideModalCase.id, overrideAction, overrideReason.trim());
      setFeedback({ type: 'success', message: `Verification override ${overrideAction === 'APPROVE' ? 'approved' : 'rejected'}.` });
      setOverrideModalCase(null);
      setOverrideReason('');
       await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to process override: ' + (err.response?.data?.error?.message || err.message) });
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handleSaveSetting = async (key: string) => {
    try {
      setSavingKey(key);
      const val = editingSettings[key];
      await api.updateAdminSetting(key, val);
      setFeedback({ type: 'success', message: `Updated ${key}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update setting: ' + err.message });
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleLocation = async (type: string, id: string, currentActive: boolean) => {
    const key = `${type}:${id}`;
    setSavingActionKey(key);
    setStates((prev) =>
      prev.map((st) => {
        if (type === 'state' && st.id === id) {
          return { ...st, isActive: !currentActive };
        }
        if (type === 'city' && st.cities) {
          return {
            ...st,
            cities: st.cities.map((ct: any) =>
              ct.id === id ? { ...ct, isActive: !currentActive } : ct
            ),
          };
        }
        return st;
      })
    );

    try {
      await api.toggleAdminLocation(type, id, !currentActive);
      setFeedback({ type: 'success', message: `${type === 'state' ? 'State' : 'City'} ${!currentActive ? 'activated' : 'paused'}.` });
    } catch (err: any) {
      setStates((prev) => prev.map((state) => {
        if (type === 'state' && state.id === id) return { ...state, isActive: currentActive };
        if (type === 'city' && state.cities) return { ...state, cities: state.cities.map((city: any) => city.id === id ? { ...city, isActive: currentActive } : city) };
        return state;
      }));
      setFeedback({ type: 'error', message: `Could not update this ${type}. The previous status was restored.` });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleUpdateRequirementStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'CLOSED' && !window.confirm('Close this customer request? Professionals will no longer be able to submit proposals.')) return;
    try {
      setSavingActionKey(`requirement:${id}`);
      await api.updateAdminRequirementStatus(id, newStatus);
      setFeedback({ type: 'success', message: `Request ${newStatus.toLowerCase()}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update request: ' + err.message });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleUpdateJobStatus = async (id: string, newStatus: string) => {
    const confirmMessage = newStatus === 'PAYMENT_RELEASED'
      ? 'Release payment for this job? This payout action may be irreversible.'
      : 'Force close this job? The service workflow will be stopped.';
    if (!window.confirm(confirmMessage)) return;
    try {
      setSavingActionKey(`job:${id}`);
      await api.updateAdminJobStatus(id, newStatus, 'Admin manual override');
      setFeedback({ type: 'success', message: `Job status changed to ${newStatus.toLowerCase()}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update job status: ' + err.message });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'ALL') return true;
    const userRoleNames = u.roles?.map((r: any) => r.role?.name || r.name) || [];
    return userRoleNames.includes(roleFilter);
  });

  const pendingVerificationCount = verifications.filter((item) => ['PENDING', 'REVIEW_REQUIRED'].includes((item.status || '').toUpperCase())).length;
  const openRequirementCount = requirements.filter((item) => item.status === 'ACTIVE').length;
  const activeJobCount = jobs.filter((item) => !['COMPLETED', 'CLOSED', 'PAYMENT_RELEASED'].includes((item.status || '').toUpperCase())).length;
  const pendingPaymentCount = payments.filter((item) => ['CREATED', 'PENDING', 'FAILED'].includes((item.status || '').toUpperCase())).length;
  const filteredPayments = payments.filter((payment) => {
    if (paymentFilterStatus === 'NEEDS_REVIEW') {
      if (!['CREATED', 'PENDING', 'FAILED'].includes((payment.status || '').toUpperCase())) return false;
    } else if (paymentFilterStatus !== 'ALL') {
      if (paymentFilterStatus === 'CAPTURED') {
        if (!['CAPTURED', 'SECURED', 'PAID', 'RELEASED'].includes(payment.status)) return false;
      } else if (payment.status !== paymentFilterStatus) return false;
    }
    const term = paymentSearch.trim().toLowerCase();
    if (!term) return true;
    return Boolean(
      payment.orderId?.toLowerCase().includes(term) ||
      payment.razorpayOrderId?.toLowerCase().includes(term) ||
      payment.razorpayPaymentId?.toLowerCase().includes(term) ||
      `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.toLowerCase().includes(term) ||
      payment.contact?.includes(term) || payment.email?.toLowerCase().includes(term)
    );
  });
  const adminPageTitles: Record<typeof activeTab, string> = {
    metrics: 'Operations overview',
    users: 'People & accounts',
    marketplace: 'Marketplace operations',
    verifications: 'Verification review',
    locations: 'Service areas',
    settings: 'Platform settings',
    payments: 'Payments & ledger',
  };

  if (isAuthLoading || (loading && isAuthenticated && isAdmin)) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-neutral-500 font-medium">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Strict public lockout
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-neutral-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Restricted Area
            </span>
            <h1 className="text-2xl font-black text-black tracking-tight mt-3">
              Administrator Access Required
            </h1>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed font-medium">
              This administrative console is strictly private and restricted to authorized Vaziro operators. Please sign in with administrator credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('CUSTOMER')}
            className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
          >
            Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e7e8df] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#718044]">
              Vaziro operations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce8ce] bg-[#f1f4e9] px-2.5 py-1 text-xs font-semibold text-[#48633e]">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin session
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#24352b] sm:text-3xl">
            {adminPageTitles[activeTab]}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-[#68716b]">
            Review platform activity, process queues and manage operational settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAdminData(true)}
          disabled={refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-[#d8ddd3] bg-white px-4 text-sm font-semibold text-[#40583d] shadow-sm transition hover:bg-[#f7f7f1] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      {(loadError || feedback) && <div className={`mb-5 flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${loadError || feedback?.type === 'error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-[#dce8ce] bg-[#f1f4e9] text-[#40583d]'}`} role={loadError || feedback?.type === 'error' ? 'alert' : 'status'}>
        <span>{loadError || feedback?.message}</span>
        <div className="flex shrink-0 items-center gap-3">
          {loadError && <button type="button" onClick={() => fetchAdminData(true)} disabled={refreshing} className="min-h-10 font-bold underline">Retry</button>}
          {feedback && <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss notification" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-black/5"><X className="h-4 w-4" /></button>}
        </div>
      </div>}

      {/* Tabs */}
      <nav aria-label="Admin sections" className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-[#e7e8df] bg-white p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          aria-current={activeTab === 'users' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <Users className="w-4 h-4" /> People <span className="hidden sm:inline">({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          type="button"
          aria-current={activeTab === 'marketplace' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'marketplace'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <Layers className="w-4 h-4" /> Marketplace
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          type="button"
          aria-current={activeTab === 'metrics' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <Home className="w-4 h-4" /> Overview
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          type="button"
          aria-current={activeTab === 'verifications' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Verify <span className="hidden sm:inline">({pendingVerificationCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          type="button"
          aria-current={activeTab === 'locations' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'locations'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <MapPin className="w-4 h-4" /> Locations
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          type="button"
          aria-current={activeTab === 'settings' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <Settings className="w-4 h-4" /> Settings
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          type="button"
          aria-current={activeTab === 'payments' ? 'page' : undefined}
          className={`min-h-10 rounded-md px-3 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-[#203c32] text-white shadow-sm'
              : 'text-[#647067] hover:bg-[#f1f2e9] hover:text-[#203c32]'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payments <span className="hidden sm:inline">({payments.length})</span>
        </button>
      </nav>

      {/* TAB 1: USERS & CREDITS HUB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Action and Search Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-11 w-full pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="CUSTOMER">Customers</option>
                <option value="PROFESSIONAL">Professionals</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-sm">Platform User Directory ({filteredUsers.length})</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full control over user accounts, role assignments, password resets, and credit balances.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Assigned Roles</th>
                    <th className="p-4">Status & KYC</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => {
                    const wallet = u.professionalProfile?.creditWallet;
                    const balance = wallet?.balance ?? 0;
                    const isVerified = Boolean(u.professionalProfile?.isVerified);

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition">
                        {/* Name & ID */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
                              {(u.firstName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                <span>{u.firstName} {u.lastName}</span>
                                {isVerified && (
                                  <span title="Verified Partner">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: #{u.id.substring(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-gray-700 font-medium">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{u.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{u.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r: any) => {
                              const rName = r.role?.name || r.name;
                              return (
                                <span
                                  key={r.id || rName}
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    rName === 'ADMIN' || rName === 'SUPER_ADMIN'
                                      ? 'bg-purple-100 text-purple-800'
                                      : rName === 'PROFESSIONAL'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {rName}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Status & Verification */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {u.status}
                            </span>
                            {u.professionalProfile && (
                              <div className="text-[10px] font-medium text-gray-500">
                                KYC: {u.professionalProfile.verification?.status || 'NONE'}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Credit Balance & Allotment */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-amber-950">
                              <div className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-600" /> Balance
                              </div>
                              <div className="text-sm font-black mt-0.5">
                                {balance} <span className="text-[10px] font-bold text-amber-700">cr</span>
                              </div>
                            </div>

                            <button
                              onClick={() => openCreditModal(u)}
                              className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-[11px] font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
                              title="Allot or Adjust Credits"
                            >
                              <Coins className="w-3 h-3 text-amber-400" />
                              <span>Adjust</span>
                            </button>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              aria-label={`Edit ${u.firstName || 'user'} profile`}
                              className="flex h-11 w-11 items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                              title="Edit User Profile & Roles"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPasswordModal(u)}
                              aria-label={`Reset ${u.firstName || 'user'} password`}
                              className="flex h-11 w-11 items-center justify-center bg-gray-100 hover:bg-gray-200 text-blue-700 rounded-lg transition"
                              title="Force Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={`min-h-11 px-2 rounded-lg text-[11px] font-bold transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              aria-label={`Delete ${u.firstName || 'user'}`}
                              className="flex h-11 w-11 items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              title="Permanently Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center">
                      <Search className="mx-auto h-7 w-7 text-[#8a948b]" />
                      <p className="mt-2 text-sm font-semibold text-[#344137]">No matching accounts</p>
                      <p className="mt-1 text-xs text-neutral-500">Try another name, email, phone number or role.</p>
                      {(searchQuery || roleFilter !== 'ALL') && <button type="button" onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); }} className="mt-3 min-h-10 text-xs font-semibold text-emerald-800 hover:underline">Clear filters</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETPLACE REQUIREMENTS & JOBS CONTROL */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <button
              onClick={() => setMarketplaceSubTab('requirements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                marketplaceSubTab === 'requirements'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Posted Requirements ({requirements.length})
            </button>
            <button
              onClick={() => setMarketplaceSubTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                marketplaceSubTab === 'jobs'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active Jobs & Escrow Contracts ({jobs.length})
            </button>
          </div>

          {/* Sub-tab: Requirements */}
          {marketplaceSubTab === 'requirements' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm">All Customer Quote Requests</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse and moderate posted service requirements across Delhi NCR zones.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Requirement Title</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Category / Zone</th>
                      <th className="p-4">Budget Range</th>
                      <th className="p-4">Proposals</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-900 max-w-xs truncate">
                          {req.title}
                          <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                            ID: #{req.id.substring(0, 8)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {req.customer?.user ? `${req.customer.user.firstName} ${req.customer.user.lastName}` : 'Customer'}
                        </td>
                        <td className="p-4 text-gray-600">
                          <span className="font-bold text-gray-800">{req.category?.name}</span>
                          <span className="block text-[10px] text-gray-400">{req.city?.name || 'NCR'}</span>
                        </td>
                        <td className="p-4 font-bold text-emerald-800">
                          ₹{req.budgetMin?.toLocaleString('en-IN')}{req.budgetMax ? ` - ₹${req.budgetMax.toLocaleString('en-IN')}` : ''}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                            {req._count?.quotations || 0} Quotes
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {req.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateRequirementStatus(req.id, 'CLOSED')}
                              disabled={savingActionKey === `requirement:${req.id}`}
                              className="min-h-10 text-xs font-bold text-red-600 hover:underline disabled:opacity-50 cursor-pointer"
                            >
                              {savingActionKey === `requirement:${req.id}` ? 'Updating...' : 'Close'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateRequirementStatus(req.id, 'ACTIVE')}
                              disabled={savingActionKey === `requirement:${req.id}`}
                              className="min-h-10 text-xs font-bold text-emerald-600 hover:underline disabled:opacity-50 cursor-pointer"
                            >
                              Reopen
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requirements.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">No customer requests are available yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab: Jobs */}
          {marketplaceSubTab === 'jobs' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm">Service Jobs & Escrow Protection Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monitor service agreements, escrow locks, milestone completions, and payment payouts.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Job Order</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Professional</th>
                      <th className="p-4">Agreed Price</th>
                      <th className="p-4">Escrow Status</th>
                      <th className="p-4">Job Lifecycle</th>
                      <th className="p-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map((job) => {
                      const isEscrowSecured = job.paymentProtection?.status === 'HELD' || job.payments?.some((p: any) => p.status === 'SECURED');

                      return (
                        <tr key={job.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold text-gray-900">
                            #{job.id.substring(0, 8).toUpperCase()}
                            <span className="block text-[10px] text-gray-400 font-normal mt-0.5">
                              {job.requirement?.title || 'Job Contract'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-700 font-medium">
                            {job.customer?.user ? `${job.customer.user.firstName} ${job.customer.user.lastName}` : 'Customer'}
                          </td>
                          <td className="p-4 text-gray-700 font-medium">
                            {job.professional?.user ? `${job.professional.user.firstName} ${job.professional.user.lastName}` : 'Partner'}
                          </td>
                          <td className="p-4 font-black text-gray-900 text-sm">
                            ₹{job.agreedPrice?.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            {isEscrowSecured ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> ₹{job.agreedPrice} Held in Escrow
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Escrow Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                              {job.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {job.status !== 'PAYMENT_RELEASED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateJobStatus(job.id, 'PAYMENT_RELEASED')}
                                  disabled={savingActionKey === `job:${job.id}`}
                                  className="min-h-10 text-[11px] font-bold text-emerald-700 hover:underline disabled:opacity-50 cursor-pointer"
                                >
                                  {savingActionKey === `job:${job.id}` ? 'Updating...' : 'Release payout'}
                                </button>
                              )}
                              {job.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateJobStatus(job.id, 'CLOSED')}
                                  disabled={savingActionKey === `job:${job.id}`}
                                  className="min-h-10 text-[11px] font-bold text-red-600 hover:underline disabled:opacity-50 cursor-pointer"
                                >
                                  Force Close
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {jobs.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">No service jobs are available yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <section aria-labelledby="admin-queues-title">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#718044]">Action queues</p>
              <h2 id="admin-queues-title" className="mt-1 text-lg font-semibold text-[#29382e]">Work that may need review</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button type="button" onClick={() => { setVerificationFilterStatus('PENDING_REVIEW'); setActiveTab('verifications'); }} className="group rounded-lg border border-[#e7e8df] bg-white p-4 text-left transition hover:border-[#c5d5a8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78935f]">
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#657168]"><span>Pending verification</span><ShieldCheck className="h-4 w-4 text-[#668044]" /></span>
                <span className="mt-2 block text-2xl font-semibold text-[#29382e]">{pendingVerificationCount}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#506e40]">Open queue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
              <button type="button" onClick={() => { setMarketplaceSubTab('requirements'); setActiveTab('marketplace'); }} className="group rounded-lg border border-[#e7e8df] bg-white p-4 text-left transition hover:border-[#c5d5a8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78935f]">
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#657168]"><span>Open customer requests</span><FileText className="h-4 w-4 text-[#668044]" /></span>
                <span className="mt-2 block text-2xl font-semibold text-[#29382e]">{openRequirementCount}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#506e40]">Moderate requests <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
              <button type="button" onClick={() => { setMarketplaceSubTab('jobs'); setActiveTab('marketplace'); }} className="group rounded-lg border border-[#e7e8df] bg-white p-4 text-left transition hover:border-[#c5d5a8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78935f]">
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#657168]"><span>In-progress jobs</span><Briefcase className="h-4 w-4 text-[#668044]" /></span>
                <span className="mt-2 block text-2xl font-semibold text-[#29382e]">{activeJobCount}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#506e40]">Review jobs <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
              <button type="button" onClick={() => { setPaymentFilterStatus('NEEDS_REVIEW'); setActiveTab('payments'); }} className="group rounded-lg border border-[#e7e8df] bg-white p-4 text-left transition hover:border-[#c5d5a8] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78935f]">
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#657168]"><span>Pending or failed payments</span><CreditCard className="h-4 w-4 text-[#668044]" /></span>
                <span className="mt-2 block text-2xl font-semibold text-[#29382e]">{pendingPaymentCount}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#506e40]">Open ledger <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Total Users</span>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">
                {metrics?.users?.total ?? '—'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {metrics?.users ? `${metrics.users.customers ?? 0} Customers • ${metrics.users.professionals ?? 0} Professionals` : 'Metrics unavailable'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Verified professional profiles</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {metrics?.users?.verifiedProfessionals ?? '—'}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">Marked verified in profile records</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Active Jobs</span>
              <div className="text-3xl font-extrabold text-blue-700 mt-1">
                {metrics?.marketplace?.activeJobs ?? '—'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {metrics?.marketplace ? `${metrics.marketplace.completedJobs ?? 0} Completed` : 'Metrics unavailable'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Credits Deducted</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {metrics?.financials?.totalCreditsDeducted ?? '—'} <span className="text-xs font-normal">cr</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Application revenue ledger</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">
                Marketplace Liquidity
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Requirements Posted:</span>
                  <span className="font-bold text-gray-900">{metrics?.marketplace?.totalRequirements ?? '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Active Service Orders:</span>
                  <span className="font-bold text-gray-900">{metrics?.marketplace?.activeJobs ?? '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Open Arbitration Disputes:</span>
                  <span className="font-bold text-red-600">{metrics?.marketplace?.openDisputes ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">
                Financial Gross Merchandise Value
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Gross Contract Volume (GMV):</span>
                  <span className="font-black text-emerald-800 text-base">
                    {metrics?.financials?.totalGmvInr === undefined ? '—' : `₹${metrics.financials.totalGmvInr.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Payments recorded:</span>
                  <span className="font-bold text-gray-900">
                    {payments.length}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Default Currency:</span>
                  <span className="font-bold text-gray-900">INR (₹)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Professional Verification Queue</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review government Aadhaar / DigiLocker credentials and manage compliance verification workflows.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                {['ALL', 'PENDING_REVIEW', 'PENDING', 'VERIFIED', 'FAILED', 'REVIEW_REQUIRED', 'EXPIRED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setVerificationFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      verificationFilterStatus === st
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'PENDING_REVIEW' ? 'Needs review' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by professional name, phone, email, reference ID, or professional ID..."
                  value={verificationSearch}
                  onChange={(e) => setVerificationSearch(e.target.value)}
                  className="min-h-11 w-full pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {verifications.filter((v) => {
              const verificationStatus = (v.status || 'NOT_STARTED').toUpperCase();
              const matchesStatus = verificationFilterStatus === 'ALL' || (verificationFilterStatus === 'PENDING_REVIEW'
                ? ['PENDING', 'REVIEW_REQUIRED'].includes(verificationStatus)
                : verificationStatus === verificationFilterStatus);

              const q = verificationSearch.toLowerCase().trim();
              if (!q) return matchesStatus;

              const name = `${v.professional?.user?.firstName || ''} ${v.professional?.user?.lastName || ''}`.toLowerCase();
              const phone = (v.professional?.user?.phone || '').toLowerCase();
              const email = (v.professional?.user?.email || '').toLowerCase();
              const refId = (v.referenceId || '').toLowerCase();
              const profId = (v.professionalProfileId || v.professional?.id || '').toLowerCase();
              const reqId = (v.requestId || '').toLowerCase();

              const matchesSearch =
                name.includes(q) ||
                phone.includes(q) ||
                email.includes(q) ||
                refId.includes(q) ||
                profId.includes(q) ||
                reqId.includes(q);

              return matchesStatus && matchesSearch;
            }).length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No verifications matching your filter criteria.
              </div>
            ) : (
              verifications
                .filter((v) => {
                  const verificationStatus = (v.status || 'NOT_STARTED').toUpperCase();
                  const matchesStatus = verificationFilterStatus === 'ALL' || (verificationFilterStatus === 'PENDING_REVIEW'
                    ? ['PENDING', 'REVIEW_REQUIRED'].includes(verificationStatus)
                    : verificationStatus === verificationFilterStatus);

                  const q = verificationSearch.toLowerCase().trim();
                  if (!q) return matchesStatus;

                  const name = `${v.professional?.user?.firstName || ''} ${v.professional?.user?.lastName || ''}`.toLowerCase();
                  const phone = (v.professional?.user?.phone || '').toLowerCase();
                  const email = (v.professional?.user?.email || '').toLowerCase();
                  const refId = (v.referenceId || '').toLowerCase();
                  const profId = (v.professionalProfileId || v.professional?.id || '').toLowerCase();
                  const reqId = (v.requestId || '').toLowerCase();

                  return (
                    matchesStatus &&
                    (name.includes(q) ||
                      phone.includes(q) ||
                      email.includes(q) ||
                      refId.includes(q) ||
                      profId.includes(q) ||
                      reqId.includes(q))
                  );
                })
                .map((v) => (
                  <div key={v.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {v.professional?.user?.firstName} {v.professional?.user?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">({v.professional?.user?.phone || 'No phone'})</span>
                        <span className="text-xs text-gray-400">• {v.professional?.user?.email || 'No email'}</span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                          ID: {v.professionalProfileId?.slice(0, 8) || v.id.slice(0, 8)}...
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Provider: <strong className="text-gray-700">{v.provider}</strong></span>
                        <span>•</span>
                        <span>
                          Ref ID: <span className="font-mono text-gray-700">{v.referenceId || 'N/A'}</span>
                        </span>
                        {v.requestId && (
                          <>
                            <span>•</span>
                            <span>Req ID: <span className="font-mono text-gray-700">{v.requestId.slice(0, 8)}...</span></span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : v.status === 'FAILED'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : v.status === 'REVIEW_REQUIRED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : v.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          {v.status === 'VERIFIED' ? '✓ VERIFIED VIA DIGILOCKER' : v.status}
                        </span>

                        {v.nameMatchStatus && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              v.nameMatchStatus === 'MATCH'
                                ? 'bg-emerald-100 text-emerald-800'
                                : v.nameMatchStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Name Match: {v.nameMatchStatus}
                          </span>
                        )}

                        {v.verifiedAt && (
                          <span className="text-[10px] text-gray-400">
                            Verified on: {new Date(v.verifiedAt).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>

                      {v.failureReason && (
                        <p className="text-xs text-red-600 bg-red-50/70 p-2 rounded-xl mt-1">
                          Failure Reason: {v.failureReason}
                        </p>
                      )}

                      {v.reviewReason && (
                        <p className="text-xs text-blue-700 bg-blue-50/70 p-2 rounded-xl mt-1">
                          Review Reason: {v.reviewReason}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      <button
                        onClick={() => {
                          setReviewModalCase(v);
                          setReviewReasonInput(v.reviewReason || '');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" /> Mark for Review
                      </button>

                      <button
                        onClick={() => {
                          setOverrideModalCase(v);
                          setOverrideAction('APPROVE');
                          setOverrideReason('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Administrative Override
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LOCATION SWITCHBOARD */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Geographic Coverage Controls
                </span>
                <h3 className="font-black text-gray-900 text-xl mt-1.5">Indian Location Switchboard</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Turn entire States or individual Cities <strong>ON</strong> or <strong>OFF</strong> with a single click. 
                  Active cities are immediately live for customer quote requests and service partner matching in Delhi NCR.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 block">Primary Footprint</span>
                <span className="text-sm font-black text-black">Delhi NCR (5 Hubs)</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {states.map((st) => {
              const totalCities = st.cities?.length || 0;
              const activeCities = st.cities?.filter((c: any) => c.isActive).length || 0;

              return (
                <div
                  key={st.id}
                  className={`rounded-2xl border transition p-5 ${
                    st.isActive ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-200 bg-neutral-100/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        st.isActive ? 'bg-black text-white' : 'bg-neutral-300 text-neutral-600'
                      }`}>
                        {st.code || st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-base text-gray-900 block">{st.name}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {activeCities} of {totalCities} cities active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLocation('state', st.id, st.isActive)}
                        disabled={savingActionKey === `state:${st.id}`}
                        className={`min-h-10 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer ${
                          st.isActive
                            ? 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300'
                            : 'text-neutral-600 bg-neutral-200 hover:bg-neutral-300 border border-neutral-300'
                        }`}
                      >
                        {st.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-700" /> State Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-neutral-500" /> State Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {st.cities && st.cities.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                        Operational Cities / Zones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {st.cities.map((ct: any) => (
                          <div
                            key={ct.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition ${
                              ct.isActive && st.isActive
                                ? 'bg-white border-neutral-200 shadow-sm'
                                : 'bg-neutral-100 border-dashed border-neutral-300'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-xs text-neutral-900 block">{ct.name}</span>
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {ct.isActive && st.isActive ? 'Live for quotes' : 'Paused / Offline'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleLocation('city', ct.id, ct.isActive)}
                              disabled={savingActionKey === `city:${ct.id}`}
                              className={`min-h-10 min-w-10 p-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer ${
                                ct.isActive
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-neutral-400 hover:bg-neutral-200'
                              }`}
                              title={ct.isActive ? 'Click to Pause' : 'Click to Activate'}
                            >
                              {ct.isActive ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-neutral-400 italic">No specific cities configured yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Dynamic Marketplace Rules & Fees</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live marketplace variables saved in database. Changes apply immediately across customer fees and credit deduct logic.
            </p>
          </div>

          <div className="p-6 space-y-4 max-w-2xl">
            {settings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#d8ddd3] bg-[#f8f9f5] p-8 text-center">
                <Settings className="mx-auto h-6 w-6 text-[#7c887d]" />
                <p className="mt-2 text-sm font-semibold text-[#344137]">No configurable settings returned</p>
                <p className="mt-1 text-xs text-neutral-500">If settings should be available, refresh the admin data or check the settings service.</p>
              </div>
            ) : (
              settings.map((s) => (
                <div key={s.id || s.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <span className="font-mono font-bold text-xs text-gray-900 block">{s.key}</span>
                    <span className="text-[11px] text-gray-500">{s.description || 'System marketplace rule'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSettings[s.key] !== undefined ? editingSettings[s.key] : s.value}
                      onChange={(e) =>
                        setEditingSettings({ ...editingSettings, [s.key]: e.target.value })
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold w-28 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      {savingKey === s.key ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: RAZORPAY PAYMENTS & TRANSACTIONS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Transactions</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{payments.length}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Recorded in Ledger</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Captured / Paid</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {payments.filter((p) => ['CAPTURED', 'SECURED', 'PAID', 'RELEASED'].includes(p.status)).length}
              </p>
              <span className="text-[11px] text-gray-500 font-medium mt-1 block">Verified Server-Side</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount Captured</span>
              <p className="text-2xl font-black text-gray-900 mt-1">
                ₹{payments
                  .filter((p) => ['CAPTURED', 'SECURED', 'PAID', 'RELEASED'].includes(p.status))
                  .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                  .toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Processed via Razorpay</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Failed / Incomplete</span>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {payments.filter((p) => p.status === 'FAILED').length}
              </p>
              <span className="text-[11px] text-gray-400 font-medium mt-1 block">Logged with Failure Code</span>
            </div>
          </div>

          {/* Search & Status Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order ID, Razorpay Payment ID, Customer name or contact..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                 className="min-h-11 w-full pl-9 pr-4 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={paymentFilterStatus}
                onChange={(e) => setPaymentFilterStatus(e.target.value)}
                className="min-h-11 px-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="CAPTURED">CAPTURED / SECURED</option>
                <option value="CREATED">CREATED / PENDING</option>
                <option value="NEEDS_REVIEW">Pending / failed</option>
                <option value="FAILED">FAILED</option>
                <option value="RELEASED">RELEASED</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Order Reference</th>
                    <th className="py-3.5 px-4">Customer / User</th>
                    <th className="py-3.5 px-4">Amount (₹)</th>
                    <th className="py-3.5 px-4">Razorpay Identifiers</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-gray-900 block">{p.orderId || p.id.substring(0, 8)}</span>
                          <span className="text-[10px] text-gray-400 capitalize">{p.description || 'Marketplace Service'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block">
                            {p.user ? `${p.user.firstName} ${p.user.lastName}` : (p.email || 'Direct User')}
                          </span>
                          <span className="text-[11px] text-gray-400 block">{p.contact || p.user?.phone || '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-gray-900 text-sm">₹{p.amount?.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400 block">INR</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-gray-900 block font-semibold select-all">
                            {p.razorpayPaymentId || '—'}
                          </span>
                          <span className="text-[10px] text-gray-400 select-all">{p.razorpayOrderId || '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-gray-800">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            {p.paymentMethod || 'Razorpay'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              ['CAPTURED', 'SECURED', 'PAID', 'RELEASED'].includes(p.status)
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {['CAPTURED', 'SECURED', 'PAID', 'RELEASED'].includes(p.status) ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : p.status === 'FAILED' ? (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {p.status}
                          </span>
                          {p.failureReason && (
                            <span className="text-[10px] text-rose-600 block mt-0.5 max-w-xs truncate">
                              {p.failureReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                        {payments.length === 0 ? 'No payment transactions are available yet.' : 'No transactions match these filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. CREDIT ALLOTMENT & ADJUSTMENT MODAL */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[#e7e8df] bg-[#fffefa] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">Allot / Adjust Credits</h3>
                  <span className="text-[11px] text-gray-500">
                    {creditModalUser.firstName} {creditModalUser.lastName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                aria-label="Close credit adjustment"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustCredits} className="mt-5 space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Current Balance:</span>
                <span className="text-base font-black text-neutral-900">
                  {creditModalUser.professionalProfile?.creditWallet?.balance ?? 0} Credits
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Adjustment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreditMode('ADD')}
                    aria-pressed={creditMode === 'ADD'}
                    className={`min-h-11 px-2 sm:px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                      creditMode === 'ADD'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditMode('DEDUCT')}
                    aria-pressed={creditMode === 'DEDUCT'}
                    className={`min-h-11 px-2 sm:px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                      creditMode === 'DEDUCT'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditMode('SET')}
                    aria-pressed={creditMode === 'SET'}
                    className={`min-h-11 px-2 sm:px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                      creditMode === 'SET'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Credit Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Reason / Audit Note (Optional)
                </label>
                <input
                  type="text"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. Welcome onboard promotional grant, dispute refund"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCredit}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {submittingCredit ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT USER PROFILE & ROLES MODAL */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-[#e7e8df] bg-[#fffefa] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">Edit User Profile & Roles</h3>
                  <span className="text-[11px] text-gray-500">ID: #{editModalUser.id.substring(0, 8)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                aria-label="Close edit user form"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mobile (+91)</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BANNED">BANNED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Partner Verification Badge</label>
                  <button
                    type="button"
                    onClick={() => setEditIsVerified(!editIsVerified)}
                    className={`w-full py-2 px-3 rounded-xl font-black flex items-center justify-center gap-2 border transition cursor-pointer ${
                      editIsVerified
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {editIsVerified ? 'Verified Partner ✓' : 'Unverified'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">User Roles</label>
                <div className="flex flex-wrap gap-2">
                  {['CUSTOMER', 'PROFESSIONAL', 'ADMIN'].map((r) => {
                    const isSelected = editRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditRoles(editRoles.filter((x) => x !== r));
                          } else {
                            setEditRoles([...editRoles, r]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {submittingEdit ? 'Saving...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESET PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-lg border border-[#e7e8df] bg-[#fffefa] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">Reset Password</h3>
                  <span className="text-[11px] text-gray-500">
                    {passwordModalUser.firstName} {passwordModalUser.lastName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                aria-label="Close password reset"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  New Temporary Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  The user can immediately log in with this new password.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {submittingPassword ? 'Resetting...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADMINISTRATIVE VERIFICATION OVERRIDE MODAL */}
      {overrideModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">Administrative Override</h3>
                  <span className="text-[11px] text-gray-500">
                    {overrideModalCase.professional?.user?.firstName} {overrideModalCase.professional?.user?.lastName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOverrideModalCase(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
              <p className="font-bold mb-0.5">⚠️ Caution: Manual Compliance Override</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Administrative overrides must never silently bypass DigiLocker protocols without legitimate legal/support justification. This action and your explanation will be permanently recorded in the system audit logs.
              </p>
            </div>

            <form onSubmit={handleOverrideSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Override Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideAction('APPROVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      overrideAction === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    Approve (VERIFIED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideAction('REJECT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      overrideAction === 'REJECT'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    Reject (FAILED)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Audit Justification Reason * (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State the verifiable reason, verified document number, or support ticket reference..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalCase(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer ${
                    overrideAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submittingOverride ? 'Recording...' : `Confirm ${overrideAction === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MARK FOR REVIEW MODAL */}
      {reviewModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm">Flag for Manual Review</h3>
                  <span className="text-[11px] text-gray-500">
                    {reviewModalCase.professional?.user?.firstName} {reviewModalCase.professional?.user?.lastName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReviewModalCase(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkReviewSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Reason for Review Flag
                </label>
                <textarea
                  rows={3}
                  value={reviewReasonInput}
                  onChange={(e) => setReviewReasonInput(e.target.value)}
                  placeholder="e.g. Identity discrepancy, name mismatch, manual Aadhaar document inspection needed..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalCase(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {submittingReview ? 'Updating...' : 'Set Review Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
