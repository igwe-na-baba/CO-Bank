// FIX: Import `useMemo` and `useRef` from React to resolve 'Cannot find name' errors.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { Recipients } from './components/Recipients';
import { Transaction, Recipient, TransactionStatus, Card, Notification, NotificationType, AdvancedTransferLimits, Country, LoanApplication, LoanApplicationStatus, Account, VerificationLevel, CryptoHolding, CryptoAsset, SubscriptionService, AppleCardDetails, AppleCardTransaction, SpendingLimit, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, View, Task, FlightBooking, UtilityBill, UtilityBiller, AdvisorResponse, BalanceDisplayMode, AccountType, AirtimePurchase, PushNotification, PushNotificationSettings, SavedSession, VirtualCard, WalletDetails, Donation, PrivacySettings } from './types';
// FIX: Added NEW_USER_ACCOUNTS_TEMPLATE to the import from constants.ts to resolve a reference error.
import { INITIAL_RECIPIENTS, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_CARD_TRANSACTIONS, INITIAL_ADVANCED_TRANSFER_LIMITS, SELF_RECIPIENT, INITIAL_ACCOUNTS, getInitialCryptoAssets, INITIAL_CRYPTO_HOLDINGS, CRYPTO_TRADE_FEE_PERCENT, INITIAL_SUBSCRIPTIONS, INITIAL_APPLE_CARD_DETAILS, INITIAL_APPLE_CARD_TRANSACTIONS, INITIAL_TRAVEL_PLANS, INITIAL_SECURITY_SETTINGS, INITIAL_TRUSTED_DEVICES, USER_PROFILE, INITIAL_PLATFORM_SETTINGS, THEME_COLORS, INITIAL_TASKS, INITIAL_FLIGHT_BOOKINGS, INITIAL_UTILITY_BILLS, getUtilityBillers, getAirtimeProviders, INITIAL_AIRTIME_PURCHASES, INITIAL_PUSH_SETTINGS, EXCHANGE_RATES, NEW_USER_PROFILE_TEMPLATE, NEW_USER_ACCOUNTS_TEMPLATE, INITIAL_VIRTUAL_CARDS, DOMESTIC_WIRE_FEE, INTERNATIONAL_WIRE_FEE, LEGAL_CONTENT, INITIAL_WALLET_DETAILS } from './constants';
import * as Icons from './components/Icons';
import { Welcome } from './components/Welcome';
import { ActivityLog } from './components/ActivityLog';
import { Security } from './components/Security';
import { CardManagement } from './components/CardManagement';
import { Loans } from './components/Loans';
import { Support } from './components/Support';
import { Accounts } from './components/Accounts';
import { CryptoDashboard } from './components/CryptoDashboard';
import { ServicesDashboard } from './components/ServicesDashboard';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';
import { InactivityModal } from './components/InactivityModal';
import { TravelCheckIn } from './components/TravelCheckIn';
import { PlatformFeatures } from './components/PlatformFeatures';
import { DynamicIslandSimulator } from './components/DynamicIslandSimulator';
import { BankingChat } from './components/BankingChat';
// FIX: Corrected import path casing for Tasks component from './components/tasks' to './components/Tasks' to resolve module resolution error.
import { Tasks } from './components/Tasks';
import { Flights } from './components/Flights';
import { Utilities } from './components/Utilities';
import { Integrations } from './components/Integrations';
import { FinancialAdvisor } from './components/FinancialAdvisor';
// FIX: Added generateFullWelcomeEmail and generateFullWelcomeSms to the import from notificationService.ts to resolve reference errors.
import {
  sendTransactionalEmail,
  generateTransactionReceiptEmail,
  generateNewRecipientEmail,
  generateCardStatusEmail,
  generateFundsArrivedEmail,
  sendSmsNotification,
  generateLoginAlertEmail,
  generateLoginAlertSms,
  generateNewRecipientSms,
  generateTransactionReceiptSms,
  generateWelcomeEmail,
  generateWelcomeSms,
  generateFullWelcomeEmail,
  generateFullWelcomeSms,
  generateDepositConfirmationEmail,
  generateDepositConfirmationSms,
  generateTaskReminderEmail,
  generateTaskReminderSms,
  generateNewAccountOtpEmail,
  generateNewAccountOtpSms,
  generateSupportTicketConfirmationEmail,
  generateSupportTicketConfirmationSms
} from './services/notificationService';
import { getFinancialAnalysis } from './services/geminiService';
import { OpeningSequence } from './components/OpeningSequence';
import { LoggingOut } from './components/LoggingOut';
import { Insurance } from './components/Insurance';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Investments } from './components/Investments';
import { Footer } from './components/Footer';
import { AtmLocator } from './components/AtmLocator';
import { Quickteller } from './components/Quickteller';
import { QrScanner } from './components/QrScanner';
import { LinkBankAccountModal } from './components/LinkBankAccountModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { CongratulationsOverlay } from './components/CongratulationsOverlay';
import { ResumeSessionModal } from './components/ResumeSessionModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { PrivacyCenter } from './components/PrivacyCenter';
import { ProfileSignIn } from './components/ProfileSignIn';
import { AccountCreationFlow } from './components/AccountCreationFlow';
// FIX: Imported the missing LoggedOut component.
import { LoggedOut } from './components/LoggedOut';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AdvancedFirstPage } from './components/AdvancedFirstPage';
import { WireTransfer } from './components/WireTransfer';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { LegalModal } from './components/LegalModal';
import { DigitalWallet } from './components/DigitalWallet';
import { Ratings } from './components/Ratings';
import { GlobalAid } from './components/GlobalAid';
import { GlobalBankingNetwork } from './components/GlobalBankingNetwork';


type AuthStatus = 'intro' | 'initializing' | 'auth' | 'loggedIn' | 'locked' | 'creatingAccount';

const INACTIVITY_WARNING_TIMEOUT = 9 * 60 * 1000; // 9 minutes
const INACTIVITY_MODAL_COUNTDOWN = 60; // 60 seconds

