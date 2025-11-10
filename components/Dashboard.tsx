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
        const timerId = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="mt-4 space-y-2 text-right">
            <div className="flex items-center justify-end space-x-2 text-slate-600 dark:text-slate-300">
                <MapPinIcon className="w-5 h-5" />
                <p className="font-mono text-sm">New York, NY, USA</p>
            </div>
             <div className="flex items-center justify-end space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-breathing-dot"></div>
                <p className="font-mono text-sm font-semibold text-green-600 dark:text-green-300">Active Session</p>
            </div>
            <div className="flex items-center justify-end space-x-2 text-slate-600 dark:text-slate-300">
                <ClockIcon className="w-5 h-5" />
                <p className="font-mono text-sm">
                    {dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    {' / '}
                    {dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
            </div>
        </div>
    );
};


const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
  const statusIcon = isCompleted ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <ClockIcon className="w-5 h-5 text-yellow-500" />;
  const statusColor = isCompleted ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-500/20' : 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-500/20';
  const isCredit = transaction.type === 'credit';
  
  const getTransactionIcon = () => {
      if (isCredit) {
          return transaction.chequeDetails ?
              <ClipboardDocumentIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" /> :
              <DepositIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
      }
      
      // Debit
      if (transaction.recipient.country.code !== 'US') {
          return <GlobeAmericasIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
      }
      
      const BankLogo = getBankIcon(transaction.recipient.bankName);
      return <BankLogo className="w-6 h-6" />;
  };

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <td className="py-4 px-6">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                {getTransactionIcon()}
            </div>
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{isCredit ? 'Deposit' : transaction.recipient.fullName}</p>
                 {isCredit ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.description}</p>
                ) : (
                    <div className="flex items-center space-x-1.5">
                        <img src={`https://flagsapi.com/${transaction.recipient.country.code}/shiny/24.png`} alt={transaction.recipient.country.name} className="w-5 h-auto rounded-sm" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.recipient.bankName}</p>
                    </div>
                )}
            </div>
        </div>
      </td>
      <td className={`py-4 px-6 font-mono text-right ${isCredit ? 'text-green-500 dark:text-green-400' : 'text-slate-800 dark:text-slate-300'}`}>
        {isCredit ? '+' : '-'} {transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </td>
      <td className="py-4 px-6">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center space-x-1 ${statusColor}`}>
            {statusIcon}
            <span>{transaction.status}</span>
        </span>
      </td>
      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-sm text-right">
        {transaction.statusTimestamps[TransactionStatus.SUBMITTED].toLocaleDateString()}
      </td>
    </tr>
  );
};

const ExploreServices: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const services = [
        {
            title: 'Global Services',
            description: 'Plan your next trip and pay directly.',
            icon: <AirplaneTicketIcon className="w-10 h-10 text-primary-300" />,
            view: 'flights' as View,
            bgImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2832&auto=format&fit=crop'
        },
        {
            title: 'Trade Crypto',
            description: 'Buy, sell, and hold digital assets securely.',
            icon: <ChartBarIcon className="w-10 h-10 text-primary-300" />,
            view: 'crypto' as View,
            bgImage: 'https://images.unsplash.com/photo-1621452773453-c82736159b3a?q=80&w=2940&auto=format&fit=crop'
        },
        {
            title: 'Secure Services',
            description: 'Protect your transfers, travel, and more.',
            icon: <LifebuoyIcon className="w-10 h-10 text-primary-300" />,
            view: 'insurance' as View,
            bgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-700/50 rounded-2xl p-6 shadow-digital-light dark:shadow-digital-dark">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Explore Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map(service => (
                    <button 
                        key={service.title} 
                        onClick={() => setActiveView(service.view)}
                        className="group relative h-48 rounded-2xl text-white overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 animate-card-zoom" 
                            style={{ 
                                backgroundImage: `url(${service.bgImage})`,
                                animationDuration: '30s'
                            }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                        <div className="relative h-full flex flex-col justify-end p-4 z-20 text-left">
                            <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                {service.icon}
                            </div>
                            <h4 className="font-bold text-lg">{service.title}</h4>
                            <p className="text-xs text-slate-300">{service.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, setActiveView, recipients, createTransaction, cryptoPortfolioValue, portfolioChange24h, travelPlans, totalNetWorth, balanceDisplayMode, userProfile, onOpenSendMoneyFlow }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { t } = useLanguage();
  
  const greeting = useMemo(() => getGreeting(), []);
  const activeTravelPlans = travelPlans.filter(p => p.status === TravelPlanStatus.ACTIVE);
  const isPortfolioChangePositive = portfolioChange24h >= 0;

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };
  
  return (
    <div className="space-y-8">
      <ActiveTravelNotice plans={activeTravelPlans} />

      <div className="bg-white dark:bg-slate-700/50 rounded-2xl p-6 shadow-digital-light dark:shadow-digital-dark">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-4">
                  <img src={userProfile.profilePictureUrl} alt="Profile" className="w-12 h-12 rounded-full shadow-md object-cover" />
                  <div>
                      <div className="flex items-center space-x-2">
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{greeting}, {userProfile.name.split(' ')[0]}!</h3>
                          <VerifiedBadgeIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard_welcome_back')}</p>
                  </div>
              </div>
            </div>
            <div className="md:col-span-1 text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard_total_net_worth')}</p>
                <div className="flex items-center justify-end space-x-2">
                     <h2 className={`text-4xl font-bold text-slate-800 dark:text-slate-100 transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`}>
                        {isBalanceVisible ? <AnimatedNumber value={totalNetWorth} /> : '$ ••••••••'}
                    </h2>
                    <button onClick={toggleBalanceVisibility} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                        {isBalanceVisible ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                    </button>
                </div>
                <RealTimeInfo />
            </div>
        </div>
        
        <AccountCarousel
            accounts={accounts}
            isBalanceVisible={isBalanceVisible}
            setActiveView={setActiveView}
        />
      </div>

      <ExploreServices setActiveView={setActiveView} />
      
      <QuicktellerHub setActiveView={setActiveView} onOpenSendMoneyFlow={onOpenSendMoneyFlow} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickTransfer recipients={recipients} accounts={accounts} createTransaction={createTransaction} />
        <div className="bg-white dark:bg-slate-700/50 rounded-2xl shadow-digital-light dark:shadow-digital-dark p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Crypto Portfolio</h3>
             <p className={`text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2 transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`}>
                {isBalanceVisible ? cryptoPortfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ ••••••••'}
             </p>
             <div className={`flex items-center text-lg font-semibold mt-1 ${isPortfolioChangePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <TrendingUpIcon className={`w-5 h-5 mr-1 ${!isPortfolioChangePositive ? 'transform -scale-y-100' : ''}`} />
                <span>{portfolioChange24h.toFixed(2)}% (24h)</span>
             </div>
             <button onClick={() => setActiveView('crypto')} className="mt-4 text-sm font-bold text-primary-600 dark:text-primary-300 hover:underline animate-breathing">
                View & Trade &rarr;
            </button>
          </div>
      </div>
      
      <div className="bg-white dark:bg-slate-700/50 rounded-2xl shadow-digital-light dark:shadow-digital-dark overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('dashboard_recent_activity')}</h3>
            <button onClick={() => setActiveView('history')} className="text-sm font-bold text-primary-600 dark:text-primary-300 hover:underline">{t('dashboard_view_all')} &rarr;</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                        <th scope="col" className="px-6 py-3">Recipient / Details</th>
                        <th scope="col" className="px-6 py-3 text-right">Amount</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3 text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {transactions.slice(0, 4).map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
                </tbody>
            </table>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CurrencyConverter />
            <FinancialNews />
       </div>

    </div>
  );
};