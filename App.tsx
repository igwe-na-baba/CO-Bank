// FIX: Import `useMemo` and `useRef` from React to resolve 'Cannot find name' errors.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { Recipients } from './components/Recipients';
// FIX: Added missing types to the import from types.ts.
// FIX: Added CardTransaction to the import list.
import { Transaction, Recipient, TransactionStatus, Card, CardTransaction, Notification, NotificationType, AdvancedTransferLimits, Country, LoanApplication, LoanApplicationStatus, Account, VerificationLevel, CryptoHolding, CryptoAsset, SubscriptionService, AppleCardDetails, AppleCardTransaction, SpendingLimit, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, View, Task, FlightBooking, UtilityBill, UtilityBiller, AdvisorResponse, BalanceDisplayMode, AccountType, AirtimePurchase, PushNotification, PushNotificationSettings, SavedSession, VirtualCard, WalletDetails, Donation, PrivacySettings } from './types';
// FIX: Added NEW_USER_ACCOUNTS_TEMPLATE to the import from constants.ts to resolve a reference error.
import { INITIAL_RECIPIENTS, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_CARD_TRANSACTIONS, INITIAL_ADVANCED_TRANSFER_LIMITS, SELF_RECIPIENT, INITIAL_ACCOUNTS, getInitialCryptoAssets, INITIAL_CRYPTO_HOLDINGS, CRYPTO_TRADE_FEE_PERCENT, INITIAL_SUBSCRIPTIONS, INITIAL_APPLE_CARD_DETAILS, INITIAL_APPLE_CARD_TRANSACTIONS, INITIAL_TRAVEL_PLANS, INITIAL_SECURITY_SETTINGS, INITIAL_TRUSTED_DEVICES, USER_PROFILE, INITIAL_PLATFORM_SETTINGS, THEME_COLORS, INITIAL_TASKS, INITIAL_FLIGHT_BOOKINGS, INITIAL_UTILITY_BILLS, getUtilityBillers, getAirtimeProviders, INITIAL_AIRTIME_PURCHASES, INITIAL_PUSH_SETTINGS, EXCHANGE_RATES, NEW_USER_PROFILE_TEMPLATE, NEW_USER_ACCOUNTS_TEMPLATE, INITIAL_VIRTUAL_CARDS, DOMESTIC_WIRE_FEE, INTERNATIONAL_WIRE_FEE, LEGAL_CONTENT, INITIAL_WALLET_DETAILS, TRANSFER_PURPOSES } from './constants';
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
// FIX: Standardized the import path for the 'Tasks' component to use PascalCase ('./components/Tasks'). This resolves a module resolution error caused by case-casing inconsistencies between the import path and the actual filename on some file systems.
import { Tasks } from './components/Tasks';
import { Flights } from './components/Flights';
import { Utilities } from './components/Utilities';
import { Integrations } from './components/Integrations';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
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
// FIX: Imported the LoggingOut component to resolve a missing component error.
import { LoggingOut } from './components/LoggingOut';
import { AdvancedFirstPage } from './components/AdvancedFirstPage';
import { Investments } from './components/Investments';
import { Footer } from './components/Footer';
import { PushNotificationToast } from './components/PushNotificationToast';
import { ResumeSessionModal } from './components/ResumeSessionModal';

