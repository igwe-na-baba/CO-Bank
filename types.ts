// FIX: Import React to make React types like `ComponentType` available in this file.
import React from 'react';

export type View = 'dashboard' | 'send' | 'recipients' | 'history' | 'security' | 'cards' | 'insurance' | 'loans' | 'support' | 'accounts' | 'crypto' | 'services' | 'checkin' | 'platform' | 'tasks' | 'flights' | 'utilities' | 'integrations' | 'advisor' | 'invest' | 'atmLocator' | 'quickteller' | 'qrScanner' | 'privacy' | 'wire' | 'about' | 'contact' | 'wallet' | 'ratings' | 'globalAid' | 'network';

export type BalanceDisplayMode = 'global' | 'domestic';

export enum TransactionStatus {
  SUBMITTED = 'Submitted',
  CONVERTING = 'In FX Conversion',
  AWAITING_AUTHORIZATION = 'Pending Authorization',
  FLAGGED_AWAITING_CLEARANCE = 'Flagged for Review',
  CLEARANCE_GRANTED = 'Clearance Granted',
  IN_TRANSIT = 'Sent to Network',
  FUNDS_ARRIVED = 'Funds Arrived',
  PENDING_DEPOSIT = 'Pending Deposit',
}

export enum CustomerGroup {
  ALL = 'all',
  NEW_USERS = 'new_users',
  FREQUENT_SENDERS = 'frequent_senders',
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  CARD = 'card',
  LOAN = 'loan',
  CRYPTO = 'crypto',
  SUBSCRIPTION = 'subscription',
  TRAVEL = 'travel',
  TASK = 'task',
  INSURANCE = 'insurance',
  // FIX: Add ACCOUNT type to support account-related notifications.
  ACCOUNT = 'account',
  // FIX: Add SUPPORT type to support support-related notifications.
  SUPPORT = 'support',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  linkTo?: View;
}

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

// FIX: Added missing PushNotificationSettings interface based on usage in constants.ts and App.tsx.
export interface PushNotificationSettings {
    transactions: boolean;
    security: boolean;
    promotions: boolean;
}

