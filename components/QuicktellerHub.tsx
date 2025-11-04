import React from 'react';
import { View } from '../types';
import { ArrowsRightLeftIcon, CurrencyDollarIcon, DevicePhoneMobileIcon, QrCodeIcon, CameraIcon, MapPinIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuicktellerHubProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
}

const ActionButton: React.FC<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-2xl shadow-digital text-slate-200 transition-all duration-300 hover:bg-slate-700 active:shadow-digital-inset hover:-translate-y-1"
        >
            <div className="p-4 bg-slate-800/50 rounded-full shadow-inner mb-3 transition-colors duration-300 group-hover:bg-primary/20">
                {icon}
            </div>
            <h4 className="font-semibold text-center text-sm">{title}</h4>
        </button>
    );
};


export const QuicktellerHub: React.FC<QuicktellerHubProps> = ({ setActiveView, onOpenSendMoneyFlow }) => {
    const { t } = useLanguage();

    const actions = [
        {
            title: t('quick_actions_send_money'),
            icon: <ArrowsRightLeftIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => onOpenSendMoneyFlow('send'),
        },
        {
            title: t('quick_actions_pay_bills'),
            icon: <CurrencyDollarIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => setActiveView('utilities'),
        },
        {
            title: t('quick_actions_buy_airtime'),
            icon: <DevicePhoneMobileIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => setActiveView('quickteller'),
        },
        {
            title: t('quick_actions_scan_to_pay'),
            icon: <QrCodeIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => setActiveView('qrScanner'),
        },
        {
            title: t('quick_actions_deposit_check'),
            icon: <CameraIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => onOpenSendMoneyFlow('deposit'),
        },
        {
            title: t('quick_actions_find_atm'),
            icon: <MapPinIcon className="w-8 h-8 text-primary-400" />,
            onClick: () => setActiveView('atmLocator'),
        }
    ];

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 shadow-digital">
            <h3 className="text-2xl font-bold text-slate-100 mb-4">{t('dashboard_quick_actions')}</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {actions.map(action => (
                    <ActionButton
                        key={action.title}
                        title={action.title}
                        icon={action.icon}
                        onClick={action.onClick}
                    />
                ))}
            </div>
        </div>
    );
};