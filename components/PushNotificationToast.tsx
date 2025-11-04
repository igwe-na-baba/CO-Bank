import React, { useEffect } from 'react';
import { PushNotification } from '../types';
import { ICreditUnionLogo, XIcon } from './Icons';

interface PushNotificationToastProps {
  notification: PushNotification;
  onClose: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-4 z-[100] animate-slide-in-out cursor-pointer"
        role="alert"
        onClick={onClose}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 pt-0.5">
            <ICreditUnionLogo />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-100">{notification.title}</p>
            <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slide-in-out {
          0% { transform: translate(-50%, -150%); opacity: 0; }
          10% { transform: translate(-50%, 0); opacity: 1; }
          90% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -150%); opacity: 0; }
        }
        .animate-slide-in-out {
          animation: slide-in-out 5s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};