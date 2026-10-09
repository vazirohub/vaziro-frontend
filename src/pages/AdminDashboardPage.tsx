import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  ExternalLink,
  Filter,
  Package,
  Tag,
  Flag,
  Eye,
  EyeOff,
  ChevronDown,
  Zap,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square,
  MinusSquare,
  UserPlus,
  UserCheck,
  Shield,
  Headphones,
  Wallet,
} from 'lucide-react';
import { exportToExcel, exportRawToExcel, exportToCSV } from '../utils/excel';
import { Employee, StaffRole } from '../types';

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

type TabType =
  | 'metrics'
  | 'employees'
  | 'users'
  | 'marketplace'
  | 'verifications'
  | 'categories'
  | 'plans'
  | 'disputes'
  | 'payments'
  | 'locations'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const isStaff = user?.roles?.some((r) =>
    ['ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'FINANCE', 'VERIFICATION_ADMIN'].includes(r)
  );
  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
  const isAdmin = user?.roles?.includes('ADMIN') || isSuperAdmin;
  const isSupport = user?.roles?.includes('SUPPORT') || isAdmin;
  const isFinance = user?.roles?.includes('FINANCE') || isAdmin;
  const isVerificationAdmin = user?.roles?.includes('VERIFICATION_ADMIN') || isAdmin;

  // Platform Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>(defaultAdminLocations);
  const [payments, setPayments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [boostPackages, setBoostPackages] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Employee Management States
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('ALL');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('ALL');
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmp, setResetPasswordEmp] = useState<Employee | null>(null);
  const [deleteEmployeeCase, setDeleteEmployeeCase] = useState<Employee | null>(null);
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [showNewEmpPassword, setShowNewEmpPassword] = useState(false);
  const [submittingResetEmpPass, setSubmittingResetEmpPass] = useState(false);

  // Employee Form fields
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState<StaffRole>('SUPPORT');
  const [empPassword, setEmpPassword] = useState('');
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [empStatus, setEmpStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [submittingEmp, setSubmittingEmp] = useState(false);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [marketplaceSubTab, setMarketplaceSubTab] = useState<'requirements' | 'jobs'>('requirements');
  const [plansSubTab, setPlansSubTab] = useState<'plans' | 'boost'>('plans');

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingActionKey, setSavingActionKey] = useState<string | null>(null);

  // Global & Tab Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const [verificationFilterStatus, setVerificationFilterStatus] = useState<string>('ALL');
  const [verificationSearch, setVerificationSearch] = useState<string>('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('ALL');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');

  // Settings State
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

  // Verification Review & Override Modals
  const [overrideModalCase, setOverrideModalCase] = useState<any | null>(null);
  const [overrideAction, setOverrideAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);
  const [reviewModalCase, setReviewModalCase] = useState<any | null>(null);
  const [reviewReasonInput, setReviewReasonInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [viewDetailsModalCase, setViewDetailsModalCase] = useState<any | null>(null);

  // Category & Subcategory Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Sparkles');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Plan Modals
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planName, setPlanName] = useState('');
  const [planCredits, setPlanCredits] = useState(20);
  const [planPrice, setPlanPrice] = useState(799);
  const [planDiscount, setPlanDiscount] = useState('');
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Dispute / Report Resolve Modal
  const [resolveReportModalCase, setResolveReportModalCase] = useState<any | null>(null);
  const [resolveReportOutcome, setResolveReportOutcome] = useState('RESOLVED');
  const [resolveReportNotes, setResolveReportNotes] = useState('');
  const [submittingResolveReport, setSubmittingResolveReport] = useState(false);

  // Multi-Select Batch Operations States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedVerificationIds, setSelectedVerificationIds] = useState<string[]>([]);
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<string[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [selectedDisputeIds, setSelectedDisputeIds] = useState<string[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Generic Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Fetch all admin data
  const fetchAdminData = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setLoadError(null);

      const [
        mRes,
        uRes,
        reqRes,
        jobsRes,
        vRes,
        sRes,
        statesRes,
        payRes,
        catRes,
        plansRes,
        boostRes,
        repRes,
        empRes,
      ] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminUsers().catch(() => null),
        api.getAdminRequirements().catch(() => null),
        api.getAdminJobs().catch(() => null),
        api.getAdminVerifications().catch(() => null),
        api.getAdminSettings().catch(() => null),
        api.getAdminLocations().catch(() => null),
        api.getPaymentTransactions().catch(() => null),
        api.getCategories().catch(() => null),
        api.getAdminPlans().catch(() => null),
        api.getAdminBoostPackages().catch(() => null),
        api.getAdminReports().catch(() => null),
        isAdmin ? api.getAdminEmployees().catch(() => null) : Promise.resolve(null),
      ]);

      if (mRes?.data?.data) setMetrics(mRes.data.data);
      if (uRes?.data?.data) setUsers(uRes.data.data);
      if (empRes?.data?.data) setEmployees(empRes.data.data);
      if (reqRes?.data?.data) setRequirements(reqRes.data.data);
      if (jobsRes?.data?.data) setJobs(jobsRes.data.data);
      if (vRes?.data?.data) setVerifications(vRes.data.data);
      if (payRes?.data?.data?.payments) setPayments(payRes.data.data.payments);
      if (catRes?.data?.data) setCategories(catRes.data.data);
      if (plansRes?.data?.data) setPlans(plansRes.data.data);
      if (boostRes?.data?.data) setBoostPackages(boostRes.data.data);
      if (repRes?.data?.data) {
        setReports(repRes.data.data.reports || repRes.data.data || []);
      }

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
      setLoadError('Some admin data could not be refreshed. Check network connectivity.');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && (isAdmin || isStaff)) {
        fetchAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAdmin, isStaff, isAuthLoading]);

  // User Actions Handlers
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
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not update user.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

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
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Could not reset password.' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setSavingActionKey(`status-${userId}`);
      const res = await api.updateUserStatus(userId, newStatus);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `User status changed to ${newStatus}.` });
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update user status.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and delete user "${name}"? This action is irreversible.`)) return;
    try {
      setSavingActionKey(`delete-${userId}`);
      const res = await api.deleteAdminUser(userId);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `User "${name}" deactivated successfully.` });
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to delete user.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Verification Review Handlers
  const handleReviewVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalCase) return;
    try {
      setSubmittingReview(true);
      await api.markAdminVerificationReview(reviewModalCase.id, reviewReasonInput || 'Flagged for compliance review');
      setFeedback({ type: 'success', message: 'Case marked for in-depth review.' });
      setReviewModalCase(null);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update review status.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAdminOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalCase) return;
    try {
      setSubmittingOverride(true);
      await api.adminVerificationOverride(overrideModalCase.id, overrideAction, overrideReason.trim() || 'Admin verification decision');
      setFeedback({ type: 'success', message: `Case ${overrideAction.toLowerCase()}d successfully.` });
      setOverrideModalCase(null);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to process override decision.' });
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Quick 1-Click Verification Approval
  const handleQuickApproveVerification = async (caseId: string, profName: string) => {
    try {
      setSavingActionKey(`approve-${caseId}`);
      await api.adminVerificationOverride(caseId, 'APPROVE', 'One-click admin verified via DigiLocker credential confirmation');
      setFeedback({ type: 'success', message: `Verified badge granted to ${profName}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to approve verification.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Requirement & Job Status Updates
  const handleUpdateRequirementStatus = async (id: string, newStatus: string) => {
    try {
      setSavingActionKey(`req-${id}`);
      await api.updateAdminRequirementStatus(id, newStatus);
      setFeedback({ type: 'success', message: `Requirement status updated to ${newStatus}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update requirement status.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleUpdateJobStatus = async (id: string, newStatus: string) => {
    try {
      setSavingActionKey(`job-${id}`);
      await api.updateAdminJobStatus(id, newStatus, 'Admin contract management');
      setFeedback({ type: 'success', message: `Job contract status updated to ${newStatus}.` });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update job status.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Category & Subcategory Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) return;
    try {
      setSubmittingCat(true);
      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, {
          name: catName,
          slug: catSlug,
          description: catDesc,
        });
        setFeedback({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await api.createAdminCategory({
          name: catName,
          slug: catSlug,
          description: catDesc,
          icon: catIcon,
        });
        setFeedback({ type: 'success', message: 'New category created successfully.' });
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Could not save category.' });
    } finally {
      setSubmittingCat(false);
    }
  };

  // Credit Plan Save Handler
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    try {
      setSubmittingPlan(true);
      if (editingPlan) {
        await api.updateAdminPlan(editingPlan.id, {
          name: planName,
          credits: Number(planCredits),
          priceInr: Number(planPrice),
          badge: planDiscount,
        });
        setFeedback({ type: 'success', message: 'Credit plan updated successfully.' });
      } else {
        await api.createAdminPlan({
          name: planName,
          credits: Number(planCredits),
          priceInr: Number(planPrice),
          badge: planDiscount,
        });
        setFeedback({ type: 'success', message: 'New credit plan created successfully.' });
      }
      setPlanModalOpen(false);
      setEditingPlan(null);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Could not save credit plan.' });
    } finally {
      setSubmittingPlan(false);
    }
  };

  // Report Resolution Handler
  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveReportModalCase) return;
    try {
      setSubmittingResolveReport(true);
      await api.resolveAdminReport(resolveReportModalCase.id, {
        status: resolveReportOutcome,
        adminNotes: resolveReportNotes,
      });
      setFeedback({ type: 'success', message: 'Report resolved and archived.' });
      setResolveReportModalCase(null);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to resolve report.' });
    } finally {
      setSubmittingResolveReport(false);
    }
  };

  // Trigger Expired Credit Batches
  const handleTriggerExpiredBatches = async () => {
    try {
      setSavingActionKey('expire-batches');
      await api.triggerBatchExpiry();
      setFeedback({ type: 'success', message: 'Expired credit batches processed successfully.' });
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to process expired batches.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Location Toggle
  const handleToggleLocation = async (type: 'state' | 'city', id: string, currentStatus: boolean) => {
    try {
      setSavingActionKey(`loc-${id}`);
      await api.toggleAdminLocation(type, id, !currentStatus);
      setStates((prev) =>
        prev.map((s) => {
          if (type === 'state' && s.id === id) return { ...s, isActive: !currentStatus };
          if (type === 'city') {
            return {
              ...s,
              cities: s.cities.map((c: any) => (c.id === id ? { ...c, isActive: !currentStatus } : c)),
            };
          }
          return s;
        })
      );
      setFeedback({ type: 'success', message: 'Location status updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update location status.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  // Settings Save
  const handleSaveSetting = async (key: string) => {
    try {
      setSavingKey(key);
      await api.updateAdminSetting(key, editingSettings[key]);
      setFeedback({ type: 'success', message: `Setting "${key}" updated.` });
      await fetchAdminData(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to save setting.' });
    } finally {
      setSavingKey(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchQuery =
        !q ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q);

      const roles = u.roles?.map((r: any) => r.role?.name || r.name) || ['CUSTOMER'];
      const matchRole = userRoleFilter === 'ALL' || roles.includes(userRoleFilter);
      const matchStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Filtered Requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((r) => {
      const q = reqSearch.toLowerCase();
      const matchQ =
        !q ||
        r.title?.toLowerCase().includes(q) ||
        r.client?.firstName?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q);
      const matchStatus = reqStatusFilter === 'ALL' || r.status === reqStatusFilter;
      return matchQ && matchStatus;
    });
  }, [requirements, reqSearch, reqStatusFilter]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      return jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
    });
  }, [jobs, jobStatusFilter]);

  // Filtered Verifications
  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const q = verificationSearch.toLowerCase();
      const matchQ =
        !q ||
        v.professional?.user?.firstName?.toLowerCase().includes(q) ||
        v.professional?.user?.lastName?.toLowerCase().includes(q) ||
        v.professional?.user?.phone?.toLowerCase().includes(q) ||
        v.id?.toLowerCase().includes(q);
      const matchStatus = verificationFilterStatus === 'ALL' || v.status === verificationFilterStatus;
      return matchQ && matchStatus;
    });
  }, [verifications, verificationSearch, verificationFilterStatus]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = paymentSearch.toLowerCase();
      const matchQ = !q || p.id?.toLowerCase().includes(q) || p.orderId?.toLowerCase().includes(q);
      const matchStatus = paymentFilterStatus === 'ALL' || p.status === paymentFilterStatus;
      return matchQ && matchStatus;
    });
  }, [payments, paymentSearch, paymentFilterStatus]);

  const pendingVerificationCount = verifications.filter((v) => v.status === 'PENDING').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING').length;

  // Clear selections when switching tabs
  useEffect(() => {
    setSelectedUserIds([]);
    setSelectedVerificationIds([]);
    setSelectedRequirementIds([]);
    setSelectedJobIds([]);
    setSelectedDisputeIds([]);
    setSelectedReportIds([]);
  }, [activeTab]);

  // ============================================================================
  // MULTI-SELECT HANDLERS & BATCH ACTIONS
  // ============================================================================

  // Users Multi-Select
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsersSelection = () => {
    const visibleIds = filteredUsers.map((u) => u.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkUsersDelete = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminUsersAction({ userIds: selectedUserIds, action: 'DELETE' });
      setFeedback({ type: 'success', message: `Deleted ${res.data?.data?.affectedCount ?? selectedUserIds.length} users successfully.` });
      setSelectedUserIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to delete users.' });
    } finally {
      setBulkActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleBulkUsersStatus = async (status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => {
    if (selectedUserIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminUsersAction({ userIds: selectedUserIds, action: 'STATUS_UPDATE', status });
      setFeedback({ type: 'success', message: `Updated ${res.data?.data?.affectedCount ?? selectedUserIds.length} users to ${status}.` });
      setSelectedUserIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to update user status.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUsersVerify = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminUsersAction({ userIds: selectedUserIds, action: 'VERIFY' });
      setFeedback({ type: 'success', message: `Verified ${res.data?.data?.affectedCount ?? selectedUserIds.length} professional profiles.` });
      setSelectedUserIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to verify users.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Verifications Multi-Select
  const toggleVerificationSelection = (verId: string) => {
    setSelectedVerificationIds((prev) =>
      prev.includes(verId) ? prev.filter((id) => id !== verId) : [...prev, verId]
    );
  };

  const toggleAllVerificationsSelection = () => {
    const visibleIds = filteredVerifications.map((v) => v.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedVerificationIds.includes(id));
    if (allSelected) {
      setSelectedVerificationIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedVerificationIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkVerificationsApprove = async () => {
    if (selectedVerificationIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminVerificationsAction({ verificationIds: selectedVerificationIds, action: 'APPROVE' });
      setFeedback({ type: 'success', message: `Approved & verified ${res.data?.data?.affectedCount ?? selectedVerificationIds.length} submissions.` });
      setSelectedVerificationIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to approve verifications.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkVerificationsReject = async (reason?: string) => {
    if (selectedVerificationIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminVerificationsAction({
        verificationIds: selectedVerificationIds,
        action: 'REJECT',
        rejectionReason: reason || 'Bulk rejected by administrator',
      });
      setFeedback({ type: 'success', message: `Rejected ${res.data?.data?.affectedCount ?? selectedVerificationIds.length} verification cases.` });
      setSelectedVerificationIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to reject verifications.' });
    } finally {
      setBulkActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleBulkVerificationsReset = async () => {
    if (selectedVerificationIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminVerificationsAction({ verificationIds: selectedVerificationIds, action: 'RESET' });
      setFeedback({ type: 'success', message: `Reset ${res.data?.data?.affectedCount ?? selectedVerificationIds.length} cases to Pending.` });
      setSelectedVerificationIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to reset verifications.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Requirements Multi-Select
  const toggleRequirementSelection = (reqId: string) => {
    setSelectedRequirementIds((prev) =>
      prev.includes(reqId) ? prev.filter((id) => id !== reqId) : [...prev, reqId]
    );
  };

  const toggleAllRequirementsSelection = () => {
    const visibleIds = filteredRequirements.map((r) => r.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRequirementIds.includes(id));
    if (allSelected) {
      setSelectedRequirementIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedRequirementIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkRequirementsStatus = async (status: string) => {
    if (selectedRequirementIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminRequirementsAction({ requirementIds: selectedRequirementIds, action: 'STATUS_UPDATE', status });
      setFeedback({ type: 'success', message: `Updated ${res.data?.data?.affectedCount ?? selectedRequirementIds.length} requirements to ${status}.` });
      setSelectedRequirementIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to update requirements.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRequirementsDelete = async () => {
    if (selectedRequirementIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminRequirementsAction({ requirementIds: selectedRequirementIds, action: 'DELETE' });
      setFeedback({ type: 'success', message: `Deleted ${res.data?.data?.affectedCount ?? selectedRequirementIds.length} requirements.` });
      setSelectedRequirementIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to delete requirements.' });
    } finally {
      setBulkActionLoading(false);
      setConfirmModal(null);
    }
  };

  // Jobs Multi-Select
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const toggleAllJobsSelection = () => {
    const visibleIds = filteredJobs.map((j) => j.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedJobIds.includes(id));
    if (allSelected) {
      setSelectedJobIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedJobIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkJobsStatus = async (status: string) => {
    if (selectedJobIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminJobsAction({ jobIds: selectedJobIds, action: 'STATUS_UPDATE', status });
      setFeedback({ type: 'success', message: `Updated ${res.data?.data?.affectedCount ?? selectedJobIds.length} jobs to ${status}.` });
      setSelectedJobIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to update jobs.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkJobsDelete = async () => {
    if (selectedJobIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminJobsAction({ jobIds: selectedJobIds, action: 'DELETE' });
      setFeedback({ type: 'success', message: `Deleted ${res.data?.data?.affectedCount ?? selectedJobIds.length} jobs.` });
      setSelectedJobIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to delete jobs.' });
    } finally {
      setBulkActionLoading(false);
      setConfirmModal(null);
    }
  };

  // Reports Multi-Select
  const toggleReportSelection = (reportId: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const toggleAllReportsSelection = () => {
    const visibleIds = reports.map((r) => r.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedReportIds.includes(id));
    if (allSelected) {
      setSelectedReportIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedReportIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkReportsAction = async (action: 'RESOLVE' | 'DISMISS' | 'DELETE', notes?: string) => {
    if (selectedReportIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await api.bulkAdminReportsAction({ reportIds: selectedReportIds, action, adminNotes: notes });
      setFeedback({ type: 'success', message: `Bulk ${action.toLowerCase()} executed on ${res.data?.data?.affectedCount ?? selectedReportIds.length} reports.` });
      setSelectedReportIds([]);
      await fetchAdminData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to process reports.' });
    } finally {
      setBulkActionLoading(false);
      setConfirmModal(null);
    }
  };

  // ============================================================================
  // EXCEL & CSV EXPORTERS
  // ============================================================================

  // 1. Export Users (Excel & CSV)
  const handleExportUsersExcel = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedUserIds.length > 0
      ? filteredUsers.filter((u) => selectedUserIds.includes(u.id))
      : filteredUsers;

    const columns = [
      { header: 'User ID', accessor: (u: any) => u.id },
      { header: 'First Name', accessor: (u: any) => u.firstName || '' },
      { header: 'Last Name', accessor: (u: any) => u.lastName || '' },
      { header: 'Email', accessor: (u: any) => u.email || '' },
      { header: 'Phone', accessor: (u: any) => u.phone || '' },
      { header: 'Role(s)', accessor: (u: any) => u.roles?.map((r: any) => r.role?.name || r.name).join(', ') || 'CUSTOMER' },
      { header: 'Status', accessor: (u: any) => u.status || 'ACTIVE' },
      { header: 'Verified Professional', accessor: (u: any) => u.professionalProfile?.isVerified ? 'YES' : 'NO' },
      { header: 'Credits Balance', accessor: (u: any) => u.professionalProfile?.creditWallet?.balance ?? 0 },
      { header: 'Registration Date', accessor: (u: any) => u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN') : '' },
    ];

    exportToExcel('vaziro-users', 'Users', columns, targetData);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} users to Excel (.xlsx) successfully.` });
  };

  const handleExportUsersCSV = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedUserIds.length > 0
      ? filteredUsers.filter((u) => selectedUserIds.includes(u.id))
      : filteredUsers;

    const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Roles', 'Status', 'Verified', 'Credits', 'Created At'];
    const rows = targetData.map((u) => [
      u.id,
      u.firstName || '',
      u.lastName || '',
      u.email || '',
      u.phone || '',
      u.roles?.map((r: any) => r.role?.name || r.name).join('; ') || '',
      u.status || 'ACTIVE',
      u.professionalProfile?.isVerified ? 'YES' : 'NO',
      u.professionalProfile?.creditWallet?.balance ?? 0,
      u.createdAt || '',
    ]);

    exportToCSV('vaziro-users', headers, rows);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} users to CSV successfully.` });
  };

  // 2. Export Verifications (Excel & CSV)
  const handleExportVerificationsExcel = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedVerificationIds.length > 0
      ? filteredVerifications.filter((v) => selectedVerificationIds.includes(v.id))
      : filteredVerifications;

    const columns = [
      { header: 'Verification ID', accessor: (v: any) => v.id },
      { header: 'Reference ID', accessor: (v: any) => v.referenceId || v.requestId || '' },
      { header: 'Professional Name', accessor: (v: any) => `${v.professional?.user?.firstName || ''} ${v.professional?.user?.lastName || ''}`.trim() },
      { header: 'Phone', accessor: (v: any) => v.professional?.user?.phone || '' },
      { header: 'Email', accessor: (v: any) => v.professional?.user?.email || '' },
      { header: 'Status', accessor: (v: any) => v.status || 'PENDING' },
      { header: 'Submission Date', accessor: (v: any) => v.createdAt ? new Date(v.createdAt).toLocaleString('en-IN') : '' },
      { header: 'Verified Date', accessor: (v: any) => v.verifiedAt ? new Date(v.verifiedAt).toLocaleString('en-IN') : '' },
      { header: 'Rejection Reason', accessor: (v: any) => v.rejectionReason || '' },
    ];

    exportToExcel('vaziro-verifications', 'Verifications', columns, targetData);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} verifications to Excel (.xlsx) successfully.` });
  };

  // 3. Export Requirements (Excel & CSV)
  const handleExportRequirementsExcel = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedRequirementIds.length > 0
      ? filteredRequirements.filter((r) => selectedRequirementIds.includes(r.id))
      : filteredRequirements;

    const columns = [
      { header: 'Requirement ID', accessor: (r: any) => r.id },
      { header: 'Title', accessor: (r: any) => r.title || '' },
      { header: 'Category', accessor: (r: any) => r.category?.name || '' },
      { header: 'Client Name', accessor: (r: any) => `${r.client?.firstName || ''} ${r.client?.lastName || ''}`.trim() || 'Client' },
      { header: 'Min Budget (INR)', accessor: (r: any) => r.budgetMin ?? '' },
      { header: 'Max Budget (INR)', accessor: (r: any) => r.budgetMax ?? '' },
      { header: 'City', accessor: (r: any) => r.city || '' },
      { header: 'Status', accessor: (r: any) => r.status || 'OPEN' },
      { header: 'Posted Date', accessor: (r: any) => r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '' },
    ];

    exportToExcel('vaziro-requirements', 'Requirements', columns, targetData);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} requirements to Excel (.xlsx) successfully.` });
  };

  // 4. Export Jobs (Excel & CSV)
  const handleExportJobsExcel = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedJobIds.length > 0
      ? filteredJobs.filter((j) => selectedJobIds.includes(j.id))
      : filteredJobs;

    const columns = [
      { header: 'Job ID', accessor: (j: any) => j.id },
      { header: 'Requirement', accessor: (j: any) => j.requirement?.title || '' },
      { header: 'Client', accessor: (j: any) => `${j.client?.firstName || ''} ${j.client?.lastName || ''}`.trim() },
      { header: 'Professional', accessor: (j: any) => `${j.professional?.user?.firstName || ''} ${j.professional?.user?.lastName || ''}`.trim() },
      { header: 'Agreed Price (INR)', accessor: (j: any) => j.agreedAmount || j.agreedPrice || 0 },
      { header: 'Job Status', accessor: (j: any) => j.status || '' },
      { header: 'Work Status', accessor: (j: any) => j.workStatus || '' },
      { header: 'Escrow Secured', accessor: (j: any) => j.paymentSecured ? 'YES' : 'NO' },
      { header: 'Created Date', accessor: (j: any) => j.createdAt ? new Date(j.createdAt).toLocaleString('en-IN') : '' },
    ];

    exportToExcel('vaziro-jobs', 'Jobs', columns, targetData);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} jobs to Excel (.xlsx) successfully.` });
  };

  // 5. Export Payments (Excel & CSV)
  const handleExportPaymentsExcel = () => {
    const columns = [
      { header: 'Payment ID', accessor: (p: any) => p.id },
      { header: 'Order ID', accessor: (p: any) => p.orderId || p.razorpayOrderId || '' },
      { header: 'Job ID', accessor: (p: any) => p.jobId || '' },
      { header: 'Amount (INR)', accessor: (p: any) => p.amount || 0 },
      { header: 'Status', accessor: (p: any) => p.status || '' },
      { header: 'Payment Method', accessor: (p: any) => p.paymentMethod || 'Razorpay' },
      { header: 'Created Date', accessor: (p: any) => p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : '' },
    ];

    exportToExcel('vaziro-payments', 'Payments', columns, filteredPayments);
    setFeedback({ type: 'success', message: `Exported ${filteredPayments.length} payments to Excel (.xlsx) successfully.` });
  };

  const handleExportUsers = () => handleExportUsersExcel(false);

  const handleExportVerificationsCSV = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedVerificationIds.length > 0
      ? filteredVerifications.filter((v) => selectedVerificationIds.includes(v.id))
      : filteredVerifications;
    const headers = ['Verification ID', 'Reference ID', 'Professional Name', 'Phone', 'Email', 'Status', 'Submitted At', 'Verified At', 'Reason'];
    const rows = targetData.map((v) => [
      v.id,
      v.referenceId || v.requestId || '',
      `${v.professional?.user?.firstName || ''} ${v.professional?.user?.lastName || ''}`.trim(),
      v.professional?.user?.phone || '',
      v.professional?.user?.email || '',
      v.status || 'PENDING',
      v.createdAt || '',
      v.verifiedAt || '',
      v.rejectionReason || '',
    ]);
    exportToCSV('vaziro-verifications', headers, rows);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} verifications to CSV.` });
  };
  const handleExportVerifications = () => handleExportVerificationsCSV(false);

  const handleExportRequirementsCSV = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedRequirementIds.length > 0
      ? filteredRequirements.filter((r) => selectedRequirementIds.includes(r.id))
      : filteredRequirements;
    const headers = ['Requirement ID', 'Title', 'Category', 'Client', 'Min Budget', 'Max Budget', 'City', 'Status', 'Created At'];
    const rows = targetData.map((r) => [
      r.id,
      r.title || '',
      r.category?.name || '',
      `${r.client?.firstName || ''} ${r.client?.lastName || ''}`.trim(),
      r.budgetMin ?? '',
      r.budgetMax ?? '',
      r.city || '',
      r.status || 'OPEN',
      r.createdAt || '',
    ]);
    exportToCSV('vaziro-requirements', headers, rows);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} requirements to CSV.` });
  };

  const handleExportJobsCSV = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedJobIds.length > 0
      ? filteredJobs.filter((j) => selectedJobIds.includes(j.id))
      : filteredJobs;
    const headers = ['Job ID', 'Requirement', 'Client', 'Professional', 'Agreed Price', 'Status', 'Work Status', 'Created At'];
    const rows = targetData.map((j) => [
      j.id,
      j.requirement?.title || '',
      `${j.client?.firstName || ''} ${j.client?.lastName || ''}`.trim(),
      `${j.professional?.user?.firstName || ''} ${j.professional?.user?.lastName || ''}`.trim(),
      j.agreedAmount || j.agreedPrice || 0,
      j.status || '',
      j.workStatus || '',
      j.createdAt || '',
    ]);
    exportToCSV('vaziro-jobs', headers, rows);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} jobs to CSV.` });
  };

  const handleExportMarketplace = () => {
    if (marketplaceSubTab === 'requirements') {
      handleExportRequirementsCSV(false);
    } else {
      handleExportJobsCSV(false);
    }
  };

  const handleExportPaymentsCSV = () => {
    const headers = ['Payment ID', 'Order ID', 'Job ID', 'Amount', 'Status', 'Payment Method', 'Created At'];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.orderId || p.razorpayOrderId || '',
      p.jobId || '',
      p.amount || 0,
      p.status || '',
      p.paymentMethod || 'Razorpay',
      p.createdAt || '',
    ]);
    exportToCSV('vaziro-payments', headers, rows);
    setFeedback({ type: 'success', message: `Exported ${filteredPayments.length} payments to CSV.` });
  };
  const handleExportPayments = () => handleExportPaymentsCSV();

  // 6. Export Categories Taxonomy (Excel)
  const handleExportCategoriesExcel = () => {
    const columns = [
      { header: 'Category Name', accessor: (c: any) => c.name },
      { header: 'Slug', accessor: (c: any) => c.slug },
      { header: 'Subcategories Count', accessor: (c: any) => c.subcategories?.length || 0 },
      { header: 'Description', accessor: (c: any) => c.description || '' },
    ];
    exportToExcel('vaziro-categories', 'Categories', columns, categories);
    setFeedback({ type: 'success', message: `Exported ${categories.length} categories to Excel (.xlsx) successfully.` });
  };

  // 7. Export Plans & Batches (Excel)
  const handleExportPlansExcel = () => {
    const columns = [
      { header: 'Plan ID', accessor: (p: any) => p.id },
      { header: 'Plan Name', accessor: (p: any) => p.name },
      { header: 'Credits Allotted', accessor: (p: any) => p.credits },
      { header: 'Price (INR)', accessor: (p: any) => p.priceInr },
      { header: 'Validity (Days)', accessor: (p: any) => p.validityDays },
      { header: 'Active', accessor: (p: any) => p.isActive ? 'YES' : 'NO' },
    ];
    exportToExcel('vaziro-credit-plans', 'Plans', columns, plans);
    setFeedback({ type: 'success', message: `Exported credit plans to Excel (.xlsx) successfully.` });
  };

  // 8. Export Moderation Reports (Excel)
  const handleExportReportsExcel = (selectedOnly = false) => {
    const targetData = selectedOnly && selectedReportIds.length > 0
      ? reports.filter((r) => selectedReportIds.includes(r.id))
      : reports;

    const columns = [
      { header: 'Report ID', accessor: (r: any) => r.id },
      { header: 'Reason', accessor: (r: any) => r.reason || '' },
      { header: 'Description', accessor: (r: any) => r.description || '' },
      { header: 'Status', accessor: (r: any) => r.status || 'OPEN' },
      { header: 'Reported User ID', accessor: (r: any) => r.reportedUserId || '' },
      { header: 'Reporter User ID', accessor: (r: any) => r.reporterUserId || '' },
      { header: 'Admin Notes', accessor: (r: any) => r.adminNotes || '' },
      { header: 'Created Date', accessor: (r: any) => r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '' },
    ];
    exportToExcel('vaziro-moderation-reports', 'Reports', columns, targetData);
    setFeedback({ type: 'success', message: `Exported ${targetData.length} reports to Excel (.xlsx) successfully.` });
  };

  // ============================================================================
  // EMPLOYEE & STAFF DIRECTORY HANDLERS
  // ============================================================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = employeeSearch.toLowerCase().trim();
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const phone = (emp.phone || '').toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || email.includes(q) || phone.includes(q);

      const matchesRole =
        employeeRoleFilter === 'ALL' ||
        emp.roles?.includes(employeeRoleFilter) ||
        emp.role === employeeRoleFilter;

      const matchesStatus =
        employeeStatusFilter === 'ALL' || emp.status === employeeStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, employeeSearch, employeeRoleFilter, employeeStatusFilter]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFirstName.trim()) {
      setFeedback({ type: 'error', message: 'First name is required.' });
      return;
    }
    if (!empEmail.trim()) {
      setFeedback({ type: 'error', message: 'Work email is required.' });
      return;
    }
    if (!empPassword || empPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Initial password must be at least 6 characters long.' });
      return;
    }

    try {
      setSubmittingEmp(true);
      const res = await api.createAdminEmployee({
        firstName: empFirstName.trim(),
        lastName: empLastName.trim(),
        email: empEmail.trim().toLowerCase(),
        phone: empPhone.trim() || undefined,
        role: empRole,
        password: empPassword,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'Employee created successfully.' });
        setAddEmployeeModalOpen(false);
        setEmpFirstName('');
        setEmpLastName('');
        setEmpEmail('');
        setEmpPhone('');
        setEmpPassword('');
        setEmpRole('SUPPORT');
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to create employee.' });
    } finally {
      setSubmittingEmp(false);
    }
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpFirstName(emp.firstName || '');
    setEmpLastName(emp.lastName || '');
    setEmpEmail(emp.email || '');
    setEmpPhone(emp.phone ? emp.phone.replace('+91', '') : '');
    setEmpRole(emp.role || (emp.roles?.[0] as StaffRole) || 'SUPPORT');
    setEmpStatus(emp.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE');
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      setSubmittingEmp(true);
      const res = await api.updateAdminEmployee(editingEmployee.id, {
        firstName: empFirstName.trim(),
        lastName: empLastName.trim(),
        email: empEmail.trim().toLowerCase(),
        phone: empPhone.trim() || undefined,
        role: empRole,
        status: empStatus,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Employee profile updated successfully.' });
        setEditingEmployee(null);
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Failed to update employee.' });
    } finally {
      setSubmittingEmp(false);
    }
  };

  const handleToggleEmployeeStatus = async (emp: Employee) => {
    if (emp.id === user?.id) {
      setFeedback({ type: 'error', message: 'You cannot change status of your own administrator account.' });
      return;
    }
    const nextStatus = emp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setSavingActionKey(`emp-status-${emp.id}`);
      const res = await api.updateAdminEmployeeStatus(emp.id, nextStatus);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Employee status changed to ${nextStatus}.` });
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Failed to update employee status.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleResetEmpPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordEmp) return;
    if (!newEmpPassword || newEmpPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    try {
      setSubmittingResetEmpPass(true);
      const res = await api.resetAdminEmployeePassword(resetPasswordEmp.id, { newPassword: newEmpPassword });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Employee password reset successfully.' });
        setResetPasswordEmp(null);
        setNewEmpPassword('');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Failed to reset employee password.' });
    } finally {
      setSubmittingResetEmpPass(false);
    }
  };

  const handleDeleteEmployeeSubmit = async () => {
    if (!deleteEmployeeCase) return;
    if (deleteEmployeeCase.id === user?.id) {
      setFeedback({ type: 'error', message: 'You cannot delete your own administrator account.' });
      setDeleteEmployeeCase(null);
      return;
    }
    try {
      setSavingActionKey(`del-emp-${deleteEmployeeCase.id}`);
      const res = await api.deleteAdminEmployee(deleteEmployeeCase.id);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Employee removed successfully.' });
        setDeleteEmployeeCase(null);
        await fetchAdminData(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Failed to delete employee.' });
    } finally {
      setSavingActionKey(null);
    }
  };

  const handleExportEmployeesExcel = () => {
    const columns = [
      { header: 'Full Name', accessor: (e: Employee) => `${e.firstName || ''} ${e.lastName || ''}`.trim() },
      { header: 'Email', accessor: (e: Employee) => e.email || '' },
      { header: 'Phone', accessor: (e: Employee) => e.phone || '' },
      { header: 'Staff Role', accessor: (e: Employee) => e.role || e.roles?.[0] || 'SUPPORT' },
      { header: 'Status', accessor: (e: Employee) => e.status || 'ACTIVE' },
      { header: 'Created Date', accessor: (e: Employee) => e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '' },
    ];
    exportToExcel('vaziro-employees-directory', 'Employees', columns, filteredEmployees);
    setFeedback({ type: 'success', message: `Exported ${filteredEmployees.length} employees to Excel (.xlsx) successfully.` });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#108a00] animate-spin" />
          <p className="text-sm font-bold text-neutral-600">Loading Vaziro Admin Command Center...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fcfbf8] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-neutral-900">Restricted Staff & Admin Console</h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            You must be signed in with an authorized <span className="font-bold text-neutral-800">STAFF</span>,{' '}
            <span className="font-bold text-neutral-800">SUPPORT</span>, <span className="font-bold text-neutral-800">FINANCE</span>, or{' '}
            <span className="font-bold text-neutral-800">ADMIN</span> account to inspect governance dashboards.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('CUSTOMER')}
            className="mt-6 w-full py-3 bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Sign in as Staff Member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8] pb-16">
      {/* ===================================================================== */}
      {/* TOP COMMAND BAR: EXECUTIVE HEADER & SYSTEM STATUS                     */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-neutral-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Title & System Pills */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-[1.8px] text-[#108a00]">
                  Vaziro Command Center
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#108a00]">
                  <span className="w-2 h-2 rounded-full bg-[#108a00] animate-pulse" />
                  <span>Platform Live</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                  <span>Escrow Active</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Governance, Marketplace & Escrow Vault
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Oversee verified professionals, dispute arbitration, payment milestones, and city expansion.
              </p>
            </div>

            {/* Right: Actions (Refresh, Export, Admin Avatar) */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <button
                type="button"
                onClick={() => fetchAdminData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-800 transition cursor-pointer disabled:opacity-50"
                title="Refresh live metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#108a00]' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Sync Data'}</span>
              </button>

              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-xs font-bold text-white transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleExportUsers}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-neutral-400" /> Users Database
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPayments}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-neutral-400" /> Escrow Vault
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMarketplace}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-neutral-400" /> Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Alerts & Notifications */}
        {(loadError || feedback) && (
          <div
            className={`mb-5 p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              loadError || feedback?.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-[#108a00]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {loadError || feedback?.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#108a00]" />
              )}
              <span>{loadError || feedback?.message}</span>
            </div>
            {feedback && (
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* NAVIGATION TABS WITH LIVE COUNTER BADGES                            */}
        {/* =================================================================== */}
        <nav
          aria-label="Admin Navigation"
          className="mb-7 flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl bg-white p-1.5 border border-neutral-200/90 shadow-2xs"
        >
          {/* 1. Overview / Metrics (All staff) */}
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </button>

          {/* 2. Employees & Team Management (Admin / Super Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Employees & Roles</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {employees.length}
              </span>
            </button>
          )}

          {/* 3. Users & Directory (Admin, Support, Verification) */}
          {(isAdmin || isSupport || isVerificationAdmin) && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users & Directory</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {users.length}
              </span>
            </button>
          )}

          {/* 4. Marketplace (Admin, Support) */}
          {(isAdmin || isSupport) && (
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Marketplace</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {requirements.length}
              </span>
            </button>
          )}

          {/* 5. Verification Queue (Admin, Verification Officers) */}
          {(isAdmin || isVerificationAdmin) && (
            <button
              type="button"
              onClick={() => setActiveTab('verifications')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Verifications</span>
              {pendingVerificationCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-950">
                  {pendingVerificationCount}
                </span>
              )}
            </button>
          )}

          {/* 6. Disputes & Support (Admin, Support Specialists) */}
          {(isAdmin || isSupport) && (
            <button
              type="button"
              onClick={() => setActiveTab('disputes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'disputes'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Disputes & Reports</span>
              {pendingReportsCount > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          )}

          {/* 7. Payments & Escrow (Admin, Finance Managers) */}
          {(isAdmin || isFinance) && (
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Finance & Escrow</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {payments.length}
              </span>
            </button>
          )}

          {/* 8. Credit Packs & Plans (Admin, Finance) */}
          {(isAdmin || isFinance) && (
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Plans & Boost</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {plans.length}
              </span>
            </button>
          )}

          {/* 9. Categories Taxonomy (Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categories</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {categories.length}
              </span>
            </button>
          )}

          {/* 10. Locations (Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Locations</span>
            </button>
          )}

          {/* 11. Settings (Admin / Super Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          )}
        </nav>

        {/* =================================================================== */}
        {/* TAB 1: OVERVIEW & REAL-TIME KPIS                                    */}
        {/* =================================================================== */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider">Gross Volume (₹)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#108a00] flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  ₹{(metrics?.financials?.totalGmvInr || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Escrow orders & completed contracts</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider">Total Users</span>
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {metrics?.users?.total || users.length}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                  <span>{metrics?.users?.customers || 0} Customers</span>
                  <span>•</span>
                  <span>{metrics?.users?.professionals || 0} Pros</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider">Verified Pros</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#108a00] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {metrics?.users?.verifiedProfessionals || 0}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {pendingVerificationCount > 0 ? `${pendingVerificationCount} pending review` : 'All submissions clear'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider">Active Jobs</span>
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {metrics?.marketplace?.activeJobs || jobs.filter((j) => j.status === 'HIRED').length}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {metrics?.marketplace?.completedJobs || 0} successfully closed
                </p>
              </div>
            </div>

            {/* Quick Command Shortcuts */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs">
              <h3 className="font-extrabold text-sm text-neutral-900 mb-4">Operational Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('verifications')}
                  className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200 hover:border-emerald-300 text-left transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-[#108a00] mb-2" />
                  <div className="font-bold text-xs text-neutral-900">Process Verifications</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{pendingVerificationCount} awaiting review</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition cursor-pointer"
                >
                  <Coins className="w-5 h-5 text-amber-600 mb-2" />
                  <div className="font-bold text-xs text-neutral-900">Manage Proposal Credits</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Top-up, deduct & inspect ledger</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 text-neutral-700 mb-2" />
                  <div className="font-bold text-xs text-neutral-900">Inspect Escrow Vault</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{payments.length} transactions recorded</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition cursor-pointer"
                >
                  <Tag className="w-5 h-5 text-neutral-700 mb-2" />
                  <div className="font-bold text-xs text-neutral-900">Service Taxonomy</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{categories.length} active categories</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 1.5: EMPLOYEES & STAFF DIRECTORY (ROLES: SUPPORT, FINANCE, ETC.)*/}
        {/* =================================================================== */}
        {activeTab === 'employees' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Control Bar: Search, Filters & Action Buttons */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by employee name, email, or mobile..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={employeeRoleFilter}
                  onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles ({employees.length})</option>
                  <option value="SUPPORT">Support & Dispute Specialist</option>
                  <option value="FINANCE">Finance & Billing Manager</option>
                  <option value="VERIFICATION_ADMIN">KYC Verification Officer</option>
                  <option value="ADMIN">Operations Administrator</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>

                <select
                  value={employeeStatusFilter}
                  onChange={(e) => setEmployeeStatusFilter(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportEmployeesExcel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition cursor-pointer"
                  title="Export staff directory to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmpFirstName('');
                    setEmpLastName('');
                    setEmpEmail('');
                    setEmpPhone('');
                    setEmpRole('SUPPORT');
                    setEmpPassword('');
                    setAddEmployeeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#108a00] hover:bg-[#14a800] text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Employee</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Staff</span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900 mt-2">{employees.length}</div>
                <div className="text-[10px] font-semibold text-neutral-400 mt-0.5">Active team members</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Support</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900 mt-2">
                  {employees.filter((e) => e.roles?.includes('SUPPORT') || e.role === 'SUPPORT').length}
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-0.5">Dispute & arbitrations</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Finance</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900 mt-2">
                  {employees.filter((e) => e.roles?.includes('FINANCE') || e.role === 'FINANCE').length}
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-0.5">Escrow & billing audit</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">KYC Officers</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900 mt-2">
                  {employees.filter((e) => e.roles?.includes('VERIFICATION_ADMIN') || e.role === 'VERIFICATION_ADMIN').length}
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-0.5">DigiLocker verifications</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Administrators</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900 mt-2">
                  {employees.filter((e) => e.roles?.includes('ADMIN') || e.roles?.includes('SUPER_ADMIN')).length}
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-0.5">Platform governance</div>
              </div>
            </div>

            {/* Role Governance & Permissions Reference Box */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm tracking-tight text-white">Employee Role Access Matrix</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Granular RBAC Active
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4 max-w-4xl">
                Each employee assigned to your website receives dedicated console permissions tailored strictly to their operational duty.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex items-center gap-1.5 font-black text-amber-300 mb-1">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Support & Disputes</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Manages customer grievances, dispute mediation, job contract milestones, and user reports.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex items-center gap-1.5 font-black text-emerald-300 mb-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Finance & Billing</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Inspects escrow transactions, payment gateways, credit pack purchases, and audit ledgers.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex items-center gap-1.5 font-black text-blue-300 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>KYC & Verification</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Audits DigiLocker credentials, Aadhaar identity documents, and manual review overrides.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex items-center gap-1.5 font-black text-purple-300 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Operations Admin</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Oversees marketplace requirements, category catalogs, location coverage, and users.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex items-center gap-1.5 font-black text-rose-300 mb-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>Super Admin</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Unrestricted full access across employee credentials, platform settings, and all modules.
                  </p>
                </div>
              </div>
            </div>

            {/* Employees Directory Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900">Active Staff Accounts</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Showing {filteredEmployees.length} of {employees.length} team members
                  </p>
                </div>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-800">No staff accounts match your filter</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search query or role filter, or click below to onboard a new employee.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEmpFirstName('');
                      setEmpLastName('');
                      setEmpEmail('');
                      setEmpPhone('');
                      setEmpRole('SUPPORT');
                      setEmpPassword('');
                      setAddEmployeeModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Add New Employee
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/80 text-[11px] font-black uppercase tracking-wider text-neutral-500 border-b border-neutral-200/60">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Designated Role</th>
                        <th className="py-3 px-4">Contact & Mobile</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Added On</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredEmployees.map((emp) => {
                        const primaryRole = emp.role || (emp.roles?.[0] as StaffRole) || 'SUPPORT';
                        const isCurrentUser = emp.id === user?.id;

                        // Role Badge styling
                        let roleBadge = {
                          bg: 'bg-amber-50 text-amber-800 border-amber-200',
                          label: '🎧 Support & Disputes',
                        };
                        if (primaryRole === 'FINANCE') {
                          roleBadge = {
                            bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                            label: '💰 Finance & Billing',
                          };
                        } else if (primaryRole === 'VERIFICATION_ADMIN') {
                          roleBadge = {
                            bg: 'bg-blue-50 text-blue-800 border-blue-200',
                            label: '🛡️ KYC Verification',
                          };
                        } else if (primaryRole === 'ADMIN') {
                          roleBadge = {
                            bg: 'bg-purple-50 text-purple-800 border-purple-200',
                            label: '⚡ Operations Admin',
                          };
                        } else if (primaryRole === 'SUPER_ADMIN') {
                          roleBadge = {
                            bg: 'bg-rose-50 text-rose-800 border-rose-200',
                            label: '👑 Super Admin',
                          };
                        }

                        return (
                          <tr key={emp.id} className="hover:bg-neutral-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {(emp.firstName?.[0] || 'E').toUpperCase()}
                                  {(emp.lastName?.[0] || '').toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                                    <span>{emp.firstName} {emp.lastName}</span>
                                    {isCurrentUser && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-neutral-200 text-neutral-800">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                    {emp.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}
                              >
                                {roleBadge.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-neutral-800">
                                {emp.phone || <span className="text-neutral-400 italic">No phone added</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {emp.emailVerifiedAt ? (
                                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email Verified
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400">Email Unverified</span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {emp.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#108a00] border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#108a00]" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                  Suspended
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-neutral-500 font-semibold text-[11px]">
                              {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }) : '—'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditEmployee(emp)}
                                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                                  title="Edit details or change role"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={isCurrentUser || savingActionKey === `emp-status-${emp.id}`}
                                  onClick={() => handleToggleEmployeeStatus(emp)}
                                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition cursor-pointer disabled:opacity-40"
                                  title={emp.status === 'ACTIVE' ? 'Suspend employee' : 'Activate employee'}
                                >
                                  {emp.status === 'ACTIVE' ? (
                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-red-500" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetPasswordEmp(emp);
                                    setNewEmpPassword('');
                                  }}
                                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-amber-600 transition cursor-pointer"
                                  title="Reset password"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={isCurrentUser}
                                  onClick={() => setDeleteEmployeeCase(emp)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition cursor-pointer disabled:opacity-40"
                                  title="Remove employee"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: USERS & CREDITS DIRECTORY                                    */}
        {/* =================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email, phone, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="PROFESSIONAL">Professionals</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleExportUsersExcel(selectedUserIds.length > 0)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Export to Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel{selectedUserIds.length > 0 ? ` (${selectedUserIds.length})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportUsersCSV(selectedUserIds.length > 0)}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Export filtered users to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id))}
                          onChange={toggleAllUsersSelection}
                          className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                          title="Select all visible users"
                        />
                      </th>
                      <th className="p-4">User</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Role & KYC</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.map((u) => {
                      const roles = u.roles?.map((r: any) => r.role?.name || r.name) || ['CUSTOMER'];
                      const isPro = roles.includes('PROFESSIONAL');
                      const wallet = u.professionalProfile?.creditWallet;
                      const balance = wallet?.balance ?? 0;
                      const isVerified = Boolean(u.professionalProfile?.isVerified);
                      const isSelected = selectedUserIds.includes(u.id);

                      return (
                        <tr key={u.id} className={`hover:bg-neutral-50/60 transition ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                          <td className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(u.id)}
                              className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                                {(u.firstName?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                                  <span>{u.firstName} {u.lastName}</span>
                                  {isVerified && (
                                    <span title="DigiLocker Verified">
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#108a00]" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-mono">#{u.id.substring(0, 8)}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-neutral-600">
                            <div>{u.email || '—'}</div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">{u.phone || '—'}</div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {roles.map((r: string) => (
                                <span
                                  key={r}
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                    r === 'PROFESSIONAL'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : r === 'ADMIN'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-neutral-100 text-neutral-800'
                                  }`}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-4">
                            {isPro ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCreditModalUser(u);
                                  setCreditMode('ADD');
                                  setCreditAmount(20);
                                  setCreditNotes('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition cursor-pointer"
                                title="Click to adjust credits"
                              >
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span>{balance} Cr</span>
                              </button>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-[#108a00]'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Adjust Credits Button */}
                              {isPro && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCreditModalUser(u);
                                    setCreditMode('ADD');
                                    setCreditAmount(20);
                                    setCreditNotes('');
                                  }}
                                  className="p-1.5 text-neutral-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                  title="Adjust Credits"
                                >
                                  <Coins className="w-4 h-4" />
                                </button>
                              )}

                              {/* Edit Profile */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditModalUser(u);
                                  setEditFirstName(u.firstName || '');
                                  setEditLastName(u.lastName || '');
                                  setEditEmail(u.email || '');
                                  setEditPhone(u.phone || '');
                                  setEditStatus(u.status || 'ACTIVE');
                                  setEditRoles(roles);
                                  setEditIsVerified(Boolean(u.professionalProfile?.isVerified));
                                }}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPassword('');
                                }}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Toggle Status */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                                className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                                title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                              >
                                {u.status === 'ACTIVE' ? (
                                  <ToggleRight className="w-4 h-4 text-[#108a00]" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-neutral-400" />
                                )}
                              </button>

                              {/* Delete User */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: MARKETPLACE REQUIREMENTS & JOBS                              */}
        {/* =================================================================== */}
        {activeTab === 'marketplace' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Sub-tab Switcher */}
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl bg-white border border-neutral-200 p-1">
                <button
                  type="button"
                  onClick={() => setMarketplaceSubTab('requirements')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    marketplaceSubTab === 'requirements'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Service Requirements ({requirements.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMarketplaceSubTab('jobs')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    marketplaceSubTab === 'jobs'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Job Contracts ({jobs.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    marketplaceSubTab === 'requirements'
                      ? handleExportRequirementsExcel(selectedRequirementIds.length > 0)
                      : handleExportJobsExcel(selectedJobIds.length > 0)
                  }
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Export to Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>
                    Excel
                    {marketplaceSubTab === 'requirements' && selectedRequirementIds.length > 0
                      ? ` (${selectedRequirementIds.length})`
                      : marketplaceSubTab === 'jobs' && selectedJobIds.length > 0
                      ? ` (${selectedJobIds.length})`
                      : ''}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMarketplace}
                  className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 flex items-center gap-1.5 hover:bg-neutral-50 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Requirements Sub-Tab */}
            {marketplaceSubTab === 'requirements' && (
              <div className="space-y-4">
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Search requirements by title, client, or city..."
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white"
                  />
                  <select
                    value={reqStatusFilter}
                    onChange={(e) => setReqStatusFilter(e.target.value)}
                    className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={filteredRequirements.length > 0 && filteredRequirements.every((r) => selectedRequirementIds.includes(r.id))}
                              onChange={toggleAllRequirementsSelection}
                              className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                              title="Select all visible requirements"
                            />
                          </th>
                          <th className="p-4">Title & Description</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Budget</th>
                          <th className="p-4">City</th>
                          <th className="p-4">Status & Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredRequirements.map((r) => {
                          const isSelected = selectedRequirementIds.includes(r.id);
                          return (
                            <tr key={r.id} className={`hover:bg-neutral-50/60 transition ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                              <td className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRequirementSelection(r.id)}
                                  className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                                />
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="font-bold text-neutral-900 truncate">{r.title}</div>
                                <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{r.description}</div>
                              </td>
                              <td className="p-4">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#108a00]">
                                  {r.category?.name || 'General'}
                                </span>
                              </td>
                              <td className="p-4 text-neutral-700">
                                {r.client?.firstName} {r.client?.lastName}
                              </td>
                              <td className="p-4 font-bold text-neutral-900">
                                ₹{r.budgetMin || 0} - ₹{r.budgetMax || 'Negotiable'}
                              </td>
                              <td className="p-4 text-neutral-600">{r.city || 'Delhi NCR'}</td>
                              <td className="p-4">
                                <select
                                  value={r.status}
                                  onChange={(e) => handleUpdateRequirementStatus(r.id, e.target.value)}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none cursor-pointer"
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="CLOSED">CLOSED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Sub-Tab */}
            {marketplaceSubTab === 'jobs' && (
              <div className="space-y-4">
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <div className="text-xs font-bold text-neutral-700">Contract Status:</div>
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="HIRED">HIRED / ESCROW_HELD</option>
                    <option value="SERVICE_STARTED">SERVICE_STARTED</option>
                    <option value="SERVICE_COMPLETED">SERVICE_COMPLETED</option>
                    <option value="PAYMENT_RELEASED">PAYMENT_RELEASED</option>
                    <option value="DISPUTED">DISPUTED</option>
                  </select>
                </div>

                <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={filteredJobs.length > 0 && filteredJobs.every((j) => selectedJobIds.includes(j.id))}
                              onChange={toggleAllJobsSelection}
                              className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                              title="Select all visible job contracts"
                            />
                          </th>
                          <th className="p-4">Job Contract ID</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Professional</th>
                          <th className="p-4">Agreed Amount</th>
                          <th className="p-4">Escrow Status</th>
                          <th className="p-4 text-right">Admin Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredJobs.map((j) => {
                          const isSelected = selectedJobIds.includes(j.id);
                          return (
                            <tr key={j.id} className={`hover:bg-neutral-50/60 transition ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                              <td className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleJobSelection(j.id)}
                                  className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer"
                                />
                              </td>
                              <td className="p-4 font-mono text-[11px] text-neutral-600">
                                #{j.id.substring(0, 10)}
                              </td>
                              <td className="p-4 font-semibold text-neutral-900">
                                {j.client?.firstName} {j.client?.lastName}
                              </td>
                              <td className="p-4 font-semibold text-neutral-900">
                                {j.professional?.user?.firstName} {j.professional?.user?.lastName}
                              </td>
                              <td className="p-4 font-black text-neutral-900">
                                ₹{j.agreedAmount || j.quotation?.priceInr || 0}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    j.status === 'PAYMENT_RELEASED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : j.status === 'DISPUTED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {j.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <select
                                  value={j.status}
                                  onChange={(e) => handleUpdateJobStatus(j.id, e.target.value)}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none cursor-pointer"
                                >
                                  <option value="HIRED">HIRED (Escrow)</option>
                                  <option value="SERVICE_STARTED">STARTED</option>
                                  <option value="SERVICE_COMPLETED">COMPLETED</option>
                                  <option value="PAYMENT_RELEASED">PAYMENT_RELEASED</option>
                                  <option value="DISPUTED">DISPUTED</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: VERIFICATION WORKBENCH QUEUE                                 */}
        {/* =================================================================== */}
        {activeTab === 'verifications' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Search verification submissions by pro name, phone, or Aadhaar ref..."
                value={verificationSearch}
                onChange={(e) => setVerificationSearch(e.target.value)}
                className="flex-1 w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white"
              />

              <div className="flex items-center gap-2">
                <select
                  value={verificationFilterStatus}
                  onChange={(e) => setVerificationFilterStatus(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Cases ({verifications.length})</option>
                  <option value="PENDING">Pending Review ({pendingVerificationCount})</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="IN_REVIEW">In Review</option>
                </select>

                <button
                  type="button"
                  onClick={toggleAllVerificationsSelection}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Toggle select all visible verification submissions"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    {filteredVerifications.length > 0 &&
                    filteredVerifications.every((v) => selectedVerificationIds.includes(v.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportVerificationsExcel(selectedVerificationIds.length > 0)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Export to Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel{selectedVerificationIds.length > 0 ? ` (${selectedVerificationIds.length})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportVerifications}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Cases List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVerifications.map((v) => {
                const pro = v.professional?.user;
                const isPending = v.status === 'PENDING';
                const isSelected = selectedVerificationIds.includes(v.id);

                return (
                  <div
                    key={v.id}
                    className={`bg-white rounded-2xl border ${
                      isSelected ? 'border-[#108a00] ring-2 ring-emerald-500/20 bg-emerald-50/15' : 'border-neutral-200/90'
                    } p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleVerificationSelection(v.id)}
                            className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer shrink-0"
                          />
                          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {(pro?.firstName?.[0] || 'P').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-neutral-900">
                              {pro?.firstName} {pro?.lastName}
                            </div>
                            <div className="text-xs text-neutral-500">{pro?.phone || pro?.email}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-neutral-600">
                          <span>Provider:</span>
                          <span className="font-bold text-neutral-900">{v.provider || 'DigiLocker / Aadhaar'}</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-600">
                          <span>Ref ID:</span>
                          <span className="font-mono text-[11px]">{v.referenceId ? v.referenceId.slice(0, 16) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-600">
                          <span>Submitted:</span>
                          <span>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setViewDetailsModalCase(v)}
                        className="text-xs font-bold text-neutral-600 hover:text-black hover:underline cursor-pointer"
                      >
                        View Full Details
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleQuickApproveVerification(v.id, `${pro?.firstName} ${pro?.lastName}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setOverrideModalCase(v);
                            setOverrideAction('APPROVE');
                            setOverrideReason('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs transition cursor-pointer"
                        >
                          Override
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: CATEGORIES & SERVICE TAXONOMY (NEW!)                        */}
        {/* =================================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900">Service Categories Taxonomy</h3>
                <p className="text-xs text-neutral-500">Configure marketplace domains and pricing hint thresholds.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCategoriesExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Export categories taxonomy to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatSlug('');
                    setCatDesc('');
                    setCatIcon('Sparkles');
                    setCategoryModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <div
                  key={cat.id || cat.slug}
                  className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                        {cat.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatName(cat.name);
                          setCatSlug(cat.slug);
                          setCatDesc(cat.description || '');
                          setCategoryModalOpen(true);
                        }}
                        className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-base text-neutral-900">{cat.name}</h4>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {cat.description || 'Verified independent professionals category.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                    <span>{cat.subcategories?.length || 0} subcategories</span>
                    <span className="text-[#108a00] font-bold">Active in NCR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: CREDIT PACKS & BOOST PACKAGES (NEW!)                         */}
        {/* =================================================================== */}
        {activeTab === 'plans' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900">Proposal Credit Packs Governance</h3>
                <p className="text-xs text-neutral-500">Manage package prices, credit quantities, and volume discounts.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPlansExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Export credit plans to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerExpiredBatches}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Purge expired credit batches"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Process Expired Batches</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanName('');
                    setPlanCredits(20);
                    setPlanPrice(799);
                    setPlanDiscount('');
                    setPlanModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Credit Pack</span>
                </button>
              </div>
            </div>

            {/* Credit Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-extrabold text-sm text-neutral-900">{p.name}</span>
                      {p.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-black text-neutral-900">₹{p.priceInr}</span>
                      <span className="text-xs text-neutral-500">/ pack</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>Credits Granted:</span>
                      </span>
                      <span className="font-black text-sm text-amber-950">{p.credits} Credits</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanName(p.name);
                        setPlanCredits(p.credits);
                        setPlanPrice(p.priceInr);
                        setPlanDiscount(p.badge || '');
                        setPlanModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#108a00] hover:underline cursor-pointer"
                    >
                      Edit Package &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 7: DISPUTES & COMMUNICATION MODERATION (NEW!)                   */}
        {/* =================================================================== */}
        {activeTab === 'disputes' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900">Disputes & Incident Desk</h3>
                <p className="text-xs text-neutral-500">Arbitrate flagged communications, escrow issues, and user reports.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Reports</option>
                  <option value="PENDING">Pending Action</option>
                  <option value="RESOLVED">Resolved</option>
                </select>

                <button
                  type="button"
                  onClick={toggleAllReportsSelection}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Toggle select all reports"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    {reports.length > 0 && reports.every((r) => selectedReportIds.includes(r.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportReportsExcel(selectedReportIds.length > 0)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Export reports to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel{selectedReportIds.length > 0 ? ` (${selectedReportIds.length})` : ''}</span>
                </button>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <CheckCircle2 className="w-12 h-12 text-[#108a00] mx-auto mb-3" />
                <h4 className="font-bold text-sm text-neutral-900">No Open Disputes</h4>
                <p className="text-xs text-neutral-500 mt-1">Platform moderation queues and communication logs are clean.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
                <div className="divide-y divide-neutral-100">
                  {reports.map((r) => {
                    const isSelected = selectedReportIds.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        className={`p-5 flex items-start justify-between gap-4 transition ${
                          isSelected ? 'bg-emerald-50/40' : 'hover:bg-neutral-50/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleReportSelection(r.id)}
                            className="w-4 h-4 rounded text-[#108a00] focus:ring-[#108a00] border-neutral-300 cursor-pointer mt-1 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-900">{r.reason || 'Flagged Message'}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {r.status || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{r.description || 'No description provided.'}</p>
                            <div className="text-[11px] text-neutral-400">
                              Reported: {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recent'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setResolveReportModalCase(r);
                            setResolveReportOutcome('RESOLVED');
                            setResolveReportNotes('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition shrink-0 cursor-pointer"
                        >
                          Arbitrate & Resolve
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 8: PAYMENTS & ESCROW VAULT                                      */}
        {/* =================================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search & Export Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Search payments by Order ID, Razorpay Ref, or Job ID..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="flex-1 w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white"
              />

              <div className="flex items-center gap-2">
                <select
                  value={paymentFilterStatus}
                  onChange={(e) => setPaymentFilterStatus(e.target.value)}
                  className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Transactions ({payments.length})</option>
                  <option value="SECURED">Secured in Escrow</option>
                  <option value="COMPLETED">Released to Pro</option>
                  <option value="REFUNDED">Refunded</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportPaymentsExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Export payments ledger to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPayments}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Payments Ledger Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Payment Ref</th>
                      <th className="p-4">Job Contract</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/60 transition">
                        <td className="p-4 font-mono font-bold text-neutral-900">
                          #{p.id.substring(0, 14)}
                        </td>
                        <td className="p-4 text-neutral-600 font-mono text-[11px]">
                          {p.jobId ? `#${p.jobId.substring(0, 10)}` : 'Credit Pack / Boost'}
                        </td>
                        <td className="p-4 font-black text-neutral-900 text-sm">
                          ₹{p.amount?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'SECURED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {p.status || 'CAPTURED'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-600">{p.paymentMethod || 'Razorpay Gateway'}</td>
                        <td className="p-4 text-neutral-400 text-[11px]">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 9: LOCATIONS MATRIX                                             */}
        {/* =================================================================== */}
        {activeTab === 'locations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Service Locations Governance</h3>
              <p className="text-xs text-neutral-500">Toggle operational availability for Delhi NCR cities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {states.map((st) => (
                <div key={st.id} className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <div>
                      <h4 className="font-black text-sm text-neutral-900">{st.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-400">{st.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleLocation('state', st.id, st.isActive)}
                      className="cursor-pointer"
                    >
                      {st.isActive ? (
                        <ToggleRight className="w-6 h-6 text-[#108a00]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-neutral-300" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {st.cities?.map((ct: any) => (
                      <div
                        key={ct.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 text-xs font-semibold text-neutral-800"
                      >
                        <span>{ct.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleLocation('city', ct.id, ct.isActive)}
                          className="cursor-pointer"
                        >
                          {ct.isActive ? (
                            <ToggleRight className="w-5 h-5 text-[#108a00]" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-neutral-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 10: SETTINGS & PLATFORM CONFIGURATION                           */}
        {/* =================================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Platform Settings & Fee Matrix</h3>
              <p className="text-xs text-neutral-500">Live operational constants, commission rates, and lead costs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {settings.map((item) => {
                const isSaving = savingKey === item.key;

                return (
                  <div key={item.key} className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-neutral-900 font-mono">{item.key}</span>
                      <span className="text-[10px] text-neutral-400">Live Config</span>
                    </div>

                    <input
                      type="text"
                      value={editingSettings[item.key] ?? item.value}
                      onChange={(e) => setEditingSettings({ ...editingSettings, [item.key]: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#108a00]"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveSetting(item.key)}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: ADJUST CREDITS MODAL                                         */}
      {/* ===================================================================== */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-neutral-900">Adjust Proposal Credits</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustCredits} className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1">
                <div className="text-neutral-500">Recipient:</div>
                <div className="font-extrabold text-neutral-900">{creditModalUser.firstName} {creditModalUser.lastName}</div>
                <div className="text-neutral-500">
                  Current Balance: <span className="font-bold text-amber-900">{creditModalUser.professionalProfile?.creditWallet?.balance ?? 0} Cr</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreditMode('ADD')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      creditMode === 'ADD' ? 'bg-[#108a00] text-white border-[#108a00]' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditMode('DEDUCT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      creditMode === 'DEDUCT' ? 'bg-red-600 text-white border-red-600' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    - Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditMode('SET')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      creditMode === 'SET' ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    = Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Credit Amount</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Audit Ledger Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome bonus, Dispute compensation, Manual adjustment"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCredit}
                  className="px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingCredit ? 'Processing...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: USER EDIT MODAL                                              */}
      {/* ===================================================================== */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">Edit User #{editModalUser.id.substring(0, 8)}</h3>
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVerified}
                    onChange={(e) => setEditIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#108a00] rounded-sm"
                  />
                  <span>DigiLocker Verified Badge</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalUser(null)}
                    className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submittingEdit ? 'Saving...' : 'Save User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: PASSWORD RESET MODAL                                         */}
      {/* ===================================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">
                Reset Password for {passwordModalUser.firstName}
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">New Password</label>
                <input
                  type="text"
                  placeholder="Enter strong temporary password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingPassword ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: VERIFICATION VIEW DETAILS MODAL                              */}
      {/* ===================================================================== */}
      {viewDetailsModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">DigiLocker Verification Case Details</h3>
              <button
                type="button"
                onClick={() => setViewDetailsModalCase(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-2xl space-y-1">
                <div className="font-extrabold text-sm text-neutral-900">
                  {viewDetailsModalCase.professional?.user?.firstName} {viewDetailsModalCase.professional?.user?.lastName}
                </div>
                <div className="text-neutral-500">
                  Phone: {viewDetailsModalCase.professional?.user?.phone || 'N/A'} | Email:{' '}
                  {viewDetailsModalCase.professional?.user?.email || 'N/A'}
                </div>
                <div className="text-neutral-500">
                  Category: {viewDetailsModalCase.professional?.category?.name || 'General'}
                </div>
              </div>

              <div className="p-3 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Verification Status:</span>
                  <span className="font-bold text-[#108a00]">{viewDetailsModalCase.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Provider:</span>
                  <span className="font-bold text-neutral-900">{viewDetailsModalCase.provider || 'DigiLocker / Aadhaar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reference ID:</span>
                  <span className="font-mono text-neutral-900">{viewDetailsModalCase.referenceId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Consent Timestamp:</span>
                  <span>{new Date(viewDetailsModalCase.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewDetailsModalCase(null)}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: VERIFICATION OVERRIDE MODAL                                  */}
      {/* ===================================================================== */}
      {overrideModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">Admin Verification Decision</h3>
              <button
                type="button"
                onClick={() => setOverrideModalCase(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Decision Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideAction('APPROVE')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      overrideAction === 'APPROVE' ? 'bg-[#108a00] text-white border-[#108a00]' : 'border-neutral-200'
                    }`}
                  >
                    Approve & Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideAction('REJECT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      overrideAction === 'REJECT' ? 'bg-red-600 text-white border-red-600' : 'border-neutral-200'
                    }`}
                  >
                    Reject Submission
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Decision Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Enter audit notes or feedback sent to professional..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalCase(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingOverride ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: CREATE / EDIT CATEGORY MODAL                                 */}
      {/* ===================================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elderly Caregiver, Home Nurse"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  required
                  className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. elderly-caregiver"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-semibold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of services included..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingCat ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: CREATE / EDIT CREDIT PLAN MODAL                              */}
      {/* ===================================================================== */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">
                {editingPlan ? 'Edit Credit Pack' : 'Create Credit Pack'}
              </h3>
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Starter Pack, Pro Pack"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Credits Granted</label>
                  <input
                    type="number"
                    min="1"
                    value={planCredits}
                    onChange={(e) => setPlanCredits(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Price in INR (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Discount Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Save 20%, Best Value"
                  value={planDiscount}
                  onChange={(e) => setPlanDiscount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlan}
                  className="px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingPlan ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: DISPUTE & REPORT RESOLUTION MODAL                            */}
      {/* ===================================================================== */}
      {resolveReportModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">Arbitrate Dispute / Report</h3>
              <button
                type="button"
                onClick={() => setResolveReportModalCase(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveReport} className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-neutral-900">Issue: {resolveReportModalCase.reason}</div>
                <p className="text-neutral-600">{resolveReportModalCase.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Resolution Outcome</label>
                <select
                  value={resolveReportOutcome}
                  onChange={(e) => setResolveReportOutcome(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none"
                >
                  <option value="RESOLVED">RESOLVED (Warning Issued / Settlement Reached)</option>
                  <option value="DISMISSED">DISMISSED (No Violation Found)</option>
                  <option value="USER_SUSPENDED">USER_SUSPENDED (Account Penalized)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Admin Arbitration Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record summary of action taken..."
                  value={resolveReportNotes}
                  onChange={(e) => setResolveReportNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolveReportModalCase(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolveReport}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingResolveReport ? 'Saving...' : 'Resolve Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FLOATING BULK SELECTION ACTION BAR                                    */}
      {/* ===================================================================== */}
      {(selectedUserIds.length > 0 ||
        selectedVerificationIds.length > 0 ||
        selectedRequirementIds.length > 0 ||
        selectedJobIds.length > 0 ||
        selectedReportIds.length > 0) && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-200">
          <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur-md text-white border border-neutral-700 shadow-2xl rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 md:gap-4 max-w-5xl w-full">
            {/* Users Multi-select */}
            {selectedUserIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedUserIds.length} Users Selected
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportUsersExcel(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Export selected users to Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={handleBulkUsersVerify}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkUsersStatus('ACTIVE')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Activate
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkUsersStatus('SUSPENDED')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Suspend
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Bulk Delete Users',
                        message: `Are you sure you want to deactivate and remove ${selectedUserIds.length} selected users? This action is irreversible.`,
                        actionLabel: `Delete ${selectedUserIds.length} Users`,
                        isDanger: true,
                        onConfirm: handleBulkUsersDelete,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Verifications Multi-select */}
            {selectedVerificationIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedVerificationIds.length} Verifications Selected
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportVerificationsExcel(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={handleBulkVerificationsApprove}
                    className="px-3 py-1.5 rounded-xl bg-[#108a00] hover:bg-[#14a800] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={handleBulkVerificationsReset}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Reset to Pending
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Bulk Reject Verifications',
                        message: `Are you sure you want to reject ${selectedVerificationIds.length} verification submissions?`,
                        actionLabel: `Reject ${selectedVerificationIds.length} Submissions`,
                        isDanger: true,
                        onConfirm: () => handleBulkVerificationsReject(),
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVerificationIds([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Requirements Multi-select */}
            {selectedRequirementIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedRequirementIds.length} Requirements Selected
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportRequirementsExcel(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkRequirementsStatus('OPEN')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Mark Open
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkRequirementsStatus('CLOSED')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Mark Closed
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Bulk Delete Requirements',
                        message: `Are you sure you want to permanently delete ${selectedRequirementIds.length} requirements and any linked quotes?`,
                        actionLabel: `Delete ${selectedRequirementIds.length} Requirements`,
                        isDanger: true,
                        onConfirm: handleBulkRequirementsDelete,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRequirementIds([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Jobs Multi-select */}
            {selectedJobIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedJobIds.length} Jobs Selected
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportJobsExcel(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkJobsStatus('PAYMENT_RELEASED')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Release Payment
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkJobsStatus('CLOSED')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Mark Closed
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Bulk Delete Jobs',
                        message: `Are you sure you want to permanently delete ${selectedJobIds.length} job contract records?`,
                        actionLabel: `Delete ${selectedJobIds.length} Jobs`,
                        isDanger: true,
                        onConfirm: handleBulkJobsDelete,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedJobIds([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Reports Multi-select */}
            {selectedReportIds.length > 0 && (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {selectedReportIds.length} Reports Selected
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportReportsExcel(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkReportsAction('RESOLVE')}
                    className="px-3 py-1.5 rounded-xl bg-[#108a00] hover:bg-[#14a800] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() => handleBulkReportsAction('DISMISS')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    disabled={bulkActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: 'Bulk Delete Reports',
                        message: `Are you sure you want to permanently delete ${selectedReportIds.length} reports?`,
                        actionLabel: `Delete ${selectedReportIds.length} Reports`,
                        isDanger: true,
                        onConfirm: () => handleBulkReportsAction('DELETE'),
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReportIds([])}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 9: GENERIC CONFIRMATION MODAL                                   */}
      {/* ===================================================================== */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">{confirmModal.title}</h3>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={async () => {
                  await confirmModal.onConfirm();
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 ${
                  confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#108a00] hover:bg-[#14a800]'
                }`}
              >
                {bulkActionLoading ? 'Processing...' : confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 10: ADD NEW EMPLOYEE MODAL                                      */}
      {/* ===================================================================== */}
      {addEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#108a00]/10 text-[#108a00] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900">Add New Team Employee</h3>
                  <p className="text-[11px] text-neutral-500">Provision dedicated credentials and operational role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddEmployeeModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul"
                    value={empFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verma"
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@vaziro.in"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Designated Role & Access Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { role: 'SUPPORT', title: 'Support & Disputes', desc: 'Disputes, reports, complaints', icon: Headphones, badge: 'text-amber-700 bg-amber-50' },
                    { role: 'FINANCE', title: 'Finance & Escrow', desc: 'Payments, billing, credits', icon: Wallet, badge: 'text-emerald-700 bg-emerald-50' },
                    { role: 'VERIFICATION_ADMIN', title: 'KYC & DigiLocker', desc: 'Aadhaar / ID approvals', icon: Shield, badge: 'text-blue-700 bg-blue-50' },
                    { role: 'ADMIN', title: 'Operations Admin', desc: 'Catalog, jobs, users, staff', icon: ShieldAlert, badge: 'text-purple-700 bg-purple-50' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = empRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setEmpRole(item.role as StaffRole)}
                        className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-[#108a00] bg-emerald-50/50 shadow-2xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-neutral-900">{item.title}</div>
                          <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Temporary Initial Password</label>
                <div className="relative">
                  <input
                    type={showEmpPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmpPassword(!showEmpPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  The employee can reset their password upon initial login.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAddEmployeeModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmp}
                  className="px-5 py-2 bg-[#108a00] hover:bg-[#14a800] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{submittingEmp ? 'Provisioning...' : 'Create Employee Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 11: EDIT EMPLOYEE MODAL                                         */}
      {/* ===================================================================== */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900">Edit Employee Profile</h3>
                  <p className="text-[11px] text-neutral-500">Update staff contact details, role, or status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={empFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Designated Role</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 text-xs font-bold text-neutral-800 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00] cursor-pointer"
                >
                  <option value="SUPPORT">🎧 SUPPORT — Dispute mediation & ticket arbitration</option>
                  <option value="FINANCE">💰 FINANCE — Escrow vault, billing, credit purchases</option>
                  <option value="VERIFICATION_ADMIN">🛡️ VERIFICATION_ADMIN — DigiLocker & KYC reviews</option>
                  <option value="ADMIN">⚡ ADMIN — Full platform operations & management</option>
                  <option value="SUPER_ADMIN">👑 SUPER_ADMIN — Master credentials & executive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Account Operational Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmpStatus('ACTIVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      empStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-[#108a00] border-emerald-300'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#108a00]" />
                    Active (Authorized)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpStatus('SUSPENDED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      empStatus === 'SUSPENDED'
                        ? 'bg-red-50 text-red-600 border-red-300'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Suspended (Blocked)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmp}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingEmp ? 'Saving...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 12: RESET EMPLOYEE PASSWORD MODAL                               */}
      {/* ===================================================================== */}
      {resetPasswordEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900">Reset Staff Password</h3>
                  <p className="text-[11px] text-neutral-500">
                    For {resetPasswordEmp.firstName} {resetPasswordEmp.lastName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordEmp(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetEmpPasswordSubmit} className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-neutral-900">
                  {resetPasswordEmp.firstName} {resetPasswordEmp.lastName}
                </div>
                <div className="text-neutral-500 font-mono text-[11px]">{resetPasswordEmp.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">New Secure Password</label>
                <div className="relative">
                  <input
                    type={showNewEmpPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Enter new password (min. 8 characters)"
                    value={newEmpPassword}
                    onChange={(e) => setNewEmpPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-xs font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewEmpPassword(!showNewEmpPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showNewEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordEmp(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResetEmpPass}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingResetEmpPass ? 'Resetting...' : 'Confirm Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 13: DELETE EMPLOYEE CONFIRMATION MODAL                          */}
      {/* ===================================================================== */}
      {deleteEmployeeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900">Remove Staff Privileges</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteEmployeeCase(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Are you sure you want to deactivate and remove staff access for{' '}
              <strong className="text-neutral-900 font-extrabold">
                {deleteEmployeeCase.firstName} {deleteEmployeeCase.lastName}
              </strong>{' '}
              ({deleteEmployeeCase.email})? This employee will immediately lose access to the administration dashboard.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteEmployeeCase(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployeeSubmit}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Deactivate & Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
