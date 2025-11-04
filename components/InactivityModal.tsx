import React, { useEffect, useState } from 'react';

interface InactivityModalProps {
  onStayLoggedIn: () => void;
  onLogout: () => void;
  countdownStart: number;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({ onStayLoggedIn, onLogout, countdownStart }) => {
  const [countdown, setCountdown] = useState(countdownStart);

  useEffect(() => {
    if (countdown <= 0) {
      onLogout();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onLogout]);

  const circumference = 2 * Math.PI * 48; // r="48"
  const progress = countdown / countdownStart;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 transform animate-fade-in-up">
        <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="48" fill="none" strokeWidth="10" className="text-slate-300" />
                    <circle
                        cx="55"
                        cy="55"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-yellow-500"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800">{countdown}</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Are you still there?</h2>
            <p className="text-slate-600 my-4">
                For your security, you will be automatically logged out due to inactivity.
            </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
            <button
                onClick={onStayLoggedIn}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-lg text-sm font-medium text-white bg-primary shadow-md hover:shadow-lg"
            >
                Stay Logged In
            </button>
        </div>
        <style>{`
          @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};