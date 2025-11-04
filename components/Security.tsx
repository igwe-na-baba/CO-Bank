import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AdvancedTransferLimits, LimitDetail, VerificationLevel, SecuritySettings, TrustedDevice, Transaction, TransactionStatus, PushNotificationSettings, UserProfile, Card, PrivacySettings } from '../types';
import { CheckCircleIcon, PencilIcon, DevicePhoneMobileIcon, FingerprintIcon, LockClosedIcon, UserCircleIcon, NetworkIcon, IdentificationIcon, ComputerDesktopIcon, FaceIdIcon, CertificateIcon, ChartBarIcon, ShieldCheckIcon, TrendingUpIcon, EyeIcon, ExclamationTriangleIcon, CameraIcon, SpinnerIcon, ArrowsRightLeftIcon, BankIcon, GlobeAmericasIcon, ICreditUnionLogo, VisaIcon, MastercardIcon, ShoppingBagIcon } from './Icons';
import { VerificationCenter } from './VerificationCenter';
import { Setup2FAModal } from './Setup2FAModal';
import { SetupBiometricsModal } from './SetupBiometricsModal';

interface SettingsProps {
  advancedTransferLimits: AdvancedTransferLimits;
  onUpdateAdvancedLimits: (newLimits: AdvancedTransferLimits) => void;
  cards: Card[];
  onUpdateCardControls: (cardId: string, updatedControls: Partial<Card['controls']>) => void;
  verificationLevel: VerificationLevel;
  onVerificationComplete: (level: VerificationLevel) => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (newSettings: Partial<SecuritySettings>) => void;
  trustedDevices: TrustedDevice[];
  onRevokeDevice: (deviceId: string) => void;
  onChangePassword: () => void;
  transactions: Transaction[];
  pushNotificationSettings: PushNotificationSettings;
  onUpdatePushNotificationSettings: (newSettings: Partial<PushNotificationSettings>) => void;
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (update: Partial<PrivacySettings>) => void;
  userProfile: UserProfile;
  onUpdateProfilePicture: (url: string) => void;
}

