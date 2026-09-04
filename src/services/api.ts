import axios from 'axios';
import {
  ApiResponse,
  Category,
  IndianState,
  City,
  User,
  Requirement,
  Quotation,
  Job,
  CreditWallet,
  CreditPlan,
  ProfessionalPlan,
  CreditBatch,
  CreditLedgerItem,
  DetailedCreditWallet,
  BoostPackage,
  ChatThread,
  Message,
  Dispute,
  ProfessionalTransaction,
  NotificationItem,
  NotificationListResponse,
} from '../types';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000/api/v1' : 'https://api.vaziro.in/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vaziro_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      error.message = 'The server is taking longer than expected to respond. It may be starting up or updating. Please try again in a few seconds.';
    }
    if (error.response?.status === 401) {
      const code = error.response?.data?.error?.code;
      const message = error.response?.data?.error?.message || '';
      if (
        code === 'TOKEN_EXPIRED_OR_INVALID' ||
        code === 'AUTH_REQUIRED' ||
        message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('invalid')
      ) {
        localStorage.removeItem('vaziro_token');
        localStorage.removeItem('vaziro_user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vaziro:auth_expired', { detail: { code, message } }));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { identifier, password }),

  register: (payload: { name: string; phone: string; email?: string; password: string; role: 'CUSTOMER' | 'PROFESSIONAL' }) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/register', payload),

  loginWithPassword: (identifier: string, password: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { identifier, password }),

  checkMobile: (mobile: string) =>
    apiClient.post<ApiResponse<{ exists: boolean; mobile: string; message: string }>>('/auth/check-mobile', { mobile }),

  sendOtp: (mobile: string, purpose: string = 'login', widgetDispatched?: boolean) =>
    apiClient.post<ApiResponse<{ mobile: string; cooldownSeconds: number }>>('/auth/send-otp', { mobile, purpose, widgetDispatched }),

  resendOtp: (mobile: string, purpose: string = 'resend', widgetDispatched?: boolean) =>
    apiClient.post<ApiResponse<{ mobile: string; cooldownSeconds: number }>>('/auth/resend-otp', { mobile, purpose, widgetDispatched }),

  requestOtp: (phone: string) =>
    apiClient.post<ApiResponse<{ phone: string; cooldownSeconds: number }>>('/auth/otp/request', { phone }),

  verifyOtp: (payload: {
    phone?: string;
    mobile?: string;
    otp?: string;
    role?: 'CUSTOMER' | 'PROFESSIONAL';
    firstName?: string;
    lastName?: string;
    purpose?: string;
    msg91Verified?: boolean;
    msg91Token?: string;
  }) =>
    apiClient.post<ApiResponse<{ accessToken?: string; refreshToken?: string; isNewUser: boolean; signupToken?: string; user?: User }>>('/auth/verify-otp', payload),

  completeSignup: (payload: {
    mobile?: string;
    signupToken?: string;
    role: 'CUSTOMER' | 'PROFESSIONAL';
    name: string;
    email: string;
    city?: string;
    businessName?: string;
    category?: string;
    experience?: number | string;
  }) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken?: string; isNewUser: boolean; user: User }>>('/auth/complete-signup', payload),

  getMe: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: any) =>
    apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    apiClient.put<ApiResponse<{ success: boolean; message: string }>>('/auth/password', data),

  forgotPassword: (identifier: string) =>
    apiClient.post<ApiResponse<{ success: boolean; message: string }>>('/auth/forgot-password', { identifier }),

  verifyResetCode: (identifier: string, code: string) =>
    apiClient.post<ApiResponse<{ resetToken: string }>>('/auth/verify-reset-code', { identifier, code }),

  resetPassword: (payload: { identifier: string; code?: string; resetToken?: string; newPassword: string }) =>
    apiClient.post<ApiResponse<{ success: boolean; message: string }>>('/auth/reset-password', payload),

  logout: () => apiClient.post<ApiResponse<{ success: boolean; message: string }>>('/auth/logout'),

  // Notifications & Alerts
  getNotifications: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) =>
    apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', { params }),

  markNotificationRead: (id: string) =>
    apiClient.patch<ApiResponse<{ id: string; isRead: boolean; unreadCount: number }>>(`/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    apiClient.patch<ApiResponse<{ count: number; unreadCount: number }>>('/notifications/read-all'),

  // Categories & Locations
  getCategories: () => apiClient.get<ApiResponse<Category[]>>('/categories'),
  getStates: () => apiClient.get<ApiResponse<IndianState[]>>('/locations/states'),
  getCities: (params?: any) => apiClient.get<ApiResponse<City[]>>('/locations/cities', { params }),
  getCitiesByState: (stateId: string) => apiClient.get<ApiResponse<City[]>>(`/locations/cities/${stateId}`),

  // Requirements
  createRequirement: (data: any) => apiClient.post<ApiResponse<Requirement>>('/requirements', data),
  getRequirements: (params?: any) => apiClient.get<ApiResponse<Requirement[]>>('/requirements', { params }),
  getMyRequirements: () => apiClient.get<ApiResponse<Requirement[]>>('/requirements/my'),
  getRequirementById: (id: string) => apiClient.get<ApiResponse<Requirement>>(`/requirements/${id}`),
  updateRequirementStatus: (id: string, status: string) => apiClient.patch<ApiResponse<any>>(`/requirements/${id}/status`, { status }),
  deleteRequirement: (id: string) => apiClient.delete<ApiResponse<any>>(`/requirements/${id}`),

  // Quotations & Applications
  submitQuotation: (data: any) => apiClient.post<ApiResponse<any>>('/quotations/apply', data),
  getQuotationsForRequirement: (requirementId: string) => apiClient.get<ApiResponse<Quotation[]>>(`/quotations/requirement/${requirementId}`),
  shortlistQuotation: (id: string) => apiClient.patch<ApiResponse<any>>(`/quotations/${id}/shortlist`),
  rejectQuotation: (id: string) => apiClient.patch<ApiResponse<any>>(`/quotations/${id}/reject`),
  getMyQuotations: () => apiClient.get<ApiResponse<Quotation[]>>('/quotations/my'),

  // Hiring & Jobs
  hireProfessional: (quotationId: string, usePaymentProtection: boolean) =>
    apiClient.post<ApiResponse<Job>>('/jobs/hire', { quotationId, usePaymentProtection }),
  getMyJobs: () => apiClient.get<ApiResponse<Job[]>>('/jobs'),
  getJobDetails: (id: string) => apiClient.get<ApiResponse<Job>>(`/jobs/${id}`),
  updateJobStatus: (id: string, newStatus: string, reason?: string) =>
    apiClient.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { newStatus, reason }),
  updateJobWorkStatus: (jobId: string, workStatus: string, notes?: string) =>
    apiClient.patch<ApiResponse<Job>>(`/jobs/${jobId}/work-status`, { workStatus, notes }),
  confirmJobCompletion: (jobId: string) =>
    apiClient.post<ApiResponse<Job>>(`/jobs/${jobId}/confirm-completion`),
  raiseJobDispute: (jobId: string, reason: string, description: string) =>
    apiClient.post<ApiResponse<Job>>(`/jobs/${jobId}/dispute`, { reason, description }),

  // Credits & Wallet
  getCreditWallet: () => apiClient.get<ApiResponse<DetailedCreditWallet>>('/credits/wallet'),
  getCreditBatches: () => apiClient.get<ApiResponse<CreditBatch[]>>('/credits/batches'),
  getCreditLedger: () => apiClient.get<ApiResponse<CreditLedgerItem[]>>('/credits/ledger'),
  getProfessionalTransactions: (params?: { type?: string; limit?: number; offset?: number }) =>
    apiClient.get<ApiResponse<{ transactions: ProfessionalTransaction[]; total: number }>>('/credits/transactions', { params }),
  getCreditPlans: () => apiClient.get<ApiResponse<ProfessionalPlan[]>>('/credits/plans'),
  calculateCreditFee: (budgetMin: number, budgetMax?: number) =>
    apiClient.post<ApiResponse<{ creditsRequired: number; nominalCostInr: number }>>('/credits/calculate-fee', { budgetMin, budgetMax }),
  purchaseCreditPlan: (planId: string) => apiClient.post<ApiResponse<any>>('/credits/purchase', { planId }),
  createCreditOrder: (planId: string) => apiClient.post<ApiResponse<any>>('/credits/create-order', { planId }),
  verifyCreditPayment: (data: { orderId: string; paymentId: string; signature: string; planId: string }) =>
    apiClient.post<ApiResponse<any>>('/credits/verify-payment', data),

  // Customer Boost
  getBoostPackages: () => apiClient.get<ApiResponse<BoostPackage[]>>('/boost/packages'),
  createBoostOrder: (requirementId: string, packageId: string) =>
    apiClient.post<ApiResponse<any>>('/boost/create-order', { requirementId, packageId }),
  verifyBoostPayment: (data: { orderId: string; paymentId: string; signature: string; requirementId: string; packageId: string }) =>
    apiClient.post<ApiResponse<any>>('/boost/verify-payment', data),
  getRequirementBoost: (requirementId: string) =>
    apiClient.get<ApiResponse<any>>(`/boost/requirement/${requirementId}`),

  // Chat & Calling
  getChatThreads: () => apiClient.get<ApiResponse<ChatThread[]>>('/chat/threads'),
  getChatMessages: (threadId: string) => apiClient.get<ApiResponse<Message[]>>(`/chat/threads/${threadId}/messages`),
  sendMessage: (threadId: string, content: string) => apiClient.post<ApiResponse<Message>>(`/chat/threads/${threadId}/messages`, { content }),
  initiateMaskedCall: (jobId: string) => apiClient.post<ApiResponse<any>>('/calls/initiate', { jobId }),

  // Payments & Payouts
  getPaymentConfig: () => apiClient.get<ApiResponse<{ keyId: string; currency: string }>>('/payments/config'),
  createPaymentOrder: (jobId: string, amount: number, paymentMethod?: string) =>
    apiClient.post<ApiResponse<any>>('/payments/create-order', { jobId, amount, paymentMethod }),
  verifyJobPayment: (data: { orderId: string; paymentId: string; signature: string; jobId: string; internalPaymentId?: string }) =>
    apiClient.post<ApiResponse<any>>('/payments/verify-payment', data),
  mockPaymentWebhook: (paymentId: string, amount: number) =>
    apiClient.post<ApiResponse<any>>('/payments/webhook', {
      payload: { paymentId, amount, providerRefId: `mock_ref_${Date.now()}` },
    }),
  releasePayment: (jobId: string) => apiClient.post<ApiResponse<any>>(`/payments/${jobId}/release`),
  getInvoice: (jobId: string) => apiClient.get<ApiResponse<any>>(`/payments/invoice/${jobId}`),
  getPaymentTransactions: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ payments: any[]; pagination: any }>>('/payments/transactions', { params }),

  // Professional Profiles & Verification
  getMyProfessionalProfile: () => apiClient.get<ApiResponse<any>>('/professionals/me'),
  updateProfessionalProfile: (data: any) => apiClient.put<ApiResponse<any>>('/professionals/me', data),
  verifyDigiLocker: (aadhaarReference?: string) =>
    apiClient.post<ApiResponse<any>>('/professionals/verify/digilocker', { aadhaarReference, consentGiven: true }),
  getPublicProfessionalProfile: (id: string) => apiClient.get<ApiResponse<any>>(`/professionals/${id}`),

  // Disputes & Reviews
  raiseDispute: (data: { jobId: string; reason: string; description: string; evidenceUrls?: string[] }) =>
    apiClient.post<ApiResponse<Dispute>>('/disputes', data),
  getDispute: (id: string) => apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`),
  resolveDispute: (id: string, outcome: string, refundAmountInr?: number, notes?: string) =>
    apiClient.post<ApiResponse<any>>(`/disputes/${id}/resolve`, { outcome, refundAmountInr, notes }),
  createReview: (data: { jobId: string; rating: number; comment?: string; tags?: string[] }) =>
    apiClient.post<ApiResponse<any>>('/reviews', data),
  getProfessionalReviews: (profId: string) => apiClient.get<ApiResponse<any[]>>(`/reviews/professional/${profId}`),

  // Admin Console & Full Web App Control
  getAdminMetrics: () => apiClient.get<ApiResponse<any>>('/admin/metrics'),
  getAdminUsers: () => apiClient.get<ApiResponse<any[]>>('/admin/users'),
  updateAdminUser: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/admin/users/${id}`, data),
  deleteAdminUser: (id: string) => apiClient.delete<ApiResponse<any>>(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) => apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status`, { status }),
  adjustAdminUserCredits: (id: string, data: { amount: number; mode: 'ADD' | 'DEDUCT' | 'SET'; notes?: string }) =>
    apiClient.post<ApiResponse<any>>(`/admin/users/${id}/credits`, data),
  resetAdminUserPassword: (id: string, data: { newPassword: string }) =>
    apiClient.post<ApiResponse<any>>(`/admin/users/${id}/reset-password`, data),
  getAdminRequirements: () => apiClient.get<ApiResponse<any[]>>('/admin/requirements'),
  updateAdminRequirementStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<any>>(`/admin/requirements/${id}/status`, { status }),
  getAdminJobs: () => apiClient.get<ApiResponse<any[]>>('/admin/jobs'),
  updateAdminJobStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch<ApiResponse<any>>(`/admin/jobs/${id}/status`, { status, reason }),
  getAdminVerifications: () => apiClient.get<ApiResponse<any[]>>('/admin/verifications'),
  reviewVerification: (id: string, status: string, rejectionReason?: string) =>
    apiClient.patch<ApiResponse<any>>(`/admin/verifications/${id}`, { status, rejectionReason }),
  getAdminSettings: () => apiClient.get<ApiResponse<any[]>>('/admin/settings'),
  updateAdminSetting: (key: string, value: any) => apiClient.put<ApiResponse<any>>('/admin/settings', { key, value }),
  getAdminLocations: () => apiClient.get<ApiResponse<any[]>>('/admin/locations'),
  toggleAdminLocation: (type: string, id: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<any>>('/admin/locations/toggle', { type, id, isActive }),

  // Admin Plans & Boost Governance
  getAdminPlans: () => apiClient.get<ApiResponse<ProfessionalPlan[]>>('/admin/plans'),
  createAdminPlan: (data: any) => apiClient.post<ApiResponse<ProfessionalPlan>>('/admin/plans', data),
  updateAdminPlan: (id: string, data: any) => apiClient.put<ApiResponse<ProfessionalPlan>>(`/admin/plans/${id}`, data),
  getAdminBoostPackages: () => apiClient.get<ApiResponse<BoostPackage[]>>('/admin/boost-packages'),
  createAdminBoostPackage: (data: any) => apiClient.post<ApiResponse<BoostPackage>>('/admin/boost-packages', data),
  updateAdminBoostPackage: (id: string, data: any) => apiClient.put<ApiResponse<BoostPackage>>(`/admin/boost-packages/${id}`, data),
  getAdminCreditBatches: () => apiClient.get<ApiResponse<CreditBatch[]>>('/admin/credits/batches'),
  getAdminCreditLedger: () => apiClient.get<ApiResponse<CreditLedgerItem[]>>('/admin/credits/ledger'),
  triggerBatchExpiry: () => apiClient.post<ApiResponse<any>>('/admin/credits/process-expired'),
  createAdminCategory: (data: any) => apiClient.post<ApiResponse<Category>>('/admin/categories', data),
  updateAdminCategory: (id: string, data: any) => apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, data),
  deleteAdminCategory: (id: string) => apiClient.delete<ApiResponse<any>>(`/admin/categories/${id}`),
  createAdminSubcategory: (data: any) => apiClient.post<ApiResponse<any>>('/admin/subcategories', data),
  updateAdminSubcategory: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/admin/subcategories/${id}`, data),
  deleteAdminSubcategory: (id: string) => apiClient.delete<ApiResponse<any>>(`/admin/subcategories/${id}`),
};