export interface PrivacySettings {
    ads: boolean;
    sharing: boolean;
    email: {
        transactions: boolean;
        security: boolean;
        promotions: boolean;
    };
    sms: {
        transactions: boolean;
        security: boolean;
        promotions: boolean;
    };
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export interface DeliveryOptions {
  bankDeposit: boolean;
  cardDeposit: boolean;
  cashPickup: boolean;
}

export interface RealAccountDetails {
  accountNumber: string;
  swiftBic: string;
}

export interface Recipient {
  id: string;
  fullName: string;
  nickname?: string;
  bankName: string;
  accountNumber: string; // Masked account number or service identifier for display
  country: Country;
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  phone?: string;
  deliveryOptions: DeliveryOptions;
  realDetails: RealAccountDetails;
  recipientType?: 'bank' | 'service';
  serviceName?: 'PayPal' | 'CashApp' | 'Zelle' | 'Western Union' | 'MoneyGram' | string;
}


export interface Transaction {
  id:string;
  accountId: string; // The ID of the source/destination account
  recipient: Recipient;
  sendAmount: number;
  receiveAmount: number;
  receiveCurrency?: string;
  fee: number;
  deliverySpeed?: 'Standard' | 'Express';
  exchangeRate: number;
  status: TransactionStatus;
  estimatedArrival: Date;
  statusTimestamps: {
    [TransactionStatus.SUBMITTED]: Date;
    [TransactionStatus.CONVERTING]?: Date;
    [TransactionStatus.AWAITING_AUTHORIZATION]?: Date;
    [TransactionStatus.FLAGGED_AWAITING_CLEARANCE]?: Date;
    [TransactionStatus.CLEARANCE_GRANTED]?: Date;
    [TransactionStatus.IN_TRANSIT]?: Date;
    [TransactionStatus.FUNDS_ARRIVED]?: Date;
    [TransactionStatus.PENDING_DEPOSIT]?: Date;
  };
  description: string;
  type: 'debit' | 'credit';
  // FIX: Made 'purpose' optional to align with its usage in `createTransaction`.
  purpose?: string;
  requiresAuth?: boolean;
  chequeDetails?: {
    chequeNumber?: string;
    images: {
      front: string;
      back: string;
    }
  }
  reviewed?: boolean;
  splitGroupId?: string;
  transferMethod?: 'wire';
  clearanceFeePaid?: boolean;
}

export type SpendingCategory = 'Electronics' | 'Transport' | 'Food & Drink' | 'Groceries' | 'Shopping' | 'Entertainment' | 'Travel' | 'Other';

export const SPENDING_CATEGORIES: SpendingCategory[] = ['Electronics', 'Transport', 'Food & Drink', 'Groceries', 'Shopping', 'Entertainment', 'Travel', 'Other'];

export interface Card {
  id: string;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  fullNumber?: string;
  cvc?: string;
  network: 'Visa' | 'Mastercard';
  cardType: 'DEBIT' | 'CREDIT';
  linkedAccountId?: string; // for debit cards
  creditDetails?: { // for credit cards
    creditLimit: number;
    currentBalance: number;
    statementBalance: number;
    minimumPayment: number;
    paymentDueDate: Date;
    apr: number;
  };
  rewards?: {
    pointsBalance?: number;
    cashBackBalance?: number;
    earnRates: { category: SpendingCategory | 'All'; rate: number; unit: 'points' | '%' }[];
  };
  controls: {
    isFrozen: boolean;
    onlinePurchases: boolean;
    internationalTransactions: boolean;
    transactionLimits?: {
        perTransaction: number | null; // null for no limit
        daily: number | null;
    };
    blockedCategories?: SpendingCategory[];
  };
}

export interface VirtualCard {
    id: string;
    nickname: string;
    lastFour: string;
    fullNumber: string;
    expiryDate: string;
    cvc: string;
    spendingLimit: number | null; // null for no limit
    spentThisMonth: number;
    lockedToMerchant: string | null;
    isFrozen: boolean;
    linkedCardId: string; // The physical card it's linked to
}

export interface CardTransaction {
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: SpendingCategory;
    status: 'Posted' | 'Pending';
    rewardsEarned?: {
        points?: number;
        cashBack?: number;
    };
    merchantInfo?: {
        name: string;
        logoUrl?: string;
        location?: string; // e.g. "San Francisco, CA"
    };
}

export interface LimitDetail {
  perTransaction?: number | 'Unlimited';
  daily: number | 'Unlimited';
  monthly: number | 'Unlimited';
}

// FIX: Added the legacy TransferLimits type back to resolve compilation errors in older components.
export interface TransferLimits {
  daily: { amount: number; count: number };
  weekly: { amount: number; count: number };
  monthly: { amount: number; count: number };
}

export interface AdvancedTransferLimits {
  p2p: LimitDetail; // e.g., Zelle, CashApp
  ach: LimitDetail; // To/from external bank accounts
  wire: LimitDetail;
  internal: LimitDetail; // Transfers between user's own accounts
}

export interface NewsArticle {
  title: string;
  summary: string;
  category: string;
}

export interface InsuranceProduct {
  name: string;
  description: string;
  benefits: string[];
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  interestRate: {
    min: number;
    max: number;
  };
}

export enum LoanApplicationStatus {
  PENDING = 'Pending Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LoanApplication {
  id: string;
  loanProduct: LoanProduct;
  amount: number;
  term: number; // in months
  status: LoanApplicationStatus;
  submittedDate: Date;
}

export interface SupportTopic {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SystemUpdate {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'New Feature' | 'Improvement' | 'Maintenance';
}

export enum AccountType {
  CHECKING = 'Global Checking',
  SAVINGS = 'High-Yield Savings',
  BUSINESS = 'Business Pro',
  EXTERNAL_LINKED = 'External Linked Account',
}

export enum VerificationLevel {
  UNVERIFIED = 'Unverified',
  LEVEL_1 = 'Level 1: SSN Verified',
  LEVEL_2 = 'Level 2: Document Verified',
  LEVEL_3 = 'Level 3: Liveness Verified',
}

export interface Account {
  id: string;
  type: AccountType;
  nickname?: string;
  accountNumber: string; // Masked
  fullAccountNumber?: string;
  balance: number;
  features: string[];
  status?: 'Active' | 'Provisioning' | 'Under Review';
}

// Crypto-specific types
export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  icon: React.ComponentType<{ className?: string }>;
  price: number;
  change24h: number;
  marketCap: number;
  priceHistory: number[];
}

export interface CryptoHolding {
  assetId: string;
  amount: number;
  avgBuyPrice: number;
}

export interface Order {
    price: number;
    size: number;
}

export interface Trade {
    id: string;
    price: number;
    size: number;
    time: string;
    type: 'buy' | 'sell';
}

// Services and Subscriptions
export enum SubscriptionServiceType {
    INTERNET = 'Internet',
    TV = 'TV',
    SATELLITE = 'Satellite',
}

export interface SubscriptionService {
    id: string;
    provider: string;
    plan: string;
    amount: number;
    dueDate: Date;
    type: SubscriptionServiceType;
    isPaid: boolean;
}

export interface SpendingLimit {
    category: SpendingCategory;
    limit: number; // The monthly limit in USD
}

export interface AppleCardDetails {
    lastFour: string;
    balance: number;
    creditLimit: number;
    availableCredit: number;
    spendingLimits: SpendingLimit[];
}

export interface AppleCardTransaction {
    id: string;
    vendor: string;
    category: SpendingCategory;
    amount: number;
    date: Date;
}

// Travel Check-In
export enum TravelPlanStatus {
    UPCOMING = 'Upcoming',
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
}

export interface TravelPlan {
    id: string;
    country: Country;
    startDate: Date;
    endDate: Date;
    status: TravelPlanStatus;
}

// Security
export interface SecuritySettings {
  mfa: {
    enabled: boolean;
    method: 'sms' | 'app' | null;
  };
  biometricsEnabled: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceType: 'desktop' | 'mobile';
  browser: string;
  location: string;
  lastLogin: Date;
  isCurrent: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  profilePictureUrl: string;
  lastLogin: {
    date: Date;
    from: string; // e.g., 'New York, NY'
  };
}

// Platform-specific features
export type PlatformTheme = 'blue' | 'green' | 'purple';

export interface PlatformSettings {
  hapticsEnabled: boolean;
  theme: PlatformTheme;
  themeMode?: 'light' | 'dark';
}

// Task Management
export type TaskCategory = 'Financial' | 'Personal' | 'Work' | 'Other';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  notificationSent?: boolean;
  category?: TaskCategory;
}

