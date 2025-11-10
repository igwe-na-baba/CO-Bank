// FIX: Import `useRef` from React to resolve 'Cannot find name' errors.
// FIX: Import `useMemo` from React to resolve 'useMemo is not defined' error.
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { Recipients } from './components/Recipients';
import { Transaction, Recipient, TransactionStatus, Card, CardTransaction, Notification, NotificationType, LoanApplication, LoanApplicationStatus, Account, VerificationLevel, CryptoHolding, CryptoAsset, SubscriptionService, AppleCardDetails, AppleCardTransaction, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, View, Task, FlightBooking, UtilityBill, UtilityBiller, AdvisorResponse, BalanceDisplayMode, AccountType, AirtimePurchase, PushNotification, PushNotificationSettings, SavedSession, VirtualCard, Donation, PrivacySettings } from './types';
// FIX: Added INITIAL_WALLET_DETAILS to imports to resolve "Cannot find name" error.
import { INITIAL_RECIPIENTS, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_CARD_TRANSACTIONS, INITIAL_ADVANCED_TRANSFER_LIMITS, INITIAL_ACCOUNTS, getInitialCryptoAssets, INITIAL_CRYPTO_HOLDINGS, CRYPTO_TRADE_FEE_PERCENT, INITIAL_SUBSCRIPTIONS, INITIAL_APPLE_CARD_DETAILS, INITIAL_APPLE_CARD_TRANSACTIONS, INITIAL_TRAVEL_PLANS, INITIAL_SECURITY_SETTINGS, INITIAL_TRUSTED_DEVICES, USER_PROFILE, INITIAL_PLATFORM_SETTINGS, THEME_COLORS, INITIAL_TASKS, INITIAL_FLIGHT_BOOKINGS, INITIAL_UTILITY_BILLS, getUtilityBillers, getAirtimeProviders, INITIAL_AIRTIME_PURCHASES, INITIAL_PUSH_SETTINGS, EXCHANGE_RATES, NEW_USER_PROFILE_TEMPLATE, NEW_USER_ACCOUNTS_TEMPLATE, INITIAL_VIRTUAL_CARDS, DOMESTIC_WIRE_FEE, INTERNATIONAL_WIRE_FEE, INITIAL_WALLET_DETAILS } from './constants';
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
// FIX: Corrected import path casing from './components/tasks' to './components/Tasks' to resolve module resolution ambiguity.
import { Tasks } from './components/Tasks';
import { Flights } from './components/Flights';
import { Utilities } from './components/Utilities';
import { Integrations } from './components/Integrations';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import { LanguageProvider } from './contexts/LanguageContext';
import * as geminiService from './services/geminiService';
import * as notificationService from './services/notificationService';
import { CongratulationsOverlay } from './components/CongratulationsOverlay';
import { PushApprovalModal } from './components/PushApprovalModal';
import { DynamicIslandSimulator } from './components/DynamicIslandSimulator';
import { PostLoginSecurityCheck } from './components/PostLoginSecurityCheck';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LinkBankAccountModal } from './components/LinkBankAccountModal';
import { WireTransfer } from './components/WireTransfer';
import { AtmLocator } from './components/AtmLocator';
import { Quickteller } from './components/Quickteller';
import { QrScanner } from './components/QrScanner';
import { PrivacyCenter } from './components/PrivacyCenter';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { LegalModal } from './components/LegalModal';
import { DigitalWallet } from './components/DigitalWallet';
import { Ratings } from './components/Ratings';
import { GlobalAid } from './components/GlobalAid';
import { GlobalBankingNetwork } from './components/GlobalBankingNetwork';
import { LiveBankingAssistant } from './components/LiveBankingAssistant';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AccountCreationFlow } from './components/AccountCreationFlow';
import { LoggingOut } from './components/LoggingOut';
import { AdvancedFirstPage } from './components/AdvancedFirstPage';
import { Investments } from './components/Investments';
import { Footer } from './components/Footer';
import { PushNotificationToast } from './components/PushNotificationToast';
import { ResumeSessionModal } from './components/ResumeSessionModal';
import { Insurance } from './components/Insurance';