const INACTIVITY_TIMEOUT = 300 * 1000; // 5 minutes

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
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [showSendMoneyFlow, setShowSendMoneyFlow] = useState(false);
    const [sendMoneyFlowInitialTab, setSendMoneyFlowInitialTab] = useState<'send' | 'split' | 'deposit' | undefined>(undefined);
    const [showWireTransfer, setShowWireTransfer] = useState(false);
    const [wireTransferInitialData, setWireTransferInitialData] = useState<any>(null);
    const [showCongratulations, setShowCongratulations] = useState(false);
    const [showPushApproval, setShowPushApproval] = useState(false);
    const [transactionForPushApproval, setTransactionForPushApproval] = useState<string | null>(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
    const [showContactSupportModal, setShowContactSupportModal] = useState(false);
    const [contactSupportInitialTxId, setContactSupportInitialTxId] = useState<string | undefined>(undefined);
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalModalContent, setLegalModalContent] = useState({ title: '', content: '' });
    
    // Data State
    const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);
    const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
    const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
    const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
    const [cardTransactions] = useState<CardTransaction[]>(INITIAL_CARD_TRANSACTIONS);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(() => getInitialCryptoAssets(Icons));
    const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
    const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
    const [appleCardDetails, setAppleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
    const [appleCardTransactions, setAppleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
    const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
    const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [flightBookings, setFlightBookings] = useState<FlightBooking[]>(INITIAL_FLIGHT_BOOKINGS);
    const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
    const [utilityBillers] = useState<UtilityBiller[]>(() => getUtilityBillers(Icons));
    const [airtimeProviders] = useState(() => getAirtimeProviders(Icons));
    const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
    const [pushNotificationSettings, setPushNotificationSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
    // FIX: Initialize privacySettings with nested email and sms objects to prevent runtime errors.
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        ads: true, sharing: true,
        email: { transactions: true, security: true, promotions: false },
        sms: { transactions: true, security: true, promotions: false },
    });
    const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.LEVEL_2);
    const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(false);
    const [balanceDisplayMode, setBalanceDisplayMode] = useState<BalanceDisplayMode>('global');
    const [donations, setDonations] = useState<Donation[]>([]);
    const [linkedServices, setLinkedServices] = useState<Record<string, string>>({ 'PayPal': 'randy.m.c@example.com' });
    const [transactionToRepeat, setTransactionToRepeat] = useState<Transaction | null>(null);

    const inactivityTimer = useRef<number>();
    
    // Handlers
    const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
        const newNotification: Notification = { id: `notif_${Date.now()}`, type, title, message, timestamp: new Date(), read: false, linkTo };
        setNotifications(prev => [newNotification, ...prev]);
        
        const newPush: PushNotification = { id: newNotification.id, type, title, message };
        setPushNotifications(prev => [newPush, ...prev]);
    }, []);

    const createTransaction = useCallback((data: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>): Transaction | null => {
        const sourceAccount = accounts.find(a => a.id === data.accountId);
        if (!sourceAccount || sourceAccount.balance < (data.sendAmount + data.fee)) {
            console.error("Insufficient funds or account not found.");
            return null;
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
        // FIX: Added a null check for `userProfile.phone` to satisfy TypeScript strict null checks.
        if(userProfile.phone) {
            notificationService.sendSmsNotification(userProfile.phone, notificationService.generateTransactionReceiptSms(newTransaction));
        }
        const {subject, body} = notificationService.generateTransactionReceiptEmail(newTransaction, userProfile.name);
        notificationService.sendTransactionalEmail(userProfile.email, subject, body);
        addNotification(NotificationType.TRANSACTION, 'Transfer Sent', `Your transfer of ${data.sendAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})} to ${data.recipient.fullName} has been submitted.`);
        
        return newTransaction;
    }, [accounts, userProfile.name, userProfile.email, userProfile.phone, addNotification]);
    
    const onSendWire = (data: any) => {
        const sourceAccount = accounts.find(a => a.id === data.sourceAccountId);
        const amount = parseFloat(data.amount) || 0;
        const fee = data.transferType === 'international' ? INTERNATIONAL_WIRE_FEE : DOMESTIC_WIRE_FEE;

        if (!sourceAccount || sourceAccount.balance < (amount + fee)) {
            return null;
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

        // FIX: Added missing properties `statusTimestamps`, `description`, and `type` to conform to the `Transaction` interface.
        const tx: Transaction = {
            id: `wire_${Date.now()}`,
            accountId: data.sourceAccountId,
            recipient: recipient,
            sendAmount: amount,
            receiveAmount: amount * (EXCHANGE_RATES[recipient.country.currency] || 1),
            fee: fee,
            exchangeRate: EXCHANGE_RATES[recipient.country.currency] || 1,
            status: TransactionStatus.SUBMITTED,
            estimatedArrival: new Date(Date.now() + 86400000 * 5),
            transferMethod: 'wire',
            statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
            description: `Wire to ${recipient.fullName}`,
            type: 'debit',
        };

        setTransactions(prev => [tx, ...prev]);
        setAccounts(prev => prev.map(acc => acc.id === data.sourceAccountId ? { ...acc, balance: acc.balance - (amount + fee) } : acc));
        
        return tx;
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
        // FIX: The `phone` property might not be a string, ensure it's converted to prevent type errors.
        const newUserProfile: UserProfile = { ...NEW_USER_PROFILE_TEMPLATE, name: formData.fullName, email: formData.email, phone: String(formData.phone) };
        const newAccounts = NEW_USER_ACCOUNTS_TEMPLATE.map((acc, i) => ({
            ...acc,
            id: `acc_new_${Date.now()}_${i}`,
            // FIX: Corrected property name from 'accountNumber' to 'number' when mapping over accounts.
            fullAccountNumber: `...` 
        }));
        
        setUserProfile(newUserProfile);
        setAccounts(newAccounts);
        setShowCreateAccountFlow(false);
        setIsPostLoginCheck(true);

        const { subject, body } = notificationService.generateFullWelcomeEmail(newUserProfile.name, newAccounts.map(a => ({ type: a.type, number: a.accountNumber })));
        notificationService.sendTransactionalEmail(newUserProfile.email, subject, body);
    };

    // Render logic
    if (showAdvancedFirstPage) {
        return <AdvancedFirstPage onComplete={() => setShowAdvancedFirstPage(false)} />;
    }
    if (isLoggingOut) {
        return <LoggingOut onComplete={() => { setIsLoggedIn(false); setIsLoggingOut(false); }} />;
    }
    if (isPostLoginCheck) {
        return <PostLoginSecurityCheck onComplete={handlePostLoginComplete} />;
    }
    if (!isLoggedIn) {
        if (showCreateAccountFlow) {
            return <AccountCreationFlow onCreateAccountSuccess={handleCreateAccountSuccess} onBackToLogin={() => setShowCreateAccountFlow(false)} />;
        }
        return <Welcome onLogin={handleLogin} onStartCreateAccount={() => setShowCreateAccountFlow(true)} />;
    }
    
    const mainCheckingAccount = accounts.find(a => a.type === AccountType.CHECKING);
    const cryptoPortfolioValue = cryptoHoldings.reduce((total, holding) => {
        const asset = cryptoAssets.find(a => a.id === holding.assetId);
        return total + (asset ? holding.amount * asset.price : 0);
    }, 0);
    const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0) + cryptoPortfolioValue;

    return (
        <div className="bg-slate-900 min-h-screen">
            <Header
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                isMenuOpen={isMenuOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                onLogout={() => setShowLogoutModal(true)}
                notifications={notifications}
                onMarkNotificationsAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                onNotificationClick={(view) => setActiveView(view)}
                userProfile={userProfile}
                onOpenLanguageSelector={() => setShowLanguageSelector(true)}
                onOpenSendMoneyFlow={(tab) => { setShowSendMoneyFlow(true); setSendMoneyFlowInitialTab(tab); }}
                onOpenWireTransfer={() => setShowWireTransfer(true)}
            />
            <DynamicIslandSimulator transaction={transactions.find(t => 
                t.status !== TransactionStatus.FUNDS_ARRIVED && 
                t.status !== TransactionStatus.FLAGGED_AWAITING_CLEARANCE &&
                t.status !== TransactionStatus.AWAITING_AUTHORIZATION
            ) || null} />
            {pushNotifications.length > 0 && (
                <PushNotificationToast 
                    notification={pushNotifications[0]} 
                    onClose={() => setPushNotifications(prev => prev.slice(1))} 
                />
            )}
            <main className="bg-slate-100 text-slate-800">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* View Router */}
                    {activeView === 'dashboard' && <Dashboard accounts={accounts} transactions={transactions} setActiveView={setActiveView} recipients={recipients} createTransaction={createTransaction} cryptoPortfolioValue={cryptoPortfolioValue} portfolioChange24h={0} travelPlans={travelPlans} totalNetWorth={totalNetWorth} balanceDisplayMode={balanceDisplayMode} userProfile={userProfile} onOpenSendMoneyFlow={(tab) => { setShowSendMoneyFlow(true); setSendMoneyFlowInitialTab(tab); }} />}
                    {activeView === 'recipients' && <Recipients recipients={recipients} addRecipient={() => {}} onUpdateRecipient={() => {}} />}
                    {activeView === 'history' && <ActivityLog transactions={transactions} onUpdateTransactions={() => {}} onRepeatTransaction={(tx) => { setTransactionToRepeat(tx); setShowSendMoneyFlow(true); }} onAuthorizeTransaction={handleAuthorizeTransaction} accounts={accounts} onContactSupport={(txId) => { setContactSupportInitialTxId(txId); setShowContactSupportModal(true); }}/>}
                    {activeView === 'security' && <Security advancedTransferLimits={INITIAL_ADVANCED_TRANSFER_LIMITS} onUpdateAdvancedLimits={() => {}} cards={cards} onUpdateCardControls={() => {}} verificationLevel={verificationLevel} onVerificationComplete={setVerificationLevel} securitySettings={securitySettings} onUpdateSecuritySettings={setSecuritySettings} trustedDevices={trustedDevices} onRevokeDevice={() => {}} onChangePassword={() => setShowChangePasswordModal(true)} transactions={transactions} pushNotificationSettings={pushNotificationSettings} onUpdatePushNotificationSettings={setPushNotificationSettings} userProfile={userProfile} onUpdateProfilePicture={(url) => setUserProfile(p => ({...p, profilePictureUrl: url}))} privacySettings={privacySettings} onUpdatePrivacySettings={(update) => setPrivacySettings(p => ({...p, ...update}))} />}
                    {activeView === 'cards' && mainCheckingAccount && <CardManagement cards={cards} virtualCards={virtualCards} onUpdateVirtualCard={()=>{}} cardTransactions={cardTransactions} onUpdateCardControls={() => {}} onAddCard={() => {}} onAddVirtualCard={() => {}} accountBalance={mainCheckingAccount.balance} onAddFunds={() => {}} />}
                    {activeView === 'loans' && <Loans loanApplications={loanApplications} addLoanApplication={() => {}} addNotification={addNotification} />}
                    {activeView === 'support' && <Support />}
                    {activeView === 'accounts' && <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={() => {}}/>}
                    {activeView === 'crypto' && mainCheckingAccount && <CryptoDashboard cryptoAssets={cryptoAssets} setCryptoAssets={setCryptoAssets} holdings={cryptoHoldings} checkingAccount={mainCheckingAccount} onBuy={() => true} onSell={() => true}/>}
                    {activeView === 'services' && <ServicesDashboard subscriptions={subscriptions} appleCardDetails={appleCardDetails} appleCardTransactions={appleCardTransactions} onPaySubscription={() => true} onUpdateSpendingLimits={() => {}} onUpdateTransactionCategory={() => {}} />}
                    {activeView === 'checkin' && <TravelCheckIn travelPlans={travelPlans} addTravelPlan={() => {}} />}
                    {activeView === 'platform' && <PlatformFeatures settings={platformSettings} onUpdateSettings={setPlatformSettings} />}
                    {activeView === 'tasks' && <Tasks tasks={tasks} addTask={() => {}} toggleTask={() => {}} deleteTask={() => {}} />}
                    {activeView === 'flights' && <Flights bookings={flightBookings} onBookFlight={() => true} accounts={accounts} setActiveView={setActiveView} />}
                    {activeView === 'utilities' && <Utilities bills={utilityBills} billers={utilityBillers} onPayBill={() => true} accounts={accounts} setActiveView={setActiveView} />}
                    {activeView === 'integrations' && <Integrations linkedServices={linkedServices} onLinkService={() => {}} />}
                    {activeView === 'advisor' && <FinancialAdvisor analysis={financialAnalysis} isAnalyzing={isAnalyzing} analysisError={analysisError} runFinancialAnalysis={runFinancialAnalysis} setActiveView={setActiveView} />}
                    {activeView === 'invest' && <Investments />}
                    {activeView === 'atmLocator' && <AtmLocator />}
                    {activeView === 'quickteller' && <Quickteller airtimeProviders={airtimeProviders} purchases={airtimePurchases} accounts={accounts} onPurchase={() => true} setActiveView={setActiveView} />}
                    {activeView === 'qrScanner' && <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />}
                    {activeView === 'privacy' && <PrivacyCenter settings={privacySettings} onUpdateSettings={(update) => setPrivacySettings(p => ({...p, ...update}))} />}
                    {activeView === 'about' && <About />}
                    {activeView === 'contact' && <Contact setActiveView={setActiveView} />}
                    {activeView === 'wallet' && <DigitalWallet wallet={INITIAL_WALLET_DETAILS} />}
                    {activeView === 'ratings' && <Ratings />}
                    {activeView === 'globalAid' && <GlobalAid donations={donations} onDonate={() => true} accounts={accounts} />}
                    {activeView === 'network' && <GlobalBankingNetwork onOpenWireTransfer={(data) => { setWireTransferInitialData(data); setShowWireTransfer(true); }} setActiveView={setActiveView} />}
                </div>
            </main>
            <Footer 
                setActiveView={setActiveView}
                onOpenSendMoneyFlow={(tab) => { setShowSendMoneyFlow(true); setSendMoneyFlowInitialTab(tab); }}
                openLegalModal={(title, content) => {
                    setLegalModalContent({ title, content });
                    setShowLegalModal(true);
                }}
            />
            {/* Live Assistant */}
            <LiveBankingAssistant accounts={accounts} transactions={transactions} recipients={recipients} onInitiateTransfer={(name, amt) => { setTransactionToRepeat({ recipient: {fullName: name}, sendAmount: amt } as any); setShowSendMoneyFlow(true); }}/>
            {/* Modals & Overlays */}
            {showLogoutModal && <LogoutConfirmationModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />}
            {showInactivityModal && <InactivityModal onLogout={handleLogout} onStayLoggedIn={() => setShowInactivityModal(false)} countdownStart={60} />}
            {showLanguageSelector && <LanguageSelector onClose={() => setShowLanguageSelector(false)} />}
            {showSendMoneyFlow && <SendMoneyFlow recipients={recipients} accounts={accounts} createTransaction={createTransaction} transactions={transactions} securitySettings={securitySettings} hapticsEnabled={platformSettings.hapticsEnabled} onAuthorizeTransaction={handleAuthorizeTransaction} setActiveView={setActiveView} onClose={() => { setShowSendMoneyFlow(false); setTransactionToRepeat(null); }} onLinkAccount={() => { setShowSendMoneyFlow(false); setShowLinkAccountModal(true); }} onDepositCheck={()=>{}} onSplitTransaction={() => true} initialTab={sendMoneyFlowInitialTab} transactionToRepeat={transactionToRepeat} userProfile={userProfile} onContactSupport={() => setShowContactSupportModal(true)} />}
            {showWireTransfer && <WireTransfer accounts={accounts} recipients={recipients} onSendWire={onSendWire} onClose={() => { setShowWireTransfer(false); setWireTransferInitialData(null); }} initialData={wireTransferInitialData} />}
            {showCongratulations && <CongratulationsOverlay />}
            {showPushApproval && transactionForPushApproval && <PushApprovalModal transactionId={transactionForPushApproval} onAuthorize={()=>{}} onClose={() => setShowPushApproval(false)} />}
            {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} onSuccess={() => {}} />}
            {showLinkAccountModal && <LinkBankAccountModal onClose={() => setShowLinkAccountModal(false)} onLinkSuccess={() => {}} />}
            {showContactSupportModal && <ContactSupportModal onClose={() => setShowContactSupportModal(false)} onSubmit={async () => {}} transactions={transactions} initialTransactionId={contactSupportInitialTxId} />}
            {showLegalModal && <LegalModal title={legalModalContent.title} content={legalModalContent.content} onClose={() => setShowLegalModal(false)} />}
            {showResumeSessionModal && savedSession && (
                <ResumeSessionModal
                    session={savedSession}
                    onResume={() => {
                        setActiveView(savedSession.view);
                        setShowResumeSessionModal(false);
                    }}
                    onStartFresh={() => {
                        localStorage.removeItem('icu_session');
                        setActiveView('dashboard');
                        setShowResumeSessionModal(false);
                    }}
                />
            )}
        </div>
    );
};

// FIX: Change to a named export to resolve the module loading error.
export const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};
