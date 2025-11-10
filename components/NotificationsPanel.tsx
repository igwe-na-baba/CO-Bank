import React from 'react';
import { Notification, NotificationType, View } from '../types';
import { BellIcon, CheckCircleIcon, CreditCardIcon, ShieldCheckIcon, LifebuoyIcon, CashIcon } from './Icons';
import { timeSince } from '../utils/time';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (view: View) => void;
}

const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
        case NotificationType.TRANSACTION:
            return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
        case NotificationType.CARD:
            return <CreditCardIcon className="w-6 h-6 text-blue-400" />;
        case NotificationType.SECURITY:
            return <ShieldCheckIcon className="w-6 h-6 text-yellow-400" />;
        case NotificationType.INSURANCE:
            return <LifebuoyIcon className="w-6 h-6 text-indigo-400" />;
        case NotificationType.LOAN:
            return <CashIcon className="w-6 h-6 text-teal-400" />;
        default:
            return <BellIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />;
    }
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onNotificationClick }) => {
    
  const handleClick = (notification: Notification) => {
    if (notification.linkTo) {
      onNotificationClick(notification.linkTo);
    }
    onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in-down overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                    <BellIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-2"/>
                    <p>No new notifications</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                    {notifications.map(notification => (
                        <li key={notification.id} className={`transition-colors duration-200 ${notification.read ? '' : 'bg-primary-50 dark:bg-primary-500/10'}`}>
                            <button
                              onClick={() => handleClick(notification)}
                              className="w-full text-left p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/5"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{notification.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{timeSince(notification.timestamp)}</p>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <style>{`
          @keyframes fade-in-down {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.2s ease-out forwards;
          }
        `}</style>
    </div>
  );
};