// Flight Booking
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  from: Airport;
  to: Airport;
  departureTime: Date;
  arrivalTime: Date;
  duration: string; // e.g., "8h 30m"
  price: number;
  stops: number;
}

export interface FlightBooking {
    id: string;
    flight: Flight;
    passengers: number;
    totalPrice: number;
    bookingDate: Date;
    status: 'Confirmed' | 'Pending' | 'Cancelled';
}

// Utilities
export enum UtilityType {
    ELECTRICITY = 'Electricity',
    WATER = 'Water',
    GAS = 'Gas',
    INTERNET = 'Internet',
}

export interface UtilityBiller {
    id: string;
    name: string;
    type: UtilityType;
    icon: React.ComponentType<{ className?: string }>;
    accountNumber: string; // user's account number with the biller
}

export interface UtilityBill {
    id: string;
    billerId: string;
    amount: number;
    dueDate: Date;
    isPaid: boolean;
}

// AI Financial Advisor
export interface FinancialInsight {
    category: string; // e.g., "Spending", "Savings"
    insight: string; // e.g., "Your spending on 'Food & Drink' is 20% higher this month."
    priority: 'high' | 'medium' | 'low';
}

export interface ProductRecommendation {
    productType: 'loan' | 'savings_account' | 'insurance' | 'credit_card';
    reason: string; // e.g., "Your high savings balance could be earning more in a High-Yield Savings account."
    suggestedAction: string; // e.g., "Explore Savings Accounts"
    linkTo: View;
}

export interface AdvisorResponse {
    overallSummary: string;
    financialScore: number; // A score from 0-100
    insights: FinancialInsight[];
    recommendations: ProductRecommendation[];
}

export interface AtmLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  // FIX: Changed 'ApexBank' to 'iCredit Union®' to match the value used in constants.ts, resolving the type error.
  network: 'Allpoint' | 'Visa Plus' | 'Cirrus' | 'iCredit Union®';
  lat: number;
  lng: number;
}

// Quickteller / Airtime
export interface AirtimeProvider {
    id: string;
    name: string;
    logo: React.ComponentType<{ className?: string }>;
}

export interface AirtimePurchase {
    id: string;
    providerId: string;
    phoneNumber: string;
    amount: number;
    purchaseDate: Date;
}

export interface SavedSession {
  view: View;
  timestamp: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LeadershipProfile {
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
}

// Digital Wallet
export interface WalletDetails {
  balance: number;
  currency: 'USD';
  cardLastFour: string;
}

export interface WalletTransaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: 'debit' | 'credit'; // debit is money out, credit is money in
}

// Ratings & Reviews
export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface StaffProfile {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
  rating: number; // 1-5
}

// Global Aid
export interface Cause {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  details?: {
    description: string;
    impacts: string[];
  };
}

export interface Donation {
  id: string;
  causeId: string;
  amount: number;
  date: Date;
}