const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";
const USER_PHONE = "+1-555-012-1234";

interface SendMoneyFlowState {
  isOpen: boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  transactionToRepeat?: Transaction | null;
}


function AppContent() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('intro');
  const [balanceDisplayMode, setBalanceDisplayMode] = useState<BalanceDisplayMode>('global');
  const [isNewAccountLogin, setIsNewAccountLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [advancedTransferLimits, setAdvancedTransferLimits] = useState<AdvancedTransferLimits>(INITIAL_ADVANCED_TRANSFER_LIMITS);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.UNVERIFIED);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(() => getInitialCryptoAssets(Icons));
  const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
  const [appleCardDetails, setAppleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
  const [appleCardTransactions, setAppleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
  const utilityBillers = useMemo(() => getUtilityBillers(Icons), []);
  const airtimeProviders = useMemo(() => getAirtimeProviders(Icons), []);
  const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
  const [sendMoneyFlowState, setSendMoneyFlowState] = useState<SendMoneyFlowState>({ isOpen: false });
  const [isLinkAccountModalOpen, setIsLinkAccountModalOpen] = useState(false);
  const [pushNotification, setPushNotification] = useState<PushNotification | null>(null);
  const [showCongratsOverlay, setShowCongratsOverlay] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [initialSupportTxId, setInitialSupportTxId] = useState<string | undefined>();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ ads: true, sharing: true, email: { transactions: true, security: true, promotions: true }, sms: { transactions: true, security: true, promotions: false } });
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: string } | null>(null);
  const [walletDetails, setWalletDetails] = useState<WalletDetails>(INITIAL_WALLET_DETAILS);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isWireTransferOpen, setIsWireTransferOpen] = useState(false);
  const [wireTransferInitialData, setWireTransferInitialData] = useState<any>(null);

  const [pushNotificationSettings, setPushNotificationSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
  const [linkedServices, setLinkedServices] = useState<Record<string, string>>({});
  const [cardTransactions, setCardTransactions] = useState(INITIAL_CARD_TRANSACTIONS);

  const inactivityTimer = useRef<number | undefined>();
  const inactivityWarningTimer = useRef<number | undefined>();

  useEffect(() => {
    const root = document.documentElement;
    const newThemeColors = THEME_COLORS[platformSettings.theme];
    for (const [key, value] of Object.entries(newThemeColors)) {
        root.style.setProperty(`--color-primary-${key}`, value);
    }
  }, [platformSettings.theme]);

  const openLegalModal = (title: string, content: string) => {
    setLegalModalContent({ title, content });
  };

  const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);
    // Also trigger a push notification simulation
    const newPush: PushNotification = { id: newNotification.id, type, title, message };
    setPushNotification(newPush);
  }, []);

  // FIX: Correctly merge nested state objects to prevent overwriting values and resolve spread operator type errors.
  const handleUpdatePrivacySettings = (update: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => ({
      ...prev,
      ...update,
      email: {
        ...prev.email,
        ...(update.email || {}),
      },
      sms: {
        ...prev.sms,
        ...(update.sms || {}),
      },
    }));
  };

    useEffect(() => {
        const timers: number[] = [];

        transactions.forEach(tx => {
            // A transaction that has been manually reviewed (like after clearing a hold) should not be auto-progressed.
            if (tx.reviewed) return;

            const progressionMap: Partial<Record<TransactionStatus, { next: TransactionStatus, delay: number }>> = {
                [TransactionStatus.SUBMITTED]: { next: TransactionStatus.CONVERTING, delay: 2000 },
                [TransactionStatus.CONVERTING]: { 
                    // If a transaction requires auth, it must be flagged. Otherwise, it proceeds normally.
                    next: tx.requiresAuth ? TransactionStatus.FLAGGED_AWAITING_CLEARANCE : TransactionStatus.IN_TRANSIT, 
                    delay: 3000 
                },
                [TransactionStatus.CLEARANCE_GRANTED]: { next: TransactionStatus.IN_TRANSIT, delay: 2500 },
                [TransactionStatus.IN_TRANSIT]: { next: TransactionStatus.FUNDS_ARRIVED, delay: 5000 },
            };

            const currentProgression = progressionMap[tx.status];

            if (currentProgression) {
                const timer = setTimeout(() => {
                    setTransactions(prev =>
                        prev.map(t =>
                            t.id === tx.id
                                ? {
                                    ...t,
                                    status: currentProgression.next,
                                    statusTimestamps: {
                                        ...t.statusTimestamps,
                                        [currentProgression.next]: new Date(),
                                    },
                                }
                                : t
                        )
                    );
                     if (currentProgression.next === TransactionStatus.FUNDS_ARRIVED) {
                        addNotification(
                            NotificationType.TRANSACTION,
                            'Funds Arrived',
                            `Your transfer of ${tx.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${tx.recipient.fullName} has arrived.`,
                            'history'
                        );
                        const { subject, body } = generateFundsArrivedEmail(tx, userProfile.name);
                        sendTransactionalEmail(userProfile.email, subject, body);
                    }
                }, currentProgression.delay);
                timers.push(timer as any as number);
            }
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [transactions, addNotification, userProfile.name, userProfile.email]);

    const handleLogout = useCallback(() => {
        setIsLogoutModalOpen(false);
        setShowInactivityModal(false);
        setIsLoggingOut(true);
        const sessionToSave: SavedSession = { view: activeView, timestamp: Date.now() };
        localStorage.setItem('savedSession', JSON.stringify(sessionToSave));
        setTimeout(() => {
            setAuthStatus('locked');
            setIsLoggingOut(false);
            // Reset to a default state for next login
            setActiveView('dashboard');
        }, 3000);
    }, [activeView]);


    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        if (inactivityWarningTimer.current) clearTimeout(inactivityWarningTimer.current);
        setShowInactivityModal(false);

        if (authStatus === 'loggedIn') {
            inactivityWarningTimer.current = window.setTimeout(() => {
                setShowInactivityModal(true);
            }, INACTIVITY_WARNING_TIMEOUT);
        }
    }, [authStatus]);

    useEffect(() => {
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keydown', resetInactivityTimer);
        window.addEventListener('click', resetInactivityTimer);

        resetInactivityTimer(); // Initial call

        return () => {
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('keydown', resetInactivityTimer);
            window.removeEventListener('click', resetInactivityTimer);
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            if (inactivityWarningTimer.current) clearTimeout(inactivityWarningTimer.current);
        };
    }, [resetInactivityTimer]);


    useEffect(() => {
        const saved = localStorage.getItem('savedSession');
        if (saved) {
            setSavedSession(JSON.parse(saved));
        }
    }, []);

    const handleResume = () => {
        if (savedSession) {
            setActiveView(savedSession.view);
        }
        setIsResumeModalOpen(false);
        localStorage.removeItem('savedSession');
        setSavedSession(null);
    };

    const handleStartFresh = () => {
        setActiveView('dashboard');
        setIsResumeModalOpen(false);
        localStorage.removeItem('savedSession');
        setSavedSession(null);
    };


    const createTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>): Transaction | null => {
        const sourceAccount = accounts.find(acc => acc.id === transactionData.accountId);
        if (!sourceAccount) {
            console.error("Source account not found for transaction");
            return null;
        }

        const totalCost = transactionData.sendAmount + transactionData.fee;

        if (sourceAccount.type !== AccountType.EXTERNAL_LINKED && sourceAccount.balance < totalCost) {
            addNotification(NotificationType.TRANSACTION, 'Transaction Failed', 'Insufficient funds to complete the transfer.', 'send');
            return null;
        }
        
        // For demonstration, flag any new transfer to 'Jane Doe' for compliance review.
        const shouldBeFlagged = transactionData.recipient.id === 'rec_1';

        const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            ...transactionData,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + (transactionData.deliverySpeed === 'Express' ? 86400000 : 86400000 * 3)),
            statusTimestamps: {
                [TransactionStatus.SUBMITTED]: new Date()
            },
            type: 'debit',
            requiresAuth: shouldBeFlagged,
            reviewed: false,
        };
        setTransactions(prev => [newTransaction, ...prev]);

        if (sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
            setAccounts(prev => prev.map(acc =>
                acc.id === transactionData.accountId ? { ...acc, balance: acc.balance - totalCost } : acc
            ));
        }
        
        const { subject, body } = generateTransactionReceiptEmail(newTransaction, userProfile.name);
        sendTransactionalEmail(userProfile.email, subject, body);

        if (privacySettings.sms.transactions) {
            sendSmsNotification(userProfile.phone!, generateTransactionReceiptSms(newTransaction));
        }

        addNotification(
            NotificationType.TRANSACTION,
            'Transaction Sent',
            `You sent ${transactionData.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${transactionData.recipient.fullName}.`,
            'history'
        );

        return newTransaction;
    }, [accounts, addNotification, userProfile.name, userProfile.email, userProfile.phone, privacySettings.sms.transactions]);


    const addRecipient = (data: {
        fullName: string;
        nickname?: string;
        phone?: string;
        bankName: string;
        accountNumber: string;
        swiftBic: string;
        country: Country;
        cashPickupEnabled: boolean;
        streetAddress: string;
        city: string;
        stateProvince: string;
        postalCode: string;
    }) => {
        const newRecipient: Recipient = {
            id: `rec_${Date.now()}`,
            fullName: data.fullName,
            nickname: data.nickname,
            phone: data.phone,
            bankName: data.bankName,
            accountNumber: `**** **** **** ${data.accountNumber.slice(-4)}`,
            country: data.country,
            streetAddress: data.streetAddress,
            city: data.city,
            stateProvince: data.stateProvince,
            postalCode: data.postalCode,
            deliveryOptions: {
                bankDeposit: true,
                cardDeposit: false,
                cashPickup: data.cashPickupEnabled,
            },
            realDetails: {
                accountNumber: data.accountNumber,
                swiftBic: data.swiftBic,
            },
        };
        setRecipients(prev => [newRecipient, ...prev]);

        addNotification(NotificationType.SECURITY, 'New Recipient Added', `You added ${newRecipient.fullName} to your recipients list.`, 'recipients');
        
        const {subject, body} = generateNewRecipientEmail(userProfile.name, newRecipient.fullName);
        sendTransactionalEmail(userProfile.email, subject, body);
        
        if (privacySettings.sms.security) {
            sendSmsNotification(userProfile.phone!, generateNewRecipientSms(newRecipient.fullName));
        }
    };
    
    const onUpdateRecipient = (recipientId: string, data: Partial<Recipient>) => {
        setRecipients(prev => prev.map(r => r.id === recipientId ? {...r, ...data} : r));
    };

    const updateCardControls = (cardId: string, updatedControls: Partial<Card['controls']>) => {
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === cardId ? { ...card, controls: { ...card.controls, ...updatedControls } } : card
            )
        );
        const card = cards.find(c => c.id === cardId);
        if (card && updatedControls.isFrozen !== undefined) {
             addNotification(NotificationType.CARD, `Card ${updatedControls.isFrozen ? 'Frozen' : 'Unfrozen'}`, `Your card ending in ${card.lastFour} has been ${updatedControls.isFrozen ? 'frozen' : 'unfrozen'}.`, 'cards');
             const {subject, body} = generateCardStatusEmail(userProfile.name, updatedControls.isFrozen, card.lastFour);
             sendTransactionalEmail(userProfile.email, subject, body);
        }
    };
    
    const addCard = (cardData: Omit<Card, 'id' | 'controls'>) => {
        const newCard: Card = {
            id: `card_${Date.now()}`,
            ...cardData,
            controls: {
                isFrozen: false,
                onlinePurchases: true,
                internationalTransactions: true,
                transactionLimits: { perTransaction: 1000, daily: 2500 },
                blockedCategories: [],
            },
        };
        setCards(prev => [...prev, newCard]);
        addNotification(NotificationType.CARD, 'New Card Added', `A new card ending in ${newCard.lastFour} has been added.`, 'cards');
    };

    const addVirtualCard = (data: { nickname: string; linkedCardId: string; spendingLimit: number | null }) => {
        const newCard: VirtualCard = {
            id: `vc_${Date.now()}`,
            nickname: data.nickname,
            lastFour: String(Math.floor(1000 + Math.random() * 9000)),
            fullNumber: `4111 2222 3333 ${String(Math.floor(1000 + Math.random() * 9000))}`,
            expiryDate: '12/29',
            cvc: String(Math.floor(100 + Math.random() * 900)),
            spendingLimit: data.spendingLimit,
            spentThisMonth: 0,
            lockedToMerchant: null,
            isFrozen: false,
            linkedCardId: data.linkedCardId,
        };
        setVirtualCards(prev => [...prev, newCard]);
        addNotification(NotificationType.CARD, 'Virtual Card Created', `A new virtual card "${data.nickname}" has been created.`, 'cards');
    };

     const updateVirtualCard = (cardId: string, updates: Partial<VirtualCard>) => {
        setVirtualCards(prev => prev.map(vc => vc.id === cardId ? { ...vc, ...updates } : vc));
        const card = virtualCards.find(vc => vc.id === cardId);
        if (card && updates.isFrozen !== undefined) {
            addNotification(NotificationType.CARD, `Virtual Card ${updates.isFrozen ? 'Frozen' : 'Unfrozen'}`, `Your virtual card "${card.nickname}" has been ${updates.isFrozen ? 'frozen' : 'unfrozen'}.`, 'cards');
        }
    };
    
    const addLoanApplication = (application: Omit<LoanApplication, 'id'|'status'|'submittedDate'>) => {
        const newApplication: LoanApplication = {
            ...application,
            id: `loan_${Date.now()}`,
            status: LoanApplicationStatus.PENDING,
            submittedDate: new Date(),
        };
        setLoanApplications(prev => [newApplication, ...prev]);
        
        setTimeout(() => {
            const isApproved = Math.random() > 0.5;
            setLoanApplications(prev => prev.map(app => 
                app.id === newApplication.id ? {...app, status: isApproved ? LoanApplicationStatus.APPROVED : LoanApplicationStatus.REJECTED} : app
            ));
             addNotification(
                NotificationType.LOAN,
                `Loan Application ${isApproved ? 'Approved' : 'Decision'}`,
                `There's an update on your ${application.loanProduct.name} application.`,
                'loans'
            );
        }, 5000 + Math.random() * 5000);
    };

    const onUpdateAdvancedLimits = (newLimits: AdvancedTransferLimits) => {
        setAdvancedTransferLimits(newLimits);
        addNotification(NotificationType.SECURITY, 'Transfer Limits Updated', `Your advanced transfer limits have been modified.`, 'security');
    };
    
    const onVerificationComplete = (level: VerificationLevel) => {
        setVerificationLevel(level);
        if (level === VerificationLevel.LEVEL_3) {
            setShowCongratsOverlay(true);
            setTimeout(() => setShowCongratsOverlay(false), 4000);
        }
    };
    
    const onUpdateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
        setSecuritySettings(prev => ({...prev, ...newSettings}));
    };
    
     const onUpdatePushNotificationSettings = (newSettings: Partial<PushNotificationSettings>) => {
        setPushNotificationSettings(prev => ({...prev, ...newSettings}));
    };

    const onRevokeDevice = (deviceId: string) => {
        const deviceToRevoke = trustedDevices.find(d => d.id === deviceId);
        if (deviceToRevoke) {
            setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
            addNotification(NotificationType.SECURITY, 'Device Revoked', `Access for device ${deviceToRevoke.browser} has been revoked.`);
        }
    };

    const onUpdateProfilePicture = (url: string) => {
        setUserProfile(prev => ({ ...prev, profilePictureUrl: url }));
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cryptoPortfolioValue = useMemo(() => {
        return cryptoHoldings.reduce((total, holding) => {
            const asset = cryptoAssets.find(a => a.id === holding.assetId);
            return total + (asset ? holding.amount * asset.price : 0);
        }, 0);
    }, [cryptoHoldings, cryptoAssets]);
    const portfolioChange24h = useMemo(() => {
         const currentValue = cryptoPortfolioValue;
         const previousValue = cryptoHoldings.reduce((total, holding) => {
            const asset = cryptoAssets.find(a => a.id === holding.assetId);
            if (!asset) return total;
            const previousPrice = asset.price / (1 + asset.change24h / 100);
            return total + (holding.amount * previousPrice);
        }, 0);

        if (previousValue === 0) return 0;
        return ((currentValue - previousValue) / previousValue) * 100;

    }, [cryptoPortfolioValue, cryptoHoldings, cryptoAssets]);
    const totalNetWorth = totalBalance + cryptoPortfolioValue;
    
    const onOpenSendMoneyFlow = (initialTab?: 'send' | 'split' | 'deposit', transactionToRepeat?: Transaction | null) => {
        setSendMoneyFlowState({ isOpen: true, initialTab, transactionToRepeat });
    };

    const onOpenWireTransfer = (initialData: any = null) => {
        setWireTransferInitialData(initialData);
        setIsWireTransferOpen(true);
    };

    const onContactSupport = (transactionId?: string) => {
        setInitialSupportTxId(transactionId);
        setIsContactSupportOpen(true);
    };

    const onAuthorizeTransaction = (transactionId: string, method: 'code' | 'fee') => {
        const tx = transactions.find(t => t.id === transactionId);
        if (!tx) return;

        if (method === 'fee') {
            const fee = tx.sendAmount * 0.15;
            setAccounts(prev => prev.map(acc => acc.id === tx.accountId ? { ...acc, balance: acc.balance - fee } : acc));
            setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, clearanceFeePaid: true } : t));
        }

        setTransactions(prev => prev.map(t => t.id === transactionId ? {
            ...t,
            status: TransactionStatus.CLEARANCE_GRANTED,
            statusTimestamps: {
                ...t.statusTimestamps,
                [TransactionStatus.CLEARANCE_GRANTED]: new Date(),
            },
            requiresAuth: false,
            reviewed: true,
        } : t));
    };

    const onDepositCheck = (details: { amount: number, accountId: string, images: { front: string, back: string } }) => {
        const newTransaction: Transaction = {
            id: `txn_cheque_${Date.now()}`,
            accountId: details.accountId,
            recipient: SELF_RECIPIENT, 
            sendAmount: details.amount,
            receiveAmount: details.amount,
            fee: 0,
            exchangeRate: 1,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + 86400000 * 2), 
            statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
            description: `Mobile Cheque Deposit`,
            type: 'credit',
            chequeDetails: {
                images: details.images
            }
        };

        setTransactions(prev => [newTransaction, ...prev]);

        setTimeout(() => {
             setAccounts(prev => prev.map(acc =>
                acc.id === details.accountId ? { ...acc, balance: acc.balance + details.amount } : acc
            ));
             setTransactions(prev => prev.map(t =>
                t.id === newTransaction.id ? { ...t, status: TransactionStatus.FUNDS_ARRIVED } : t
            ));
             addNotification(NotificationType.ACCOUNT, 'Deposit Successful', `Your deposit of ${details.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} has been processed.`, 'accounts');
        }, 5000);

        setSendMoneyFlowState({ isOpen: false });
    };

    const onSplitTransaction = (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }) => {
         const sourceAccount = accounts.find(acc => acc.id === details.sourceAccountId);
         if (!sourceAccount || sourceAccount.balance < details.totalAmount) {
            addNotification(NotificationType.TRANSACTION, 'Split Failed', 'Insufficient funds for the total split amount.', 'send');
            return false;
         }

         setAccounts(prev => prev.map(acc => acc.id === details.sourceAccountId ? {...acc, balance: acc.balance - details.totalAmount} : acc));

         details.splits.forEach(split => {
            const exchangeRate = EXCHANGE_RATES[split.recipient.country.currency] || 1;
            const newTransaction: Transaction = {
                id: `txn_split_${Date.now()}_${split.recipient.id}`,
                accountId: details.sourceAccountId,
                recipient: split.recipient,
                sendAmount: split.amount,
                receiveAmount: split.amount * exchangeRate,
                fee: 0,
                exchangeRate: exchangeRate,
                status: TransactionStatus.SUBMITTED,
                estimatedArrival: new Date(Date.now() + 86400000 * 3),
                statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
                description: `Split payment to ${split.recipient.fullName}`,
                type: 'debit',
                purpose: details.purpose,
                splitGroupId: `split_${Date.now()}`,
            };
            setTransactions(prev => [newTransaction, ...prev]);
        });
        
        addNotification(NotificationType.TRANSACTION, 'Split Sent', `You sent a split payment to ${details.splits.length} recipients.`, 'history');
        return true;
    };
    
    const onLinkAccount = (bankName: string, accountName: string, lastFour: string) => {
        const newAccount: Account = {
            id: `acc_ext_${Date.now()}`,
            type: AccountType.EXTERNAL_LINKED,
            nickname: `${bankName} (${lastFour})`,
            accountNumber: `**** ${lastFour}`,
            balance: 0,
            features: ['ACH Transfers'],
        };
        setAccounts(prev => [...prev, newAccount]);
        addNotification(NotificationType.ACCOUNT, 'Account Linked', `You successfully linked your ${bankName} account.`, 'accounts');
    };
    
    const onCreateAccountSuccess = (formData: any) => {
        const newUserProfile: UserProfile = {
            ...NEW_USER_PROFILE_TEMPLATE,
            name: formData.fullName,
            email: formData.email,
            // FIX: Cast formData.phone to string to resolve type error with sendSmsNotification.
            phone: formData.phone as string,
        };
        setUserProfile(newUserProfile);
        setAccounts(NEW_USER_ACCOUNTS_TEMPLATE.map(acc => ({...acc, id: `acc_new_${Math.random()}`, fullAccountNumber: String(Math.random()) })));
        setIsNewAccountLogin(true);
        setAuthStatus('loggedIn');

        const accountsForEmail = NEW_USER_ACCOUNTS_TEMPLATE.map(acc => ({
          type: acc.type,
          number: acc.accountNumber,
        }));
        const { subject, body } = generateFullWelcomeEmail(newUserProfile.name, accountsForEmail);
        sendTransactionalEmail(newUserProfile.email, subject, body);
        sendSmsNotification(newUserProfile.phone!, generateFullWelcomeSms(newUserProfile.name));
    };

    useEffect(() => {
        const handleNewUserPostLogin = () => {
            if (isNewAccountLogin) {
                setTimeout(() => {
                    setAccounts(prev => prev.map(acc => ({...acc, status: 'Active', accountNumber: `**** ${Math.floor(1000 + Math.random() * 9000)}`})));
                    addNotification(NotificationType.ACCOUNT, 'Accounts Activated', 'Your new accounts are now active and ready to use!', 'accounts');
                }, 5000); 
                setIsNewAccountLogin(false);
            }
        };

        if (authStatus === 'loggedIn') {
            handleNewUserPostLogin();
        }
    }, [authStatus, isNewAccountLogin, addNotification]);

    const onSendWire = (data: any): Transaction | null => {
         const sourceAccount = accounts.find(acc => acc.id === data.sourceAccountId);
         const isInternational = data.transferType === 'international';
         const fee = isInternational ? INTERNATIONAL_WIRE_FEE : DOMESTIC_WIRE_FEE;
         const amount = parseFloat(data.amount);
         const totalCost = amount + fee;

         if (!sourceAccount || sourceAccount.balance < totalCost) {
             addNotification(NotificationType.TRANSACTION, 'Wire Failed', 'Insufficient funds for this wire transfer.', 'wire');
             return null;
         }

         setAccounts(prev => prev.map(acc => acc.id === data.sourceAccountId ? { ...acc, balance: acc.balance - totalCost } : acc));
         
         const newTransaction: Transaction = {
            id: `wire_${Date.now()}`,
            accountId: data.sourceAccountId,
            recipient: {
                id: `rec_wire_${Date.now()}`,
                fullName: data.recipientName,
                bankName: data.bankName,
                accountNumber: `**** ${data.accountNumber.slice(-4)}`,
                country: data.recipientCountry,
                deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: false },
                realDetails: { accountNumber: data.accountNumber, swiftBic: data.swiftBic || data.routingNumber }
            },
            sendAmount: amount,
            receiveAmount: amount * (EXCHANGE_RATES[data.recipientCountry.currency] || 1),
            fee: fee,
            exchangeRate: EXCHANGE_RATES[data.recipientCountry.currency] || 1,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + (isInternational ? 86400000 * 4 : 86400000)),
            statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
            description: `Wire transfer to ${data.recipientName}`,
            type: 'debit',
            transferMethod: 'wire',
         };
         setTransactions(prev => [newTransaction, ...prev]);
         addNotification(NotificationType.TRANSACTION, 'Wire Transfer Sent', `Your wire of ${amount.toLocaleString('en-US', {style:'currency', currency:'USD'})} has been sent.`, 'history');
         return newTransaction;
    };
    
    if (authStatus === 'intro') {
        return <AdvancedFirstPage onComplete={() => setAuthStatus('initializing')} />;
    }
    if (authStatus === 'initializing') {
        return <OpeningSequence onComplete={() => setAuthStatus(savedSession ? 'locked' : 'auth')} />;
    }
    if (authStatus === 'auth') {
        return <Welcome onLogin={() => {
            setAuthStatus('loggedIn');
            addNotification(NotificationType.SECURITY, "Successful Login", "You have successfully logged into your account.");
            const { subject, body } = generateLoginAlertEmail(userProfile.name);
            sendTransactionalEmail(userProfile.email, subject, body);
            sendSmsNotification(userProfile.phone!, generateLoginAlertSms());
            if (savedSession) setIsResumeModalOpen(true);
        }} onStartCreateAccount={() => setAuthStatus('creatingAccount')} />;
    }
    if (authStatus === 'locked') {
        return <ProfileSignIn user={userProfile} onEnterDashboard={() => setAuthStatus('auth')} />;
    }
    if(authStatus === 'creatingAccount') {
        return <AccountCreationFlow onBackToLogin={() => setAuthStatus('auth')} onCreateAccountSuccess={onCreateAccountSuccess} />;
    }
    if (isLoggingOut) {
        return <LoggingOut onComplete={() => {}} />;
    }

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard 
                accounts={accounts} 
                transactions={transactions} 
                setActiveView={setActiveView} 
                recipients={recipients}
                createTransaction={createTransaction}
                cryptoPortfolioValue={cryptoPortfolioValue}
                portfolioChange24h={portfolioChange24h}
                travelPlans={travelPlans}
                totalNetWorth={totalNetWorth}
                balanceDisplayMode={balanceDisplayMode}
                userProfile={userProfile}
                onOpenSendMoneyFlow={onOpenSendMoneyFlow}
            />;
            case 'recipients': return <Recipients recipients={recipients} addRecipient={addRecipient} onUpdateRecipient={onUpdateRecipient} />;
            case 'history': return <ActivityLog transactions={transactions} onUpdateTransactions={() => {}} onRepeatTransaction={(tx) => onOpenSendMoneyFlow('send', tx)} onAuthorizeTransaction={onAuthorizeTransaction} accounts={accounts} onContactSupport={onContactSupport} />;
            case 'security': return <Security 
                advancedTransferLimits={advancedTransferLimits} 
                onUpdateAdvancedLimits={onUpdateAdvancedLimits}
                cards={cards}
                onUpdateCardControls={updateCardControls}
                verificationLevel={verificationLevel}
                onVerificationComplete={onVerificationComplete}
                securitySettings={securitySettings}
                onUpdateSecuritySettings={onUpdateSecuritySettings}
                trustedDevices={trustedDevices}
                onRevokeDevice={onRevokeDevice}
                onChangePassword={() => setIsChangePasswordModalOpen(true)}
                transactions={transactions}
                pushNotificationSettings={pushNotificationSettings}
                onUpdatePushNotificationSettings={onUpdatePushNotificationSettings}
                privacySettings={privacySettings}
                onUpdatePrivacySettings={handleUpdatePrivacySettings}
                userProfile={userProfile}
                onUpdateProfilePicture={onUpdateProfilePicture}
            />;
            case 'privacy': return <PrivacyCenter settings={privacySettings} onUpdateSettings={handleUpdatePrivacySettings} />;
            case 'cards': return <CardManagement 
                cards={cards}
                virtualCards={virtualCards}
                onUpdateVirtualCard={updateVirtualCard}
                cardTransactions={cardTransactions}
                onUpdateCardControls={updateCardControls}
                onAddCard={addCard}
                onAddVirtualCard={addVirtualCard}
                accountBalance={totalBalance}
                onAddFunds={(amount, cardLastFour, cardNetwork) => {
                    const newTx: Transaction = {
                        id: `dep_${Date.now()}`,
                        accountId: accounts[0].id,
                        recipient: SELF_RECIPIENT,
                        sendAmount: amount,
                        receiveAmount: amount,
                        fee: 0,
                        exchangeRate: 1,
                        status: TransactionStatus.FUNDS_ARRIVED,
                        estimatedArrival: new Date(),
                        statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date(), [TransactionStatus.FUNDS_ARRIVED]: new Date() },
                        description: `Deposit from ${cardNetwork} **** ${cardLastFour}`,
                        type: 'credit',
                    };
                    setTransactions(prev => [newTx, ...prev]);
                    setAccounts(prev => prev.map(acc => acc.id === accounts[0].id ? {...acc, balance: acc.balance + amount} : acc));
                }}
            />;
            case 'loans': return <Loans loanApplications={loanApplications} addLoanApplication={addLoanApplication} addNotification={addNotification} />;
            case 'insurance': return <Insurance addNotification={addNotification} />;
            case 'support': return <Support />;
            case 'accounts': return <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={(accountId, nickname) => setAccounts(prev => prev.map(acc => acc.id === accountId ? {...acc, nickname} : acc))} />;
            case 'crypto': return <CryptoDashboard 
                cryptoAssets={cryptoAssets} 
                setCryptoAssets={setCryptoAssets}
                holdings={cryptoHoldings} 
                checkingAccount={accounts.find(a => a.type === AccountType.CHECKING)}
                onBuy={(assetId, usdAmount, assetPrice) => {
                    const sourceAccount = accounts.find(a => a.type === AccountType.CHECKING);
                    if (!sourceAccount || sourceAccount.balance < usdAmount) return false;
                    setAccounts(prev => prev.map(a => a.id === sourceAccount.id ? {...a, balance: a.balance - usdAmount} : a));
                    setCryptoHoldings(prev => {
                        const existing = prev.find(h => h.assetId === assetId);
                        const cryptoAmount = usdAmount / assetPrice;
                        if (existing) {
                            const totalAmount = existing.amount + cryptoAmount;
                            const totalCost = (existing.avgBuyPrice * existing.amount) + usdAmount;
                            return prev.map(h => h.assetId === assetId ? {...h, amount: totalAmount, avgBuyPrice: totalCost / totalAmount} : h);
                        }
                        return [...prev, { assetId, amount: cryptoAmount, avgBuyPrice: assetPrice }];
                    });
                    return true;
                }}
                onSell={(assetId, cryptoAmount, assetPrice) => {
                    const sourceAccount = accounts.find(a => a.type === AccountType.CHECKING);
                    const holding = cryptoHoldings.find(h => h.assetId === assetId);
                    if (!sourceAccount || !holding || holding.amount < cryptoAmount) return false;
                    
                    const usdAmount = cryptoAmount * assetPrice;
                    setAccounts(prev => prev.map(a => a.id === sourceAccount.id ? {...a, balance: a.balance + usdAmount} : a));
                    setCryptoHoldings(prev => prev.map(h => h.assetId === assetId ? {...h, amount: h.amount - cryptoAmount} : h).filter(h => h.amount > 0.000001));
                    return true;
                }}
            />;
            case 'services': return <ServicesDashboard 
                subscriptions={subscriptions} 
                appleCardDetails={appleCardDetails}
                appleCardTransactions={appleCardTransactions}
                onPaySubscription={(subId) => {
                    const sub = subscriptions.find(s => s.id === subId);
                    const acc = accounts.find(a => a.balance >= (sub?.amount || 0));
                    if (!sub || !acc) return false;
                    setAccounts(prev => prev.map(a => a.id === acc.id ? {...a, balance: a.balance - sub.amount} : a));
                    setSubscriptions(prev => prev.map(s => s.id === subId ? {...s, isPaid: true} : s));
                    return true;
                }}
                onUpdateSpendingLimits={(limits: SpendingLimit[]) => setAppleCardDetails(prev => ({...prev, spendingLimits: limits}))}
                onUpdateTransactionCategory={(txId, category) => setAppleCardTransactions(prev => prev.map(tx => tx.id === txId ? {...tx, category} : tx))}
            />;
            case 'checkin': return <TravelCheckIn travelPlans={travelPlans} addTravelPlan={(country, startDate, endDate) => {
                const newPlan: TravelPlan = { id: `travel_${Date.now()}`, country, startDate, endDate, status: startDate > new Date() ? TravelPlanStatus.UPCOMING : TravelPlanStatus.ACTIVE };
                setTravelPlans(prev => [...prev, newPlan]);
            }}/>;
            case 'platform': return <PlatformFeatures settings={platformSettings} onUpdateSettings={(s) => setPlatformSettings(prev => ({...prev, ...s}))} />;
            case 'tasks': return <Tasks 
                tasks={tasks} 
                addTask={(text, dueDate) => setTasks(prev => [...prev, {id: `task_${Date.now()}`, text, completed: false, dueDate}])}
                toggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))}
                deleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
            />;
            case 'flights': return <Flights 
                bookings={flightBookings}
                onBookFlight={(booking, sourceAccountId) => {
                    const acc = accounts.find(a => a.id === sourceAccountId);
                    if (!acc || acc.balance < booking.totalPrice) return false;
                    setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - booking.totalPrice} : a));
                    setFlightBookings(prev => [...prev, { ...booking, id: `booking_${Date.now()}`, bookingDate: new Date(), status: 'Confirmed' }]);
                    return true;
                }}
                accounts={accounts}
                setActiveView={setActiveView}
            />;
            case 'utilities': return <Utilities 
                bills={utilityBills}
                billers={utilityBillers}
                onPayBill={(billId, sourceAccountId) => {
                    const bill = utilityBills.find(b => b.id === billId);
                    const acc = accounts.find(a => a.id === sourceAccountId);
                    if (!bill || !acc || acc.balance < bill.amount) return false;
                    setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - bill.amount} : a));
                    setUtilityBills(prev => prev.map(b => b.id === billId ? {...b, isPaid: true} : b));
                    return true;
                }}
                accounts={accounts}
                setActiveView={setActiveView}
            />;
            case 'integrations': return <Integrations 
                linkedServices={linkedServices}
                onLinkService={(serviceName, identifier) => setLinkedServices(prev => ({...prev, [serviceName]: identifier}))}
            />;
            case 'advisor': return <FinancialAdvisor 
                analysis={financialAnalysis}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
                runFinancialAnalysis={async () => {
                    setIsAnalyzing(true);
                    setAnalysisError(false);
                    const result = await getFinancialAnalysis(JSON.stringify({accounts, transactions, cryptoHoldings}));
                    if (result.isError) {
                        setAnalysisError(true);
                    } else {
                        setFinancialAnalysis(result.analysis);
                    }
                    setIsAnalyzing(false);
                }}
                setActiveView={setActiveView}
            />;
            case 'invest': return <Investments />;
            case 'atmLocator': return <AtmLocator />;
            case 'quickteller': return <Quickteller 
                airtimeProviders={airtimeProviders}
                purchases={airtimePurchases}
                accounts={accounts}
                onPurchase={(providerId, phoneNumber, amount, accountId) => {
                    const acc = accounts.find(a => a.id === accountId);
                    if (!acc || acc.balance < amount) return false;
                    setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance - amount} : a));
                    setAirtimePurchases(prev => [{id: `air_${Date.now()}`, providerId, phoneNumber, amount, purchaseDate: new Date()}, ...prev]);
                    return true;
                }}
                setActiveView={setActiveView}
            />;
            case 'qrScanner': return <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />;
            case 'about': return <About />;
            case 'contact': return <Contact setActiveView={setActiveView} />;
            case 'wallet': return <DigitalWallet wallet={walletDetails} />;
            case 'ratings': return <Ratings />;
            case 'globalAid': return <GlobalAid 
                donations={donations}
                accounts={accounts}
                onDonate={(causeId, amount, sourceAccountId) => {
                    const acc = accounts.find(a => a.id === sourceAccountId);
                    if (!acc || acc.balance < amount) return false;
                    setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - amount} : a));
                    setDonations(prev => [...prev, {id: `don_${Date.now()}`, causeId, amount, date: new Date()}]);
                    return true;
                }}
            />;
            case 'network': return <GlobalBankingNetwork onOpenWireTransfer={onOpenWireTransfer} setActiveView={setActiveView} />;
            default: return <Dashboard 
                accounts={accounts} 
                transactions={transactions} 
                setActiveView={setActiveView}
                recipients={recipients}
                createTransaction={createTransaction}
                cryptoPortfolioValue={cryptoPortfolioValue}
                portfolioChange24h={portfolioChange24h}
                travelPlans={travelPlans}
                totalNetWorth={totalNetWorth}
                balanceDisplayMode={balanceDisplayMode}
                userProfile={userProfile}
                onOpenSendMoneyFlow={onOpenSendMoneyFlow}
            />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-800">
            {showCongratsOverlay && <CongratulationsOverlay />}
            {pushNotification && <PushNotificationToast notification={pushNotification} onClose={() => setPushNotification(null)} />}
            {isResumeModalOpen && savedSession && <ResumeSessionModal session={savedSession} onResume={handleResume} onStartFresh={handleStartFresh} />}
            {isLogoutModalOpen && <LogoutConfirmationModal onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />}
            {showInactivityModal && <InactivityModal onLogout={handleLogout} onStayLoggedIn={resetInactivityTimer} countdownStart={INACTIVITY_MODAL_COUNTDOWN} />}
            {sendMoneyFlowState.isOpen && <SendMoneyFlow 
                onClose={() => setSendMoneyFlowState({ isOpen: false })} 
                recipients={recipients} 
                accounts={accounts} 
                createTransaction={createTransaction}
                transactions={transactions}
                securitySettings={securitySettings}
                hapticsEnabled={platformSettings.hapticsEnabled}
                onAuthorizeTransaction={onAuthorizeTransaction}
                setActiveView={setActiveView}
                onLinkAccount={() => setIsLinkAccountModalOpen(true)}
                onDepositCheck={onDepositCheck}
                onSplitTransaction={onSplitTransaction}
                initialTab={sendMoneyFlowState.initialTab}
                transactionToRepeat={sendMoneyFlowState.transactionToRepeat}
                userProfile={userProfile}
                onContactSupport={onContactSupport}
            />}
            {isWireTransferOpen && <WireTransfer accounts={accounts} recipients={recipients} onSendWire={onSendWire} onClose={() => setIsWireTransferOpen(false)} initialData={wireTransferInitialData} />}
            {isLinkAccountModalOpen && <LinkBankAccountModal onClose={() => setIsLinkAccountModalOpen(false)} onLinkSuccess={onLinkAccount} />}
            {isChangePasswordModalOpen && <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} onSuccess={() => addNotification(NotificationType.SECURITY, "Password Changed", "Your password was successfully updated.")}/>}
            {isContactSupportOpen && <ContactSupportModal onClose={() => setIsContactSupportOpen(false)} onSubmit={async (data) => {
                const ticketId = `CS${Date.now()}`;
                addNotification(NotificationType.SUPPORT, "Support Ticket Created", `Your request (ID: ${ticketId}) has been received.`);
                const { subject, body } = generateSupportTicketConfirmationEmail(userProfile.name, ticketId, data.topic);
                sendTransactionalEmail(userProfile.email, subject, body);
                sendSmsNotification(userProfile.phone!, generateSupportTicketConfirmationSms(ticketId));
            }} transactions={transactions} initialTransactionId={initialSupportTxId} />}
            {isLanguageSelectorOpen && <LanguageSelector onClose={() => setIsLanguageSelectorOpen(false)} />}
            {legalModalContent && <LegalModal title={legalModalContent.title} content={legalModalContent.content} onClose={() => setLegalModalContent(null)} />}

            <DynamicIslandSimulator transaction={transactions.find(t => t.status !== TransactionStatus.FUNDS_ARRIVED && t.status !== TransactionStatus.FLAGGED_AWAITING_CLEARANCE) || null} />

            <div className="flex">
                <main className="flex-1 bg-slate-900">
                    <Header 
                        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
                        isMenuOpen={isMenuOpen}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        onLogout={() => setIsLogoutModalOpen(true)}
                        notifications={notifications}
                        onMarkNotificationsAsRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                        onNotificationClick={(view) => {
                            setActiveView(view);
                        }}
                        userProfile={userProfile}
                        onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
                        onOpenSendMoneyFlow={onOpenSendMoneyFlow}
                        onOpenWireTransfer={onOpenWireTransfer}
                    />
                    <div className="p-4 sm:p-6 lg:p-8 bg-slate-100 min-h-[calc(100vh-80px)]">
                        {renderView()}
                    </div>
                     <Footer setActiveView={setActiveView} onOpenSendMoneyFlow={onOpenSendMoneyFlow} openLegalModal={openLegalModal} />
                </main>
            </div>
            <BankingChat />
        </div>
    );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
