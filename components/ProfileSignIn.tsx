import React from 'react';
import { UserProfile } from '../types';
import { ICreditUnionLogo, MapPinIcon, ClockIcon } from './Icons';
import { timeSince } from '../utils/time';

interface ProfileSignInProps {
  user: UserProfile;
  onEnterDashboard: () => void;
}

export const ProfileSignIn: React.FC<ProfileSignInProps> = ({ user, onEnterDashboard }) => {
  return (
    <div className="min-h-screen bg-slate-800/90 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block p-2 rounded-full bg-slate-700/50 shadow-digital">
            <ICreditUnionLogo />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">iCredit Union®</h1>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-digital p-8 text-center animate-fade-in-up">
            <div className="relative inline-block">
                <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md"
                />
                 <span className="absolute bottom-4 right-1 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-slate-800 shadow-sm" title="Active Session"></span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-left space-y-3 shadow-inner">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Login</p>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <MapPinIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                    <span>{user.lastLogin.from}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <ClockIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                    <span>{timeSince(user.lastLogin.date)} &bull; {user.lastLogin.date.toLocaleDateString()}</span>
                </div>
            </div>

            <button
                onClick={onEnterDashboard}
                className="w-full mt-8 py-3 text-white bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold shadow-md transition-all"
            >
                Enter Dashboard
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};