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
    slug?: string | null;
    title: string | null;
    rating: number;
    reviewsCount: number;
    completedJobsCount: number;
    isVerified: boolean;
    verification?: ProfessionalVerification | null;
    hourlyRate?: number;
    bio?: string | null;
    languages?: string | null;
    avatarUrl?: string | null;
    profileStrength?: number | ProfileStrengthResult | null;
    trustScore?: number | TrustScoreResult | null;
    categoryId?: string | null;
    subcategoryId?: string | null;
    availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
    workingDays?: string | null;
    workingHours?: string | null;
    workingPreferences?: string | null;
    qualifications?: string | null;
    serviceDescription?: string | null;
    experienceDescription?: string | null;
    visibility?: 'PUBLIC' | 'HIDDEN';
    creditWallet?: {
      balance: number;
    } | null;
  } | null;
}

export interface ProfileStrengthItem {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  actionKey: string;
  actionLabel: string;
}

export interface ProfileStrengthResult {
  score: number;
  level: 'INCOMPLETE' | 'BASIC' | 'GOOD' | 'STRONG' | 'COMPLETE';
  levelLabel: string;
  completedCount: number;
  totalCount: number;
  missingItems: ProfileStrengthItem[];
  completedItems: ProfileStrengthItem[];
  recommendations: Array<{
    id: string;
    label: string;
    actionKey: string;
    actionLabel: string;
    points: number;
  }>;
}

export interface TrustSignalBreakdown {
  id: string;
  name: string;
  points: number;
  maxPoints: number;
  isVerified: boolean;
  description: string;
}

export interface TrustScoreResult {
  score: number;
  trustLevel: 'HIGH_TRUST' | 'ESTABLISHED' | 'BUILDING_TRUST' | 'NEW_PROFESSIONAL';
  trustBadgeText: string;
  trustDescription: string;
  isNewProfessional: boolean;
  tooltipText: string;
  signals: TrustSignalBreakdown[];
  publicSummary: {
    digilockerVerified: boolean;
    mobileVerified: boolean;
    emailVerified: boolean;
    rating: number;
    reviewsCount: number;
    completedJobsCount: number;
    yearsOfExperience: number;
    badgeText: string;
  };
}

export interface PublicProfessionalProfile {
  id: string;
  slug?: string;
  name: string;
  displayName: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  yearsOfExperience: number;
  hourlyRate: number;
  currency: string;
  category?: { id: string; name: string; slug: string } | null;
  subcategory?: { id: string; name: string; slug: string } | null;
  serviceDescription?: string | null;
  experienceDescription?: string | null;
  qualifications?: string | null;
  workingPreferences?: string | null;
  languages?: string;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
  workingDays?: string;
  workingHours?: string;
  rating: number;
  reviewsCount: number;
  completedJobsCount: number;
  responseRatePercentage: number;
  isVerified: boolean;
  verificationBadge?: string | null;
  memberSince?: string;
  skills: string[];
  serviceAreas: string[];
  trustSummary: {
    digilockerVerified: boolean;
    mobileVerified: boolean;
    emailVerified: boolean;
    rating: number;
    reviewsCount: number;
    completedJobsCount: number;
    yearsOfExperience: number;
    badgeText: string;
    trustLevel: string;
    trustBadgeText: string;
    trustDescription: string;
    isNewProfessional: boolean;
    tooltipText: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    tags?: string;
    responseComment?: string;
    createdAt: string;
    customerName: string;
  }>;
}

export type VerificationStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVIEW_REQUIRED' | 'EXPIRED';

