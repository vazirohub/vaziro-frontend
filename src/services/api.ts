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
  ChatThread,
  Message,
  Dispute,
} from '../types';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000/api/v1' : 'https://api.vaziro.in/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

export const api = {
  // Auth
  requestOtp: (phone: string) =>
    apiClient.post<ApiResponse<{ phone: string; cooldownSeconds: number }>>('/auth/otp/request', { phone }),

  verifyOtp: (payload: { phone: string; otp: string; role: 'CUSTOMER' | 'PROFESSIONAL'; firstName?: string; lastName?: string }) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User; isNewUser: boolean }>>('/auth/otp/verify', payload),

  loginWithPassword: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { email, password }),

  getMe: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),

  // Categories & Locations
  getCategories: () => apiClient.get<ApiResponse<Category[]>>('/categories'),
  getStates: () => apiClient.get<ApiResponse<IndianState[]>>('/locations/states'),
  getCitiesByState: (stateId: string) => apiClient.get<ApiResponse<City[]>>(`/locations/cities/${stateId}`),

  // Requirements
  createRequirement: (data: any) => apiClient.post<ApiResponse<Requirement>>('/requirements', data),
  getRequirements: (params?: any) => apiClient.get<ApiResponse<Requirement[]>>('/requirements', { params }),
  getMyRequirements: () => apiClient.get<ApiResponse<Requirement[]>>('/requirements/my'),
  getRequirementById: (id: string) => apiClient.get<ApiResponse<Requirement>>(`/requirements/${id}`),
  updateRequirementStatus: (id: string, status: string) => apiClient.patch<ApiResponse<any>>(`/requirements/${id}/status`, { status }),

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

  // Credits & Wallet
  getCreditWallet: () => apiClient.get<ApiResponse<CreditWallet>>('/credits/wallet'),
  getCreditPlans: () => apiClient.get<ApiResponse<CreditPlan[]>>('/credits/plans'),
  calculateCreditFee: (budgetMin: number, budgetMax?: number) =>
    apiClient.post<ApiResponse<{ creditsRequired: number; nominalCostInr: number }>>('/credits/calculate-fee', { budgetMin, budgetMax }),
  purchaseCreditPlan: (planId: string) => apiClient.post<ApiResponse<any>>('/credits/purchase', { planId }),

  // Chat & Calling
  getChatThreads: () => apiClient.get<ApiResponse<ChatThread[]>>('/chat/threads'),
  getChatMessages: (threadId: string) => apiClient.get<ApiResponse<Message[]>>(`/chat/threads/${threadId}/messages`),
  sendMessage: (threadId: string, content: string) => apiClient.post<ApiResponse<Message>>(`/chat/threads/${threadId}/messages`, { content }),
  initiateMaskedCall: (jobId: string) => apiClient.post<ApiResponse<any>>('/calls/initiate', { jobId }),

  // Payments & Payouts
  createPaymentOrder: (jobId: string, amount: number, paymentMethod?: string) =>
    apiClient.post<ApiResponse<any>>('/payments/create-order', { jobId, amount, paymentMethod }),
  mockPaymentWebhook: (paymentId: string, amount: number) =>
    apiClient.post<ApiResponse<any>>('/payments/webhook', {
      payload: { paymentId, amount, providerRefId: `mock_ref_${Date.now()}` },
    }),
  releasePayment: (jobId: string) => apiClient.post<ApiResponse<any>>(`/payments/${jobId}/release`),
  getInvoice: (jobId: string) => apiClient.get<ApiResponse<any>>(`/payments/invoice/${jobId}`),

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

  // Admin Console
  getAdminMetrics: () => apiClient.get<ApiResponse<any>>('/admin/metrics'),
  getAdminUsers: () => apiClient.get<ApiResponse<any[]>>('/admin/users'),
  updateUserStatus: (id: string, status: string) => apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status`, { status }),
  getAdminVerifications: () => apiClient.get<ApiResponse<any[]>>('/admin/verifications'),
  reviewVerification: (id: string, status: string, rejectionReason?: string) =>
    apiClient.patch<ApiResponse<any>>(`/admin/verifications/${id}`, { status, rejectionReason }),
  getAdminSettings: () => apiClient.get<ApiResponse<any[]>>('/admin/settings'),
  updateAdminSetting: (key: string, value: any) => apiClient.put<ApiResponse<any>>('/admin/settings', { key, value }),
  toggleAdminLocation: (type: string, id: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<any>>('/admin/locations/toggle', { type, id, isActive }),
};