const getNextStatusForAutoProgress = (tx: Transaction): { nextStatus: TransactionStatus, fireNotification: boolean } | null => {
    // This transaction should not be auto-progressed if it's already complete or explicitly flagged.
    if (tx.status === TransactionStatus.FUNDS_ARRIVED || tx.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE || tx.status === TransactionStatus.IN_TRANSIT) {
        return null;
    }

    const now = new Date().getTime();
    // A transaction must have a SUBMITTED timestamp to be processed.
    if (!tx.statusTimestamps[TransactionStatus.SUBMITTED]) {
        return null;
    }
    const submittedAt = tx.statusTimestamps[TransactionStatus.SUBMITTED].getTime();

    switch (tx.status) {
        case TransactionStatus.SUBMITTED:
            if (now - submittedAt > 2000) return { nextStatus: TransactionStatus.CONVERTING, fireNotification: false };
            break;
        case TransactionStatus.CONVERTING:
            if (now - submittedAt > 5000) return { nextStatus: TransactionStatus.IN_TRANSIT, fireNotification: false };
            break;
    }
    return null;
};


const AppContent: React.FC = () => {
    // Authentication & Session State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [isPostLoginCheck, setIsPostLoginCheck] = useState(false);
    const [showCreateAccountFlow, setShowCreateAccountFlow] = useState(false);
    const [showAdvancedFirstPage, setShowAdvancedFirstPage] = useState(true);
    const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
    const [showResumeSessionModal, setShowResumeSessionModal] = useState(false);

    // UI State
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSendMoneyFlow, setShowSendMoneyFlow] = useState(false);
    const [sendMoneyFlowInitialTab, setSendMoneyFlowInitialTab] = useState<'send' | 'split' | 'deposit' | undefined>(undefined);
    const [showWireTransfer, setShowWireTransfer] = useState(false);
    const [wireTransferInitialData, setWireTransferInitialData] = useState<any>(null);
    const [showCongratulations, setShowCongratulations] = useState(false);
    const [showPushApproval, setShowPushApproval] = useState(false);
    const [transactionForPushApproval] = useState<string | null>(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
    const [showContactSupportModal, setShowContactSupportModal] = useState(false);
    const [contactSupportInitialTxId, setContactSupportInitialTxId] = useState<string | undefined>(undefined);
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalModalContent, setLegalModalContent] = useState({ title: '', content: '' });
    
    // Data State
    const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);
    const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
    const [recipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
    const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
    const [cardTransactions] = useState<CardTransaction[]>(INITIAL_CARD_TRANSACTIONS);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(() => getInitialCryptoAssets(Icons));
    const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
    const [subscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
    const [appleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
    const [appleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
    const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
    const [trustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [flightBookings, setFlightBookings] = useState<FlightBooking[]>(INITIAL_FLIGHT_BOOKINGS);
    const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
    const [utilityBillers] = useState<UtilityBiller[]>(() => getUtilityBillers(Icons));
    const [airtimeProviders] = useState(() => getAirtimeProviders(Icons));
    const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
    const [pushNotificationSettings, setPushNotificationSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        ads: true, sharing: true,
        email: { transactions: true, security: true, promotions: false },
        sms: { transactions: true, security: true, promotions: false },
    });
    const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.LEVEL_2);
    const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(false);
    const [balanceDisplayMode] = useState<BalanceDisplayMode>('global');
    const [donations, setDonations] = useState<Donation[]>([]);
    const [linkedServices, setLinkedServices] = useState<Record<string, string>>({ 'PayPal': 'randy.m.c@example.com' });
    const [transactionToRepeat, setTransactionToRepeat] = useState<Transaction | null>(null);
    
    useEffect(() => {
        // Apply theme mode
        if (platformSettings.themeMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply accent color
        const root = document.documentElement;
        const colors = THEME_COLORS[platformSettings.theme];
        for (const [key, value] of Object.entries(colors)) {
            root.style.setProperty(`--color-primary-${key}`, value);
        }
    }, [platformSettings.themeMode, platformSettings.theme]);

    // Handlers
    const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
        const newNotification: Notification = { id: `notif_${Date.now()}`, type, title, message, timestamp: new Date(), read: false, linkTo };
        setNotifications(prev => [newNotification, ...prev]);
        
        const newPush: PushNotification = { id: newNotification.id, type, title, message };
        setPushNotifications(prev => [newPush, ...prev]);
    }, []);

    const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>): Promise<Transaction | null> => {
        const sourceAccount = accounts.find(a => a.id === data.accountId);
        if (!sourceAccount || sourceAccount.balance < (data.sendAmount + data.fee)) {
            console.error("Insufficient funds or account not found.");
            return Promise.resolve(null);
        }

        const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            ...data,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + 86400000 * (data.deliverySpeed === 'Express' ? 1 : 3)),
            statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
            type: 'debit',
            reviewed: false,
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setAccounts(prev => prev.map(acc => acc.id === data.accountId ? { ...acc, balance: acc.balance - (data.sendAmount + data.fee) } : acc));
        if(userProfile.phone) {
            notificationService.sendSmsNotification(userProfile.phone, notificationService.generateTransactionReceiptSms(newTransaction));
        }
        const {subject, body} = notificationService.generateTransactionReceiptEmail(newTransaction, userProfile.name);
        notificationService.sendTransactionalEmail(userProfile.email, subject, body);
        addNotification(NotificationType.TRANSACTION, 'Transfer Sent', `Your transfer of ${data.sendAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})} to ${data.recipient.fullName} has been submitted.`);
        
        return Promise.resolve(newTransaction);
    }, [accounts, userProfile.name, userProfile.email, userProfile.phone, addNotification]);
    
    const onSendWire = async (data: any): Promise<Transaction | null> => {
        const sourceAccount = accounts.find(a => a.id === data.sourceAccountId);
        const amount = parseFloat(data.amount) || 0;
        const fee = data.transferType === 'international' ? INTERNATIONAL_WIRE_FEE : DOMESTIC_WIRE_FEE;

        if (!sourceAccount || sourceAccount.balance < (amount + fee)) {
            return Promise.resolve(null);
        }

        const recipient: Recipient = {
            id: `rec_wire_${Date.now()}`,
            fullName: data.recipientName,
            bankName: data.bankName,
            accountNumber: `••••${data.accountNumber.slice(-4)}`,
            country: data.recipientCountry,
            streetAddress: data.recipientAddress,
            city: data.recipientCity,
            deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: false },
            realDetails: { accountNumber: data.accountNumber, swiftBic: data.swiftBic || data.routingNumber }
        };

        const tx: Transaction = {
            id: `wire_${Date.now()}`,
            accountId: data.sourceAccountId,
            recipient: recipient,
            sendAmount: amount,
            receiveAmount: amount * (EXCHANGE_RATES[recipient.country.currency as keyof typeof EXCHANGE_RATES] || 1),
            fee: fee,
            exchangeRate: EXCHANGE_RATES[recipient.country.currency as keyof typeof EXCHANGE_RATES] || 1,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + 86400000 * 5),
            transferMethod: 'wire',
            statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
            description: `Wire to ${recipient.fullName}`,
            type: 'debit',
        };

        setTransactions(prev => [tx, ...prev]);
        setAccounts(prev => prev.map(acc => acc.id === data.sourceAccountId ? { ...acc, balance: acc.balance - (amount + fee) } : acc));
        
        return Promise.resolve(tx);
    };

    const handleAuthorizeTransaction = useCallback((transactionId: string, method: 'code' | 'fee') => {
        setShowCongratulations(true);
        setTimeout(() => setShowCongratulations(false), 4000);
    
        const progressTransaction = (txId: string) => {
            setTransactions(prevTxs => {
                const txIndex = prevTxs.findIndex(t => t.id === txId && t.status === TransactionStatus.IN_TRANSIT);
                if (txIndex === -1) return prevTxs;
                
                const newTxs = [...prevTxs];
                const updatedTx = {
                    ...newTxs[txIndex],
                    status: TransactionStatus.FUNDS_ARRIVED,
                    statusTimestamps: {
                        ...newTxs[txIndex].statusTimestamps,
                        [TransactionStatus.FUNDS_ARRIVED]: new Date(),
                    }
                };
                newTxs[txIndex] = updatedTx;
                
                addNotification(NotificationType.TRANSACTION, 'Transfer Completed', `Your transfer to ${updatedTx.recipient.fullName} has been delivered.`);
    
                return newTxs;
            });
        };
    
        if (method === 'fee') {
            setTransactions(prev => {
                const txIndex = prev.findIndex(t => t.id === transactionId);
                if (txIndex === -1) return prev;
                
                const newTransactions = [...prev];
                const updatedTx = { ...newTransactions[txIndex] };
        
                updatedTx.clearanceFeePaid = true;
                const feeAmount = updatedTx.sendAmount * 0.15;
                setAccounts(accs => accs.map(acc => 
                    acc.id === updatedTx.accountId ? { ...acc, balance: acc.balance - feeAmount } : acc
                ));
                
                newTransactions[txIndex] = updatedTx;
                return newTransactions;
            });
        }
        
        setTimeout(() => progressTransaction(transactionId), 2000);
    }, [addNotification]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTransactions(prevTxs => {
                let hasChanges = false;
                const newTxs = prevTxs.map(tx => {
                    const progress = getNextStatusForAutoProgress(tx);
                    if (progress) {
                        hasChanges = true;
                        if (progress.fireNotification) {
                            addNotification(NotificationType.TRANSACTION, 'Transfer Completed', `Your transfer to ${tx.recipient.fullName} has been delivered.`);
                        }
                        return {
                            ...tx,
                            status: progress.nextStatus,
                            statusTimestamps: {
                                ...tx.statusTimestamps,
                                [progress.nextStatus]: new Date(),
                            }
                        };
                    }
                    return tx;
                });
                return hasChanges ? newTxs : prevTxs;
            });
        }, 1000);
    
        return () => clearInterval(interval);
    }, [addNotification]);

    // ... many more handlers would go here ...

    // Authentication
    const handleLogin = () => { setIsPostLoginCheck(true); };
    const handleLogout = () => { setShowLogoutModal(false); setIsLoggingOut(true); };

    const handlePostLoginComplete = () => {
        setIsPostLoginCheck(false);
        setIsLoggedIn(true);

        const storedSession = localStorage.getItem('icu_session');
        if (storedSession) {
            const parsedSession: SavedSession = JSON.parse(storedSession);
            // Resume if session is less than 30 minutes old
            if (Date.now() - parsedSession.timestamp < 30 * 60 * 1000) {
                setSavedSession(parsedSession);
                setShowResumeSessionModal(true);
            } else {
                localStorage.removeItem('icu_session');
            }
        }
    };

    // Save session on view change
    useEffect(() => {
        if (isLoggedIn && activeView) {
            const sessionData: SavedSession = { view: activeView, timestamp: Date.now() };
            localStorage.setItem('icu_session', JSON.stringify(sessionData));
        }
    }, [activeView, isLoggedIn]);

    const runFinancialAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        setAnalysisError(false);
        const financialData = {
            accounts,
            transactions: transactions.slice(0, 20),
            cryptoHoldings,
        };
        const result = await geminiService.getFinancialAnalysis(JSON.stringify(financialData));
        if (result.isError) {
            setAnalysisError(true);
        } else {
            setFinancialAnalysis(result.analysis);
        }
        setIsAnalyzing(false);
    }, [accounts, transactions, cryptoHoldings]);
    
    const handleCreateAccountSuccess = (formData: any) => {
        // FIX: Ensure phone number is 'undefined' if empty to match UserProfile type, preventing potential downstream errors.
        const newUserProfile: UserProfile = { ...NEW_USER_PROFILE_TEMPLATE, name: formData.fullName, email: formData.email, phone: formData.phone || undefined };
        const newAccounts = NEW_USER_ACCOUNTS_TEMPLATE.map(template => ({
            ...template,
            id: `acc_${template.type.toLowerCase().replace(' ', '_')}_${Date.now()}`,
            accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
            fullAccountNumber: String(Math.floor(1000000000000000 + Math.random() * 9000000000000000)),
        }));

        setUserProfile(newUserProfile);
        setAccounts(newAccounts);

        setShowCreateAccountFlow(false);
        setIsPostLoginCheck(true);

        // Simulate account provisioning
        setTimeout(() => {
            setAccounts(prev => prev.map(acc => ({...acc, status: 'Active', balance: acc.type === AccountType.CHECKING ? 1000 : 0 })));
            addNotification(NotificationType.ACCOUNT, 'Accounts Active!', 'Your new checking and savings accounts are now active and ready to use.');
        }, 5000);
    };

    // ... More handlers for other features
    const onAddFunds = async (amount: number, cardLastFour: string, cardNetwork: "Visa" | "Mastercard") => {
      // Find the primary checking account to add funds to.
      const checkingAccount = accounts.find(acc => acc.type === AccountType.CHECKING);
      if (checkingAccount) {
        setAccounts(prevAccounts =>
          prevAccounts.map(acc =>
            acc.id === checkingAccount.id ? { ...acc, balance: acc.balance + amount } : acc
          )
        );
        addNotification(
          NotificationType.ACCOUNT,
          'Funds Added',
          `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been added to your account from your ${cardNetwork} card ending in ${cardLastFour}.`
        );
      }
    };
    
    // Total Balance Calculations
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cryptoPortfolioValue = useMemo(() => {
        return cryptoHoldings.reduce((total, holding) => {
            const asset = cryptoAssets.find(a => a.id === holding.assetId);
            return total + (asset ? asset.price * holding.amount : 0);
        }, 0);
    }, [cryptoHoldings, cryptoAssets]);
    const portfolioChange24h = useMemo(() => {
        // This is a simplified calculation
        return cryptoAssets.reduce((total, asset) => total + asset.change24h, 0) / cryptoAssets.length;
    }, [cryptoAssets]);
    const totalNetWorth = totalBalance + cryptoPortfolioValue;

    const mainContent = useMemo(() => {
        switch (activeView) {
            case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} setActiveView={setActiveView} recipients={recipients} createTransaction={createTransaction} cryptoPortfolioValue={cryptoPortfolioValue} portfolioChange24h={portfolioChange24h} travelPlans={travelPlans} totalNetWorth={totalNetWorth} balanceDisplayMode={balanceDisplayMode} userProfile={userProfile} onOpenSendMoneyFlow={(tab) => { setSendMoneyFlowInitialTab(tab); setShowSendMoneyFlow(true); }}/>;
            case 'history': return <ActivityLog transactions={transactions} onUpdateTransactions={() => {}} onRepeatTransaction={(tx) => { setTransactionToRepeat(tx); setShowSendMoneyFlow(true); }} onAuthorizeTransaction={handleAuthorizeTransaction} accounts={accounts} onContactSupport={(txId) => { setContactSupportInitialTxId(txId); setShowContactSupportModal(true); }} />;
            case 'recipients': return <Recipients recipients={recipients} addRecipient={() => {}} onUpdateRecipient={() => {}} />;
            case 'security': return <Security advancedTransferLimits={INITIAL_ADVANCED_TRANSFER_LIMITS} onUpdateAdvancedLimits={() => {}} cards={cards} onUpdateCardControls={() => {}} verificationLevel={verificationLevel} onVerificationComplete={setVerificationLevel} securitySettings={securitySettings} onUpdateSecuritySettings={(update) => setSecuritySettings(prev => ({...prev, ...update}))} trustedDevices={trustedDevices} onRevokeDevice={() => {}} onChangePassword={() => setShowChangePasswordModal(true)} transactions={transactions} pushNotificationSettings={pushNotificationSettings} onUpdatePushNotificationSettings={(update) => setPushNotificationSettings(prev => ({...prev, ...update}))} privacySettings={privacySettings} onUpdatePrivacySettings={(update) => setPrivacySettings(prev => ({...prev, ...update}))} userProfile={userProfile} onUpdateProfilePicture={(url) => setUserProfile(p => ({...p, profilePictureUrl: url}))}/>;
            case 'cards': return <CardManagement cards={cards} virtualCards={virtualCards} onUpdateVirtualCard={()=>{}} cardTransactions={cardTransactions} onUpdateCardControls={()=>{}} onAddCard={()=>{}} onAddVirtualCard={()=>{}} accountBalance={totalBalance} onAddFunds={onAddFunds} />;
            case 'loans': return <Loans loanApplications={loanApplications} addLoanApplication={(app) => setLoanApplications(prev => [...prev, {...app, id: `loan_${Date.now()}`, status: LoanApplicationStatus.PENDING, submittedDate: new Date()}])} addNotification={addNotification} />;
            case 'insurance': return <Insurance addNotification={addNotification} />;
            case 'support': return <Support />;
            case 'accounts': return <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={() => {}} />;
            case 'crypto': return <CryptoDashboard cryptoAssets={cryptoAssets} setCryptoAssets={setCryptoAssets} holdings={cryptoHoldings} checkingAccount={accounts.find(a => a.type === AccountType.CHECKING)} onBuy={() => true} onSell={() => true} />;
            case 'services': return <ServicesDashboard subscriptions={subscriptions} appleCardDetails={appleCardDetails} appleCardTransactions={appleCardTransactions} onPaySubscription={() => true} onUpdateSpendingLimits={() => {}} onUpdateTransactionCategory={() => {}} />;
            case 'checkin': return <TravelCheckIn travelPlans={travelPlans} addTravelPlan={(country, startDate, endDate) => setTravelPlans(prev => [...prev, { id: `travel_${Date.now()}`, country, startDate, endDate, status: TravelPlanStatus.UPCOMING }])} />;
            case 'platform': return <PlatformFeatures settings={platformSettings} onUpdateSettings={(update) => setPlatformSettings(prev => ({...prev, ...update}))} />;
            case 'tasks': return <Tasks tasks={tasks} addTask={(text, dueDate, category) => setTasks(prev => [...prev, {id: `task_${Date.now()}`, text, completed: false, dueDate, category}])} toggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} deleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))} />;
            case 'flights': return <Flights bookings={flightBookings} onBookFlight={() => true} accounts={accounts} setActiveView={setActiveView} />;
            case 'utilities': return <Utilities bills={utilityBills} billers={utilityBillers} onPayBill={(billId, accountId) => { setUtilityBills(prev => prev.map(b => b.id === billId ? {...b, isPaid: true} : b)); return true; }} accounts={accounts} setActiveView={setActiveView} />;
            case 'integrations': return <Integrations linkedServices={linkedServices} onLinkService={(service, identifier) => setLinkedServices(prev => ({...prev, [service]: identifier}))} />;
            case 'advisor': return <FinancialAdvisor analysis={financialAnalysis} isAnalyzing={isAnalyzing} analysisError={analysisError} runFinancialAnalysis={runFinancialAnalysis} setActiveView={setActiveView} />;
            case 'invest': return <Investments />;
            case 'atmLocator': return <AtmLocator />;
            case 'quickteller': return <Quickteller airtimeProviders={airtimeProviders} purchases={airtimePurchases} accounts={accounts} onPurchase={(providerId, phoneNumber, amount, accountId) => { setAirtimePurchases(p => [{id: `air_${Date.now()}`, providerId, phoneNumber, amount, purchaseDate: new Date()}, ...p]); return true; }} setActiveView={setActiveView} />;
            case 'qrScanner': return <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />;
            case 'privacy': return <PrivacyCenter settings={privacySettings} onUpdateSettings={(update) => setPrivacySettings(p => ({...p, ...update}))} />;
            case 'about': return <About />;
            case 'contact': return <Contact setActiveView={setActiveView} />;
            case 'wallet': return <DigitalWallet wallet={INITIAL_WALLET_DETAILS} />;
            case 'ratings': return <Ratings />;
            case 'globalAid': return <GlobalAid donations={donations} onDonate={(causeId, amount, accountId) => { setDonations(prev => [...prev, {id: `don_${Date.now()}`, causeId, amount, date: new Date()}]); return true; }} accounts={accounts} />;
            case 'network': return <GlobalBankingNetwork onOpenWireTransfer={(data) => { setWireTransferInitialData(data); setShowWireTransfer(true); }} setActiveView={setActiveView} />;
            default: return <div>Not implemented</div>;
        }
    }, [activeView, accounts, transactions, recipients, createTransaction, cryptoPortfolioValue, portfolioChange24h, travelPlans, totalNetWorth, balanceDisplayMode, userProfile, cards, cardTransactions, loanApplications, cryptoAssets, cryptoHoldings, subscriptions, appleCardDetails, appleCardTransactions, securitySettings, trustedDevices, platformSettings, tasks, flightBookings, utilityBills, utilityBillers, airtimeProviders, airtimePurchases, addNotification, financialAnalysis, isAnalyzing, analysisError, runFinancialAnalysis, pushNotificationSettings, privacySettings, verificationLevel, donations, linkedServices, virtualCards, handleAuthorizeTransaction]);

    if (showAdvancedFirstPage) {
        return <AdvancedFirstPage onComplete={() => setShowAdvancedFirstPage(false)} />;
    }
    if (!isLoggedIn) {
        return showCreateAccountFlow 
            ? <AccountCreationFlow onBackToLogin={() => setShowCreateAccountFlow(false)} onCreateAccountSuccess={handleCreateAccountSuccess} /> 
            : <Welcome onLogin={handleLogin} onStartCreateAccount={() => setShowCreateAccountFlow(true)} />;
    }
    if (isPostLoginCheck) {
        return <PostLoginSecurityCheck onComplete={handlePostLoginComplete} />;
    }
     if (isLoggingOut) {
        return <LoggingOut onComplete={() => { setIsLoggingOut(false); setIsLoggedIn(false); setActiveView('dashboard'); }} />;
    }

    return (
        <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300`}>
            {pushNotifications.length > 0 && <PushNotificationToast notification={pushNotifications[0]} onClose={() => setPushNotifications(p => p.slice(1))} />}
            <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} activeView={activeView} setActiveView={setActiveView} onLogout={() => setShowLogoutModal(true)} notifications={notifications} onMarkNotificationsAsRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} onNotificationClick={(v) => { setActiveView(v); }} userProfile={userProfile} onOpenLanguageSelector={() => {}} onOpenSendMoneyFlow={(tab) => { setSendMoneyFlowInitialTab(tab); setShowSendMoneyFlow(true); }} onOpenWireTransfer={() => setShowWireTransfer(true)} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {mainContent}
            </main>
            <Footer setActiveView={setActiveView} onOpenSendMoneyFlow={(tab) => { setSendMoneyFlowInitialTab(tab); setShowSendMoneyFlow(true); }} openLegalModal={(title, content) => { setLegalModalContent({title, content}); setShowLegalModal(true); }}/>
            <LiveBankingAssistant accounts={accounts} transactions={transactions} recipients={recipients} onInitiateTransfer={(name, amount) => { const r = recipients.find(rec => rec.fullName.toLowerCase().includes(name.toLowerCase())); if (r) { setTransactionToRepeat({ ...INITIAL_TRANSACTIONS[0], recipient: r, sendAmount: amount }); setShowSendMoneyFlow(true); } }} />

            {/* Global Modals */}
            {showSendMoneyFlow && <SendMoneyFlow recipients={recipients} accounts={accounts} createTransaction={createTransaction} transactions={transactions} securitySettings={securitySettings} hapticsEnabled={platformSettings.hapticsEnabled} onAuthorizeTransaction={() => {}} setActiveView={setActiveView} onClose={() => { setShowSendMoneyFlow(false); setTransactionToRepeat(null); }} onLinkAccount={() => { setShowSendMoneyFlow(false); setShowLinkAccountModal(true); }} onDepositCheck={() => {}} onSplitTransaction={() => true} initialTab={sendMoneyFlowInitialTab} transactionToRepeat={transactionToRepeat} userProfile={userProfile} onContactSupport={() => {}} />}
            {showWireTransfer && <WireTransfer accounts={accounts} recipients={recipients} onSendWire={onSendWire} onClose={() => { setShowWireTransfer(false); setWireTransferInitialData(null); }} initialData={wireTransferInitialData} />}
            {showLogoutModal && <LogoutConfirmationModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />}
            {showInactivityModal && <InactivityModal onStayLoggedIn={() => {}} onLogout={handleLogout} countdownStart={60} />}
            {showCongratulations && <CongratulationsOverlay />}
            {showPushApproval && transactionForPushApproval && <PushApprovalModal transactionId={transactionForPushApproval} onAuthorize={() => {}} onClose={() => setShowPushApproval(false)} />}
            {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} onSuccess={() => {}} />}
            {showLinkAccountModal && <LinkBankAccountModal onClose={() => setShowLinkAccountModal(false)} onLinkSuccess={() => {}} />}
            {showContactSupportModal && <ContactSupportModal onClose={() => setShowContactSupportModal(false)} onSubmit={async (data) => { console.log("Support Ticket:", data); }} transactions={transactions} initialTransactionId={contactSupportInitialTxId} />}
            {showLegalModal && <LegalModal title={legalModalContent.title} content={legalModalContent.content} onClose={() => setShowLegalModal(false)} />}
            {showResumeSessionModal && savedSession && <ResumeSessionModal session={savedSession} onResume={() => { setActiveView(savedSession.view); setShowResumeSessionModal(false); setSavedSession(null); localStorage.removeItem('icu_session'); }} onStartFresh={() => { setShowResumeSessionModal(false); setSavedSession(null); localStorage.removeItem('icu_session'); }} />}
        </div>
    );
};

export const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);