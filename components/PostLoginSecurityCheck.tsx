import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, FingerprintIcon } from './Icons';

const securityChecks = [
    'Verifying Device Integrity...',
    'Cross-referencing Geolocation Data...',
    'Analyzing Login Patterns...',
    'Finalizing Secure Handshake...'
];

export const PostLoginSecurityCheck: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentCheck, setCurrentCheck] = useState(0);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'checking' | 'success'>('checking');

    useEffect(() => {
        const totalDuration = 4500; // Total time for the sequence
        const stepDuration = totalDuration / securityChecks.length;

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return next;
            });
        }, totalDuration / 100);

        // Cycle through messages
        const messageInterval = setInterval(() => {
            setCurrentCheck(prev => Math.min(prev + 1, securityChecks.length - 1));
        }, stepDuration);
        
        // Final transition
        const completionTimer = setTimeout(() => {
            setPhase('success');
            setTimeout(onComplete, 1200); // Wait for success animation to finish
        }, totalDuration);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
            clearTimeout(completionTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-[100] animate-fade-in">
            <div className="relative w-48 h-48 mb-8">
                {/* Fingerprint Scanner */}
                <div className={`absolute inset-0 transition-all duration-500 ${phase === 'success' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                    <FingerprintIcon className="w-full h-full text-primary-400" />
                    <div className="absolute top-1/2 left-1/2 w-3/4 h-3/4 -translate-x-1/2 -translate-y-1/2 border-2 border-primary-500 rounded-full animate-ping opacity-50"></div>
                </div>
                {/* Success Shield */}
                 <div className={`absolute inset-0 transition-all duration-500 ${phase === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`} style={{ transitionDelay: '300ms' }}>
                    <ShieldCheckIcon className="w-full h-full text-green-400" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 transition-opacity duration-300" key={currentCheck}>
                {phase === 'success' ? 'Security Confirmed' : securityChecks[currentCheck]}
            </h2>
            
            <div className="w-full max-w-md mt-6">
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div
                        className="bg-gradient-to-r from-primary-500 to-primary-400 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
             `}</style>
        </div>
    );
};