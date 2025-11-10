import React from 'react';
import { UserProfile } from '../types';
// FIX: Renamed ApexBankLogo to ICreditUnionLogo to fix the import error.
import { ICreditUnionLogo, MapPinIcon, ClockIcon } from './Icons';
import { timeSince } from '../utils/time';

// FIX: Define the LoggedOutProps interface.
interface LoggedOutProps {
  user: UserProfile;
  onLogin: () => void;
  onSwitchUser: () => void;
}

export const LoggedOut: React.FC<LoggedOutProps> = ({ user, onLogin, onSwitchUser }) => {
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
          <img
            src={user.profilePictureUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md"
          />
          <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
          
          <button
            onClick={onLogin}
            className="w-full mt-6 py-3 text-white bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold shadow-md transition-all"
          >
            Sign In as {user.name.split(' ')[0]}
          </button>
          
          <div className="mt-4 text-center text-sm">
            <button onClick={onSwitchUser} className="font-medium text-primary-400 hover:underline">
                Not you? Sign in with a different account.
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};