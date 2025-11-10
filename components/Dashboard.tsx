import React, { useState, useMemo } from 'react';
import { Transaction, TransactionStatus, Account, Recipient, TravelPlan, TravelPlanStatus, BalanceDisplayMode, UserProfile, View } from '../types';
import { CheckCircleIcon, ClockIcon, EyeIcon, EyeSlashIcon, VerifiedBadgeIcon, DepositIcon, TrendingUpIcon, GlobeAmericasIcon, MapPinIcon, getBankIcon, AirplaneTicketIcon, ChartBarIcon, LifebuoyIcon, ClipboardDocumentIcon } from './Icons';
import { CurrencyConverter } from './CurrencyConverter';
import { FinancialNews } from './FinancialNews';
import { QuickTransfer } from './QuickTransfer';
import { QuicktellerHub } from './QuicktellerHub';
import { useLanguage } from '../contexts/LanguageContext';
import { AccountCarousel } from './AccountCarousel';

const useCountUp = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);
    const frameRef = React.useRef<number | undefined>(undefined);
    const startTimeRef = React.useRef<number | undefined>(undefined);

    const easeOutExpo = (t: number) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    React.useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = timestamp - startTimeRef.current;
            const elapsed = Math.min(progress / duration, 1);
            const easedProgress = easeOutExpo(elapsed);
            
            const newCount = parseFloat((easedProgress * end).toFixed(2));

            setCount(newCount);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            startTimeRef.current = undefined;
        };
    }, [end, duration]);

    return count;
};

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const count = useCountUp(value);
    return <>{count.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</>;
};


interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  setActiveView: (view: any) => void;
  recipients: Recipient[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Promise<Transaction | null>;
  cryptoPortfolioValue: number;
  portfolioChange24h: number;
  travelPlans: TravelPlan[];
  totalNetWorth: number;
  balanceDisplayMode: BalanceDisplayMode;
  userProfile: UserProfile;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
}

const ActiveTravelNotice: React.FC<{ plans: TravelPlan[] }> = ({ plans }) => {
    if (plans.length === 0) return null;

    return (
        <div className="bg-blue-500/10 border-l-4 border-blue-400 text-blue-800 dark:text-blue-200 p-4 rounded-r-lg shadow-digital-light dark:shadow-digital-dark" role="alert">
            <div className="flex items-center">
                <GlobeAmericasIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                <div>
                    <p className="font-bold">Travel Mode is Active</p>
                    <p className="text-sm">
                        You have {plans.length} active travel plan{plans.length > 1 ? 's' : ''}. 
                        Your card services are enabled for: {plans.map(p => p.country.name).join(', ')}.
                    </p>
                </div>
            </div>
        </div>
    );
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const RealTimeInfo: React.FC = () => {
    const [dateTime, setDateTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        // FIX: Corrected typo from `timerId` to `timer` to clear the correct interval.
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mt-4 space-y-2 text-right">
            <div className="flex items-center justify-end space-x-2 text-slate-600 dark:text-slate-300">
                <MapPinIcon className="w-5 h-5" />
                <p className="font-mono text-sm">New York, NY, USA</p>
            </div>
             <div className="flex items-center justify-end space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-breathing-dot"></div>
                <p className="font-mono text-sm font-semibold text-green-600 dark:text-green-300">Active</p>
            </div>
        </div>
    );
};

// FIX: Export Dashboard to resolve import error in App.tsx
export const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, setActiveView, recipients, createTransaction, cryptoPortfolioValue, portfolioChange24h, travelPlans, totalNetWorth, balanceDisplayMode, userProfile, onOpenSendMoneyFlow }) => {
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const { t } = useLanguage();

    const activeTravelPlans = travelPlans.filter(plan => plan.status === TravelPlanStatus.ACTIVE);

    const recentTransactions = transactions.slice(0, 3);
    const pendingTransactions = transactions.filter(t => t.status !== TransactionStatus.FUNDS_ARRIVED && t.status !== TransactionStatus.FLAGGED_AWAITING_CLEARANCE);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const greeting = getGreeting();
    
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{greeting}, {userProfile.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('dashboard_welcome_message')}</p>
                </div>
                <div className="hidden md:block">
                     <RealTimeInfo />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTravelPlans.length > 0 && <ActiveTravelNotice plans={activeTravelPlans} />}
                    {balanceDisplayMode === 'global' && (
                        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-digital-dark p-6 text-white animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{t('dashboard_total_net_worth')}</h2>
                                <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="p-1 text-slate-300 hover:text-white">
                                    {isBalanceVisible ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                                </button>
                            </div>
                            <div className={`text-5xl font-bold mt-2 transition-all duration-300 ${!isBalanceVisible ? 'blur-lg' : ''}`}>
                               {isBalanceVisible ? <AnimatedNumber value={totalNetWorth} /> : '$ ••••••••'}
                            </div>
                            <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-white/20">
                                <div onClick={() => setActiveView('accounts')} className="cursor-pointer">
                                    <p className="text-sm text-slate-300">{t('dashboard_total_cash')}</p>
                                    <p className={`text-2xl font-semibold transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`}>
                                        {isBalanceVisible ? totalBalance.toLocaleString('en-US',{style:'currency', currency:'USD'}) : '$ ••••••'}
                                    </p>
                                </div>
                                <div onClick={() => setActiveView('crypto')} className="cursor-pointer">
                                    <p className="text-sm text-slate-300">{t('dashboard_crypto_portfolio')}</p>
                                    <p className={`text-2xl font-semibold transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`}>
                                        {isBalanceVisible ? cryptoPortfolioValue.toLocaleString('en-US',{style:'currency', currency:'USD'}) : '$ ••••••'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <AccountCarousel accounts={accounts} isBalanceVisible={isBalanceVisible} setActiveView={setActiveView} />
                     <QuicktellerHub setActiveView={setActiveView} onOpenSendMoneyFlow={onOpenSendMoneyFlow} />
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                     <QuickTransfer accounts={accounts} recipients={recipients} createTransaction={createTransaction} />
                    {/* Recent Activity */}
                    <div className="bg-slate-200 dark:bg-slate-800/50 rounded-2xl shadow-digital-light dark:shadow-digital-dark">
                         <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('dashboard_recent_activity')}</h2>
                         </div>
                         <div className="p-4">
                             {recentTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-300/50 dark:hover:bg-slate-700/50">
                                     <div className="flex items-center space-x-3">
                                         {tx.type === 'credit' ? <DepositIcon className="w-8 h-8 text-green-500 dark:text-green-400" /> : <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center p-1"><img src={`https://flagsapi.com/${tx.recipient.country.code}/shiny/64.png`} alt="" className="rounded-full"/></div>}
                                         <div>
                                             <p className="font-semibold text-slate-700 dark:text-slate-200">{tx.recipient.nickname || tx.recipient.fullName}</p>
                                             <p className="text-xs text-slate-500 dark:text-slate-400">{t(`transaction_status_${tx.status.replace(/\s/g, '_').toLowerCase()}`)}</p>
                                         </div>
                                     </div>
                                     <p className={`font-mono font-semibold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>{tx.type === 'credit' ? '+' : '-'}{tx.sendAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})}</p>
                                </div>
                             ))}
                             <button onClick={() => setActiveView('history')} className="w-full text-center mt-2 p-2 text-sm font-semibold text-primary-600 dark:text-primary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg">{t('dashboard_view_all')}</button>
                         </div>
                    </div>
                     <CurrencyConverter />
                </div>
            </div>
             <FinancialNews />
        </div>
    );
};