import React, { useState, useEffect, useRef } from 'react';
import { 
    MenuIcon, LogoutIcon, BellIcon, CogIcon, QuestionMarkCircleIcon, GlobeAmericasIcon
} from './Icons';
import { Notification, View, UserProfile } from '../types';
import { MegaMenu } from './MegaMenu';
import { NotificationsPanel } from './NotificationsPanel';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onNotificationClick: (view: View) => void;
  userProfile: UserProfile;
  onOpenLanguageSelector: () => void;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, activeView, setActiveView, onLogout, notifications, onMarkNotificationsAsRead, onNotificationClick, userProfile, onOpenLanguageSelector, onOpenSendMoneyFlow, onOpenWireTransfer }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
      setShowNotifications(prev => !prev);
      if (!showNotifications) {
          onMarkNotificationsAsRead();
      }
  }

  const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  }

  useOutsideAlerter(notificationsRef, () => setShowNotifications(false));

  return (
    <>
      <header className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Left side: Menu and Title */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuToggle}
                        className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white hidden sm:block">{t(`header_title_${activeView}`)}</h1>
                </div>
                
                {/* Right side actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onOpenLanguageSelector}
                        className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Select language"
                    >
                        <GlobeAmericasIcon className="w-6 h-6" />
                    </button>
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={toggleNotifications}
                            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="View notifications"
                        >
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onNotificationClick={onNotificationClick} />}
                    </div>
                     <button
                        onClick={onLogout}
                        className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Logout"
                    >
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveView('security')} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" aria-label="Open security settings">
                        <img src={userProfile.profilePictureUrl} alt="User Profile" className="w-10 h-10 rounded-full" />
                    </button>
                </div>
            </div>
        </div>
      </header>
      <MegaMenu
        isOpen={isMenuOpen}
        onClose={onMenuToggle}
        activeView={activeView}
        setActiveView={setActiveView}
        userProfile={userProfile}
        onOpenSendMoneyFlow={onOpenSendMoneyFlow}
        onOpenWireTransfer={onOpenWireTransfer}
      />
    </>
  );
};