const KycFeatureCard: React.FC<{
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  unlocked: boolean;
  requiredLevel: string;
  imageUrl?: string;
}> = ({ icon, title, description, unlocked, requiredLevel, imageUrl }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -100px 0px' }
        );

        const currentCardRef = cardRef.current;

        if (currentCardRef) {
            observer.observe(currentCardRef);
        }

        return () => {
            if (currentCardRef) {
                observer.unobserve(currentCardRef);
            }
        };
    }, []);

    return (
        <div ref={cardRef} className={`group relative p-4 rounded-lg shadow-digital-inset transition-all duration-300 overflow-hidden ${unlocked ? 'bg-slate-200' : 'bg-slate-300/50'}`}>
            {unlocked && imageUrl && (
                <>
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: isVisible ? `url(${imageUrl})` : 'none' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-200 via-slate-200/80 to-slate-200/50"></div>
                </>
            )}
            <div className="relative flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full shadow-digital ${unlocked ? 'bg-slate-200/80' : 'bg-slate-300'}`}>
                    {unlocked ? React.cloneElement(icon, { className: "w-6 h-6 text-primary" }) : React.cloneElement(icon, { className: "w-6 h-6 text-slate-400" })}
                </div>
                <div className="flex-grow">
                    <h4 className={`font-bold ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h4>
                    <p className={`text-sm ${unlocked ? 'text-slate-600' : 'text-slate-500'}`}>{description}</p>
                </div>
                {unlocked ? (
                    <div className="flex-shrink-0 flex items-center space-x-1 text-green-600 text-xs font-bold bg-green-100/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Unlocked</span>
                    </div>
                ) : (
                    <div className="flex-shrink-0 text-slate-500 text-xs font-semibold bg-slate-200/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        Requires {requiredLevel}
                    </div>
                )}
            </div>
        </div>
    );
};


const SecurityScore: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference * (1 - score / 100);
    const scoreColor = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="text-slate-300" />
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${scoreColor}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-sm font-medium text-slate-500">Score</span>
            </div>
        </div>
    );
};

const CardSecurityControls: React.FC<{ cards: Card[], onUpdateCardControls: (cardId: string, updatedControls: Partial<Card['controls']>) => void }> = ({ cards, onUpdateCardControls }) => {
    
    const ControlToggle: React.FC<{ label: string; enabled: boolean; onChange: (val: boolean) => void }> = ({ label, enabled, onChange }) => (
        <div className="flex justify-between items-center py-2">
            <span className="font-medium text-slate-700 text-sm">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-inner peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-primary"></div>
            </label>
        </div>
    );

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Card Security Controls</h2></div>
            <div className="p-6 space-y-4">
                {cards.map(card => (
                    <div key={card.id} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3">
                                {card.network === 'Visa' ? <VisaIcon className="w-10 h-auto"/> : <MastercardIcon className="w-10 h-auto"/>}
                                <div>
                                    <p className="font-bold text-slate-800">{card.cardType === 'DEBIT' ? 'Debit Card' : 'Credit Card'}</p>
                                    <p className="text-sm text-slate-500 font-mono">•••• {card.lastFour}</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-300">
                            <ControlToggle label="Lock Card" enabled={card.controls.isFrozen} onChange={val => onUpdateCardControls(card.id, { isFrozen: val })} />
                            <ControlToggle label="Online Purchases" enabled={card.controls.onlinePurchases} onChange={val => onUpdateCardControls(card.id, { onlinePurchases: val })} />
                            <ControlToggle label="International Transactions" enabled={card.controls.internationalTransactions} onChange={val => onUpdateCardControls(card.id, { internationalTransactions: val })} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdvancedTransferLimitsDisplay: React.FC<{ limits: AdvancedTransferLimits; transactions: Transaction[] }> = ({ limits, transactions }) => {
    
    const LimitDetailDisplay: React.FC<{ label: string; value: number | 'Unlimited' }> = ({ label, value }) => (
        <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-800 font-mono">
                {typeof value === 'number' ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : value}
            </span>
        </div>
    );
    
    const LimitCategory: React.FC<{ title: string; icon: React.ReactNode; limit: LimitDetail; used: { daily: number; monthly: number } }> = ({ title, icon, limit, used }) => {
        const dailyProgress = limit.daily !== 'Unlimited' ? (used.daily / limit.daily) * 100 : 0;
        const monthlyProgress = limit.monthly !== 'Unlimited' ? (used.monthly / limit.monthly) * 100 : 0;
        
        return (
            <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200 shadow-digital text-primary">{icon}</div>
                    <h4 className="font-bold text-slate-800">{title}</h4>
                </div>
                <div className="space-y-3">
                    {limit.perTransaction && <LimitDetailDisplay label="Per Transaction" value={limit.perTransaction} />}
                    <LimitDetailDisplay label="Daily Limit" value={limit.daily} />
                    {limit.daily !== 'Unlimited' && (
                        <div className="w-full bg-slate-300 rounded-full h-1.5 shadow-inner"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${dailyProgress}%`}}></div></div>
                    )}
                    <LimitDetailDisplay label="Monthly Limit" value={limit.monthly} />
                     {limit.monthly !== 'Unlimited' && (
                        <div className="w-full bg-slate-300 rounded-full h-1.5 shadow-inner"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${monthlyProgress}%`}}></div></div>
                    )}
                </div>
            </div>
        );
    };
    
    // Mock usage data for display purposes
    const p2pUsage = { daily: 350, monthly: 1200 };
    const achUsage = { daily: 5500, monthly: 27000 };
    const wireUsage = { daily: 0, monthly: 50000 };

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Advanced Transfer Limits</h2>
                <button onClick={() => alert('To request a limit increase, please contact customer support through the Support Center.')} className="text-sm font-semibold text-primary hover:underline">Request Increase</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <LimitCategory title="Peer-to-Peer (P2P)" icon={<ArrowsRightLeftIcon className="w-6 h-6"/>} limit={limits.p2p} used={p2pUsage} />
                <LimitCategory title="ACH Bank Transfers" icon={<BankIcon className="w-6 h-6"/>} limit={limits.ach} used={achUsage} />
                <LimitCategory title="Wire Transfers" icon={<GlobeAmericasIcon className="w-6 h-6"/>} limit={limits.wire} used={wireUsage} />
                <LimitCategory title="Internal Transfers" icon={<ICreditUnionLogo />} limit={limits.internal} used={{daily: 0, monthly: 0}} />
            </div>
        </div>
    );
};

export const Security: React.FC<SettingsProps> = ({ 
    advancedTransferLimits,
    onUpdateAdvancedLimits,
    cards,
    onUpdateCardControls,
    verificationLevel, 
    onVerificationComplete,
    securitySettings,
    onUpdateSecuritySettings,
    trustedDevices,
    onRevokeDevice,
    onChangePassword,
    transactions,
    pushNotificationSettings,
    onUpdatePushNotificationSettings,
    userProfile,
    onUpdateProfilePicture,
    privacySettings,
    onUpdatePrivacySettings,
}) => {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const securityScore = useMemo(() => {
    let score = 25; // Base score
    if (securitySettings.mfa.enabled) score += 25;
    if (securitySettings.biometricsEnabled) score += 25;
    
    if (verificationLevel === VerificationLevel.LEVEL_3) {
        score += 25;
    } else if (verificationLevel === VerificationLevel.LEVEL_2) {
        score += 15;
    } else if (verificationLevel === VerificationLevel.LEVEL_1) {
        score += 10;
    }

    return Math.round(score);
  }, [securitySettings, verificationLevel]);

  const handleVerificationModalClose = (level: VerificationLevel) => {
    onVerificationComplete(level);
    setIsVerificationModalOpen(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate network delay
        setTimeout(() => {
          onUpdateProfilePicture(reader.result as string);
          setIsUploading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const TrustedDeviceRow: React.FC<{ device: TrustedDevice }> = ({ device }) => {
    const DeviceIcon = device.deviceType === 'desktop' ? ComputerDesktopIcon : DevicePhoneMobileIcon;
    return (
        <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center first:pt-0 last:pb-0">
            <div className="flex items-start space-x-4">
                <DeviceIcon className="w-6 h-6 text-slate-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="font-medium text-slate-700 flex items-center">{device.browser} {device.isCurrent && <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Current</span>}</p>
                    <p className="text-sm text-slate-500">{device.location} • Last login: {new Date(device.lastLogin).toLocaleDateString()}</p>
                </div>
            </div>
            {!device.isCurrent && (
                <button onClick={() => onRevokeDevice(device.id)} className="mt-2 sm:mt-0 px-3 py-1.5 text-sm font-medium text-red-600 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                    Revoke
                </button>
            )}
        </div>
    );
  };

  const verificationLevelValue = useMemo(() => Object.values(VerificationLevel).indexOf(verificationLevel), [verificationLevel]);

  const kycFeatures = [
      { 
          icon: <ChartBarIcon />, 
          title: "Access to Crypto Trading", 
          description: "Buy, sell, and hold top cryptocurrencies directly within your iCredit Union account.", 
          requiredLevel: VerificationLevel.LEVEL_2, 
          requiredLevelValue: 2,
          imageUrl: 'https://images.unsplash.com/photo-1621452773453-c82736159b3a?q=80&w=2940&auto=format&fit=crop'
      },
      { 
          icon: <ShieldCheckIcon />, 
          title: "Enhanced Fraud Protection Insurance", 
          description: "Advanced insurance coverage for unauthorized transactions on your verified account.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://images.unsplash.com/photo-1585224320412-36c11756a04f?q=80&w=2874&auto=format&fit=crop'
      },
      { 
          icon: <TrendingUpIcon />, 
          title: "Access to High-Value Transactions", 
          description: "Eligibility for increased transfer limits and access to specialized investment products.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop'
      },
      { 
          icon: <EyeIcon />, 
          title: "Dedicated Account Monitoring", 
          description: "Proactive, specialized monitoring of your account activity by our senior security team.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop'
      },
  ];

  const securityCheckupItems = [
    {
        icon: LockClosedIcon,
        title: 'Strong Password',
        description: 'A strong, unique password is your first line of defense.',
        isComplete: true, // Assuming password is always set
        statusText: 'Active',
        actionText: 'Change',
        action: onChangePassword
    },
    {
        icon: DevicePhoneMobileIcon,
        title: 'Two-Factor Authentication',
        description: 'Add a second layer of security for logins and sensitive actions.',
        isComplete: securitySettings.mfa.enabled,
        statusText: securitySettings.mfa.enabled ? `Enabled (${securitySettings.mfa.method?.toUpperCase()})` : 'Not Enabled',
        actionText: securitySettings.mfa.enabled ? 'Manage' : 'Enable',
        action: () => setIs2FAModalOpen(true)
    },
    {
        icon: FingerprintIcon,
        title: 'Biometric Login',
        description: 'Enable Face ID or fingerprint for faster, secure access on this device.',
        isComplete: securitySettings.biometricsEnabled,
        statusText: securitySettings.biometricsEnabled ? 'Enabled' : 'Not Set Up',
        actionText: 'Setup',
        action: () => setIsBiometricsModalOpen(true)
    },
    {
        icon: IdentificationIcon,
        title: 'Identity Verification',
        description: 'Complete verification to unlock higher limits and more features.',
        isComplete: verificationLevel !== VerificationLevel.UNVERIFIED,
        statusText: verificationLevel,
        actionText: 'Verify',
        action: () => setIsVerificationModalOpen(true)
    }
  ];
  
  const kycLevels = Object.values(VerificationLevel).slice(1);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <div className="flex items-center space-x-3">
                <CertificateIcon className="w-8 h-8 text-primary"/>
                <h2 className="text-2xl font-bold text-slate-800">Security Center</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">Manage your account security settings and connected services.</p>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Profile Information</h2></div>
            <div className="p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group flex-shrink-0">
                    <img src={userProfile.profilePictureUrl} alt="Profile" className="w-24 h-24 rounded-full shadow-digital object-cover" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Change profile picture"
                    >
                        {isUploading ? <SpinnerIcon className="w-8 h-8"/> : <CameraIcon className="w-8 h-8"/>}
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{userProfile.name}</h3>
                    <p className="text-slate-500">{userProfile.email}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-200 rounded-2xl shadow-digital p-6">
            <div className="md:col-span-1">
                <SecurityScore score={securityScore} />
            </div>
            <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800">Your Security Score is {securityScore > 80 ? 'Excellent' : securityScore > 60 ? 'Good' : 'Fair'}</h3>
                <p className="text-sm text-slate-600 mt-1">Complete the security checkup items to improve your score and better protect your account.</p>
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Security Checkup</h2></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityCheckupItems.map(item => {
                    const statusColor = item.isComplete ? 'text-green-600' : 'text-yellow-600';
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3 flex flex-col">
                            <div className="flex items-start space-x-3">
                                <Icon className={`w-8 h-8 ${statusColor}`} />
                                <div className="flex-grow">
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                                <div className={`flex items-center text-sm font-semibold ${statusColor}`}>
                                    {item.isComplete ? <CheckCircleIcon className="w-4 h-4 mr-1"/> : <ExclamationTriangleIcon className="w-4 h-4 mr-1"/>}
                                    <span>{item.statusText}</span>
                                </div>
                                 <button onClick={item.action} className="px-3 py-1.5 text-xs font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                                     {item.actionText}
                                 </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        
        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Push Notification Preferences</h2></div>
            <div className="p-6 divide-y divide-slate-300">
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Transactions</h4>
                        <p className="text-sm text-slate-600">Receive alerts for sent, received, and failed transactions.</p>
                    </div>
                    <label htmlFor="transactions-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="transactions-toggle" className="sr-only peer" checked={pushNotificationSettings.transactions} onChange={(e) => onUpdatePushNotificationSettings({ transactions: e.target.checked })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Security Alerts</h4>
                        <p className="text-sm text-slate-600">Get notified about new logins, password changes, and new devices.</p>
                    </div>
                    <label htmlFor="security-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="security-toggle" className="sr-only peer" checked={pushNotificationSettings.security} onChange={(e) => onUpdatePushNotificationSettings({ security: e.target.checked })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Promotions & Offers</h4>
                        <p className="text-sm text-slate-600">Receive updates on new products, features, and special offers.</p>
                    </div>
                    <label htmlFor="promotions-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="promotions-toggle" className="sr-only peer" checked={pushNotificationSettings.promotions} onChange={(e) => onUpdatePushNotificationSettings({ promotions: e.target.checked })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
        
        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Email Notification Preferences</h2></div>
            <div className="p-6 divide-y divide-slate-300">
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Transactions</h4>
                        <p className="text-sm text-slate-600">Receive receipts and transfer updates via email.</p>
                    </div>
                    <label htmlFor="email-transactions-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-transactions-toggle" className="sr-only peer" checked={privacySettings.email.transactions} onChange={(e) => onUpdatePrivacySettings({ email: { ...privacySettings.email, transactions: e.target.checked } })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Security Alerts</h4>
                        <p className="text-sm text-slate-600">Get emailed about new logins, password changes, and new devices.</p>
                    </div>
                    <label htmlFor="email-security-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-security-toggle" className="sr-only peer" checked={privacySettings.email.security} onChange={(e) => onUpdatePrivacySettings({ email: { ...privacySettings.email, security: e.target.checked } })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="py-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-700">Promotions & Offers</h4>
                        <p className="text-sm text-slate-600">Receive email updates on new products, features, and special offers.</p>
                    </div>
                    <label htmlFor="email-promotions-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-promotions-toggle" className="sr-only peer" checked={privacySettings.email.promotions} onChange={(e) => onUpdatePrivacySettings({ email: { ...privacySettings.email, promotions: e.target.checked } })} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>

        <CardSecurityControls cards={cards} onUpdateCardControls={onUpdateCardControls} />
        <AdvancedTransferLimitsDisplay limits={advancedTransferLimits} transactions={transactions} />
        
        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Advanced KYC Features</h2></div>
            <div className="p-6 space-y-4">
                <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                        <span>Verification Progress</span>
                        <span className="font-bold text-primary">{verificationLevel}</span>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-2.5 shadow-digital-inset">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(verificationLevelValue / (Object.values(VerificationLevel).length -1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
                {kycFeatures.map(feature => (
                    <KycFeatureCard 
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        unlocked={verificationLevelValue >= feature.requiredLevelValue}
                        requiredLevel={feature.requiredLevel.split(':')[0]}
                        imageUrl={feature.imageUrl}
                    />
                ))}
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Trusted Devices & Sessions</h2></div>
          <div className="p-6 divide-y divide-slate-300">
             {trustedDevices.map(device => <TrustedDeviceRow key={device.id} device={device} />)}
          </div>
        </div>

      </div>
      {isVerificationModalOpen && (
        <VerificationCenter 
            currentLevel={verificationLevel}
            onClose={handleVerificationModalClose}
        />
      )}
       {is2FAModalOpen && (
          <Setup2FAModal
            onClose={() => setIs2FAModalOpen(false)}
            settings={securitySettings.mfa}
            onUpdate={(mfaUpdate) => onUpdateSecuritySettings({ mfa: { ...securitySettings.mfa, ...mfaUpdate } })}
          />
      )}
      {isBiometricsModalOpen && (
          <SetupBiometricsModal 
            onClose={() => setIsBiometricsModalOpen(false)}
            onEnable={() => onUpdateSecuritySettings({ biometricsEnabled: true })}
          />
      )}
    </>
  );
};