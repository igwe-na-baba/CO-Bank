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
    bgImage: string;
    onClick: () => void;
}> = ({ title, icon, bgImage, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative h-40 rounded-2xl text-white overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 animate-card-zoom"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            <div className="relative h-full flex flex-col items-center justify-center p-4 z-20 text-center">
                <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {icon}
                </div>
                <h4 className="font-bold text-lg leading-tight">{title}</h4>
            </div>
        </button>
    );
};


export const QuicktellerHub: React.FC<QuicktellerHubProps> = ({ setActiveView, onOpenSendMoneyFlow }) => {
    const { t } = useLanguage();

    const actions = [
        {
            title: t('quick_actions_send_money'),
            icon: <ArrowsRightLeftIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1639755294951-54117c2a5247?q=80&w=2832&auto=format&fit=crop',
            onClick: () => onOpenSendMoneyFlow('send'),
        },
        {
            title: t('quick_actions_pay_bills'),
            icon: <CurrencyDollarIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2940&auto=format&fit=crop',
            onClick: () => setActiveView('utilities'),
        },
        {
            title: t('quick_actions_buy_airtime'),
            icon: <DevicePhoneMobileIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1604799321304-23986835691c?q=80&w=2874&auto=format&fit=crop',
            onClick: () => setActiveView('quickteller'),
        },
        {
            title: t('quick_actions_scan_to_pay'),
            icon: <QrCodeIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1588196749107-1a71a9953488?q=80&w=2942&auto=format&fit=crop',
            onClick: () => setActiveView('qrScanner'),
        },
        {
            title: t('quick_actions_deposit_check'),
            icon: <CameraIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1584433323048-8424070a25b3?q=80&w=2940&auto=format&fit=crop',
            onClick: () => onOpenSendMoneyFlow('deposit'),
        },
        {
            title: t('quick_actions_find_atm'),
            icon: <MapPinIcon className="w-10 h-10 text-primary-300" />,
            bgImage: 'https://images.unsplash.com/photo-1579226922377-6c3123253572?q=80&w=2788&auto=format&fit=crop',
            onClick: () => setActiveView('atmLocator'),
        }
    ];

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 shadow-digital">
            <h3 className="text-2xl font-bold text-slate-100 mb-4">{t('dashboard_quick_actions')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {actions.map(action => (
                    <ActionButton
                        key={action.title}
                        title={action.title}
                        icon={action.icon}
                        bgImage={action.bgImage}
                        onClick={action.onClick}
                    />
                ))}
            </div>
        </div>
    );
};