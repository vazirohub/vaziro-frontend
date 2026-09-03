export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  customerProfile?: {
    id: string;
    trustScore: number;
    jobsPostedCount: number;
    jobsCompletedCount: number;
  } | null;
  professionalProfile?: {
    id: string;
    title: string | null;
    rating: number;
    reviewsCount: number;
    completedJobsCount: number;
    isVerified: boolean;
    hourlyRate?: number;
    bio?: string | null;
    languages?: string | null;
    creditWallet?: {
      balance: number;
    } | null;
  } | null;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface IndianState {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  stateId?: string;
  state?: IndianState;
  areas?: Area[];
}

export interface Area {
  id: string;
  name: string;
  locality?: string | null;
  pincodes?: Pincode[];
}

export interface Pincode {
  id: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Requirement {
  id: string;
  customerId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  budgetType: 'FIXED' | 'RANGE';
  budgetMin: number;
  budgetMax?: number;
  currency: string;
  cityId?: string | null;
  pincodeId?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  timeline?: string | null;
  frequency?: string | null;
  experienceRequirement?: string | null;
  genderPreference?: string | null;
  specialInstructions?: string | null;
  status: string;
  creditsRequired?: number;
  createdAt: string;
  category?: Category;
  subcategory?: Subcategory;
  city?: City;
  customerTrust?: {
    firstName: string;
    jobsPostedCount: number;
    jobsCompletedCount: number;
    memberSince: string;
    trustScore: number;
  };
  _count?: {
    applications: number;
    quotations: number;
  };
}

export interface Quotation {
  id: string;
  requirementId: string;
  professionalProfileId: string;
  proposedPrice: number;
  currency: string;
  estimatedTimeline: string;
  proposedStartDate?: string | null;
  message?: string | null;
  scopeSummary?: string | null;
  additionalCharges: number;
  status: string;
  createdAt: string;
  professional?: {
    id: string;
    title: string | null;
    bio: string | null;
    yearsOfExperience: number;
    rating: number;
    reviewsCount: number;
    completedJobsCount: number;
    isVerified: boolean;
    user: {
      firstName: string;
      lastName: string;
      createdAt: string;
    };
    skills?: { skill: { name: string } }[];
  };
  aiMatch?: {
    score: number;
    ratingGrade: 'EXCELLENT' | 'HIGH' | 'MODERATE' | 'BASIC';
    reasons: string[];
  };
  milestones?: {
    id: string;
    title: string;
    description?: string;
    amount: number;
    status: string;
  }[];
}

export interface Job {
  id: string;
  requirementId: string;
  quotationId: string;
  customerId: string;
  professionalProfileId: string;
  agreedPrice: number;
  currency: string;
  status: string;
  paymentProtectionEnabled: boolean;
  scheduledStartTime?: string | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  createdAt: string;
  requirement?: Requirement;
  quotation?: Quotation;
  customer?: {
    user: { firstName: string; lastName: string; phone?: string | null };
  };
  professional?: {
    user: { firstName: string; lastName: string; phone?: string | null };
    isVerified: boolean;
  };
  statusHistory?: {
    id: string;
    previousStatus?: string | null;
    newStatus: string;
    reason?: string | null;
    createdAt: string;
  }[];
  review?: {
    id: string;
    rating: number;
    comment?: string;
  } | null;
  payments?: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
  }[];
  paymentProtection?: {
    heldAmount: number;
    platformFeeAmount: number;
    status: string;
  } | null;
}

export interface CreditPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  creditsCount: number;
  perks?: string | null;
  isRecommended: boolean;
  isActive: boolean;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  transactionType: string;
  referenceEntityId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreditWallet {
  id: string;
  professionalProfileId: string;
  balance: number;
  lifetimePurchased: number;
  lifetimeSpent: number;
  transactions: CreditTransaction[];
}

export interface ChatThread {
  id: string;
  jobId?: string | null;
  requirementId?: string | null;
  participants: {
    userId: string;
    user: { id: string; firstName: string; lastName: string };
  }[];
  job?: {
    id: string;
    status: string;
    agreedPrice: number;
    requirement?: { title: string };
  } | null;
  messages: Message[];
  updatedAt: string;
}

export interface Message {
  id: string;
  chatThreadId: string;
  senderUserId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Dispute {
  id: string;
  jobId: string;
  reason: string;
  amountDisputed: number;
  status: string;
  createdAt: string;
  job?: {
    requirement?: { title: string };
  };
  resolution?: {
    resolutionOutcome: string;
    refundAmount: number;
    notes: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}