export interface ProfessionalVerification {
  id: string;
  professionalProfileId: string;
  status: VerificationStatus;
  provider: string;
  referenceId?: string | null;
  requestId?: string | null;
  transactionId?: string | null;
  verificationReference?: string | null;
  documentType?: string | null;
  nameMatchStatus?: string | null;
  dobMatchStatus?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  failureReason?: string | null;
  reviewReason?: string | null;
  rejectionReason?: string | null;
  attemptCount?: number;
  lastAttemptAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  pincode?: Pincode | string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  timeline?: string | null;
  frequency?: string | null;
  experienceRequirement?: string | null;
  genderPreference?: string | null;
  specialInstructions?: string | null;
  status: string;
  isBoosted?: boolean;
  boostPriority?: number;
  boostExpiresAt?: string | null;
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
  workStatus?: string;
  paymentStatus?: string;
  customerConfirmedAt?: string | null;
  disputeReason?: string | null;
  disputedAt?: string | null;
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

export interface ProfessionalPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  visibilityTier: string;
  description?: string | null;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CreditBatch {
  id: string;
  professionalProfileId: string;
  planPurchaseId?: string | null;
  initialPurchasedCredits: number;
  initialBonusCredits: number;
  remainingPurchasedCredits: number;
  remainingBonusCredits: number;
  totalRemainingCredits: number;
  grantedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED_NON_REFUNDABLE' | 'REFUND_PENDING' | 'REFUNDED';
  refundAmountPaise: number;
  refundedAt?: string | null;
  planPurchase?: {
    plan?: ProfessionalPlan;
  } | null;
}

export interface CreditLedgerItem {
  id: string;
  professionalProfileId: string;
  creditBatchId?: string | null;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceEntityId?: string | null;
  reason?: string | null;
  createdAt: string;
  batch?: CreditBatch | null;
}

export interface DetailedCreditWallet {
  id?: string;
  walletId?: string;
  professionalProfileId?: string;
  balance: number;
  availableCredits?: number;
  creditValueInr?: number;
  purchasedCredits: number;
  bonusCredits: number;
  expiringCredits?: number;
  expiringCredits30Days?: number;
  expiringCredits90Days?: number;
  creditsExpiringSoon?: number;
  nextExpiryDate: string | null;
  refundableCredits: number;
  refundableAmountInr: number;
  creditsPendingRefund?: number;
  creditsRefunded?: number;
  creditsUsed?: number;
  visibilityTier: string;
  lifetimePurchased: number;
  lifetimeSpent: number;
  batches?: CreditBatch[];
  activeBatches?: CreditBatch[];
  recentLedger?: CreditLedgerItem[];
}

export interface ProfessionalTransaction {
  id: string;
  professionalId?: string;
  type: string;
  displayType?: string;
  title?: string;
  category?: 'CREDIT' | 'PAYMENT' | 'REFUND';
  currency?: 'CREDITS' | 'INR';
  description?: string;
  amount: string;
  rawAmount?: number;
  creditAmount?: number | null;
  currencyAmount?: number | null;
  direction: 'CREDIT' | 'DEBIT';
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  requirement?: {
    id: string;
    title: string;
  } | null;
  metadata?: {
    requirementTitle?: string;
    requirementId?: string;
    refundReason?: string;
    planName?: string;
    paymentMethod?: string;
    customerName?: string;
  };
  applicationId?: string | null;
  jobId?: string | null;
  paymentId?: string | null;
  razorpayReference?: string | null;
  reason?: string;
  status?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface BoostPackage {
  id: string;
  name: string;
  slug: string;
  durationDays: number;
  price: number;
  priority: number;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
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

export interface MessageAttachment {
  id: string;
  messageId?: string;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt?: string;
}

export interface CallRequest {
  id: string;
  chatThreadId?: string | null;
  jobId?: string | null;
  requirementId?: string | null;
  requesterUserId: string;
  receiverUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime?: string | null;
  message?: string | null;
  acceptedAt?: string | null;
  callSessionId?: string | null;
  createdAt: string;
  requester?: { id: string; firstName: string; lastName: string };
  receiver?: { id: string; firstName: string; lastName: string };
}

export interface CallSession {
  sessionId: string;
  id?: string;
  status: 'CREATED' | 'READY' | 'RINGING' | 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'FAILED' | 'CANCELLED';
  provider: string;
  callerName?: string;
  receiverName?: string;
  scheduledTime?: string;
  displayInstructions: string;
}

export interface ChatThread {
  id: string;
  jobId?: string | null;
  requirementId?: string | null;
  status?: string;
  isArchived?: boolean;
  isBlocked?: boolean;
  unreadCount?: number;
  participants: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      professionalProfile?: {
        id: string;
        slug?: string | null;
        title?: string | null;
        avatarUrl?: string | null;
        isVerified?: boolean;
      } | null;
    };
  }[];
  otherParticipant?: {
    id: string;
    name: string;
    firstName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    title?: string;
  } | null;
  job?: {
    id: string;
    status: string;
    agreedPrice: number;
    title?: string;
    requirement?: { title: string };
  } | null;
  requirement?: {
    id: string;
    title: string;
    status: string;
  } | null;
  messages: Message[];
  lastMessage?: {
    id: string;
    content: string;
    messageType: string;
    createdAt: string;
    senderName: string;
    isMe: boolean;
  } | null;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatThreadId: string;
  senderUserId: string;
  content: string;
  body?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | string;
  status?: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | string;
  isContactWarning?: boolean;
  warningMessage?: string | null;
  isMe?: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments?: MessageAttachment[];
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

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
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
