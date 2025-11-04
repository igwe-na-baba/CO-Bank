import React, { useEffect } from 'react';
import { 
    DashboardIcon, SendIcon, UserGroupIcon, ActivityIcon, CogIcon, CreditCardIcon, 
    LifebuoyIcon, CashIcon, QuestionMarkCircleIcon, WalletIcon, ChartBarIcon, 
    ShoppingBagIcon, MapPinIcon, XIcon, ICreditUnionLogo, CubeTransparentIcon,
    ClipboardDocumentIcon, AirplaneTicketIcon, WrenchScrewdriverIcon, PuzzlePieceIcon, SparklesIcon,
    TrendingUpIcon, PlusCircleIcon, MapIcon, LightningBoltIcon, QrCodeIcon, ShieldCheckIcon,
    GlobeAmericasIcon,
    BuildingOfficeIcon,
    ChatBubbleLeftRightIcon,
    // FIX: Added StarIcon to imports to resolve reference error.
    StarIcon,
    HeartIcon
} from './Icons';
import { View, UserProfile } from '../types';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  setActiveView: (view: View) => void;
  userProfile: UserProfile;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
}

const menuConfig: {
    category: string;
    items: {
        view: View;
        label: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}[] = [
    {
        category: 'Core Banking',
        items: [
            { view: 'dashboard', label: 'Dashboard', description: "Your financial overview.", icon: DashboardIcon },
            { view: 'accounts', label: 'Accounts', description: "Manage all your balances.", icon: WalletIcon },
            { view: 'wallet', label: 'Digital Wallet', description: "Instant P2P & online pay.", icon: CreditCardIcon },
            { view: 'send', label: 'Send Money', description: "Instant global transfers.", icon: SendIcon },
            { view: 'wire', label: 'Wire Transfer', description: "Domestic & int'l wires.", icon: GlobeAmericasIcon },
            { view: 'cards', label: 'Cards', description: "Physical & virtual cards.", icon: CreditCardIcon },
        ]
    },
    {
        category: 'Manage',
        items: [
            { view: 'history', label: 'History', description: "View all transactions.", icon: ActivityIcon },
            { view: 'recipients', label: 'Recipients', description: "Saved contacts.", icon: UserGroupIcon },
            { view: 'tasks', label: 'Tasks', description: "Your financial to-do list.", icon: ClipboardDocumentIcon },
            { view: 'integrations', label: 'Integrations', description: "Connect other services.", icon: PuzzlePieceIcon },
        ]
    },
     {
        category: 'Our Network',
        items: [
            { view: 'network', label: 'Global Banking Network', description: "Explore our partner banks.", icon: GlobeAmericasIcon },
        ]
    },
     {
        category: 'Grow',
        items: [
            { view: 'invest', label: 'Invest', description: "Stocks, ETFs, and more.", icon: TrendingUpIcon },
            { view: 'crypto', label: 'Crypto', description: "Trade digital assets.", icon: ChartBarIcon },
            { view: 'loans', label: 'Loans', description: "Personal & auto financing.", icon: CashIcon },
            { view: 'insurance', label: 'Insurance', description: "Protect your assets.", icon: LifebuoyIcon },
        ]
    },
    {
        category: 'Services',
        items: [
            { view: 'quickteller', label: 'Quickteller Hub', description: "Bills, airtime, and more.", icon: LightningBoltIcon },
            { view: 'qrScanner', label: 'QR Scanner', description: 'Scan codes for payments.', icon: QrCodeIcon },
            { view: 'flights', label: 'Book Flights', description: "Travel with your funds.", icon: AirplaneTicketIcon },
            { view: 'utilities', label: 'Pay Utilities', description: "Manage your bills.", icon: WrenchScrewdriverIcon },
            { view: 'services', label: 'Subscriptions', description: "Track recurring payments.", icon: ShoppingBagIcon },
            { view: 'checkin', label: 'Travel Check-In', description: "Use your card abroad.", icon: MapPinIcon },
            { view: 'atmLocator', label: 'ATM Locator', description: "Find nearby ATMs worldwide.", icon: MapIcon },
        ]
    },
     {
        category: 'Community',
        items: [
            { view: 'globalAid', label: 'Global Aid', description: 'Donate to important causes.', icon: HeartIcon },
        ]
    },
    {
        category: 'System',
        items: [
            { view: 'advisor', label: 'AI Advisor', description: "Personalized insights.", icon: SparklesIcon },
            { view: 'support', label: 'Support', description: "Get help & guidance.", icon: QuestionMarkCircleIcon },
            { view: 'security', label: 'Security', description: "Manage account safety.", icon: CogIcon },
            { view: 'privacy', label: 'Privacy Center', description: 'Control your data & settings.', icon: ShieldCheckIcon },
            { view: 'platform', label: 'Platform', description: "Customize your experience.", icon: CubeTransparentIcon },
        ]
    },
    {
        category: 'Company',
        items: [
            { view: 'about', label: 'About Us', description: 'Our mission, team, and values.', icon: BuildingOfficeIcon },
            { view: 'contact', label: 'Contact Us', description: 'Get in touch with our team.', icon: ChatBubbleLeftRightIcon },
            { view: 'ratings', label: 'Ratings & Reviews', description: 'See what our customers say.', icon: StarIcon },
        ]
    }
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, activeView, setActiveView, userProfile, onOpenSendMoneyFlow, onOpenWireTransfer }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleItemClick = (view: View) => {
        if (view === 'send') {
            onOpenSendMoneyFlow('send');
        } else if (view === 'wire') {
            onOpenWireTransfer();
        } else {
            setActiveView(view);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Menu Panel */}
            <div
                className={`fixed inset-y-0 left-0 w-full max-w-md bg-slate-800/95 backdrop-blur-lg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="megamenu-title"
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-white/10">
                        <div className="flex items-center space-x-2">
                            <ICreditUnionLogo />
                            <h2 id="megamenu-title" className="text-xl font-bold text-white">iCredit Union®</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-slate-300 hover:bg-white/10 transition-colors" aria-label="Close menu">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Profile */}
                    <button
                        onClick={() => handleItemClick('security')}
                        className="p-4 border-b border-white/10 flex items-center space-x-3 w-full text-left hover:bg-primary/10 transition-colors group"
                    >
                        <img src={userProfile.profilePictureUrl} alt="User Profile" className="w-12 h-12 rounded-full transition-transform duration-300 group-hover:scale-105" />
                        <div>
                            <p className="font-bold text-white transition-colors duration-300 group-hover:text-primary-300">{userProfile.name}</p>
                            <p className="text-sm text-slate-400">{userProfile.email}</p>
                        </div>
                    </button>

                    {/* Menu Items */}
                    <nav className="flex-grow overflow-y-auto p-4">
                        <ul className="space-y-6">
                            {menuConfig.map(category => (
                                <li key={category.category}>
                                    <h3 className="px-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-wider">{category.category}</h3>
                                    <ul className="space-y-1">
                                        {category.items.map(item => {
                                            const Icon = item.icon;
                                            const isActive = activeView === item.view;
                                            return (
                                                <li key={item.view}>
                                                    <button
                                                        onClick={() => handleItemClick(item.view)}
                                                        className={`w-full group flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${isActive ? 'bg-primary/20 text-primary-300' : 'hover:bg-primary/10 hover:text-primary-300'}`}
                                                    >
                                                        <div className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-primary/80 group-hover:text-white'}`}>
                                                            <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-semibold ${isActive ? 'text-primary-300' : 'text-slate-200 group-hover:text-primary-300'}`}>{item.label}</p>
                                                            <p className="text-xs text-slate-400">{item.description}</p>
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};
