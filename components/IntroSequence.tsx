import React, { useState } from 'react';
// FIX: Renamed ApexBankLogo to ICreditUnionLogo to fix the import error.
// FIX: Add missing icons
import { ICreditUnionLogo, TrophyIcon, StarIcon, ShieldCheckIcon, ArrowRightIcon } from './Icons';

interface IntroSequenceProps {
    onComplete: () => void;
}

const AwardCard = ({ icon, title, issuer, delay }: { icon: React.ReactNode; title: string; issuer: string; delay: number }) => (
    <div
        className="bg-slate-200 p-6 rounded-2xl shadow-digital text-center animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 mx-auto shadow-digital">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{issuer}</p>
    </div>
);

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'greetings' | 'awards'>('greetings');

    if (step === 'greetings') {
        return (
            <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <div className="animate-fade-in-up">
                    <div className="inline-block p-4 rounded-full shadow-digital mb-6">
                        <ICreditUnionLogo />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight">
                        Welcome to iCredit Union®.
                    </h1>
                    <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
                        Experience the new standard in global finance, built on trust, transparency, and technology.
                    </p>
                    <button
                        onClick={() => setStep('awards')}
                        className="mt-12 inline-flex items-center space-x-3 px-8 py-4 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                    >
                        <span>Discover Why We're Trusted</span>
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'awards') {
        return (
            <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4">
                 <div className="text-center max-w-4xl mx-auto">
                     <div className="animate-fade-in-up">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Award-Winning Security & Innovation
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                            Recognized by industry leaders for our commitment to excellence, security, and customer-first approach.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <AwardCard icon={<TrophyIcon className="w-8 h-8 text-yellow-500" />} title="Best Digital Bank 2024" issuer="Global Finance Magazine" delay={200} />
                        <AwardCard icon={<StarIcon className="w-8 h-8 text-blue-500" />} title="Innovation in Fintech" issuer="Fintech Innovators Forum" delay={400} />
                        <AwardCard icon={<ShieldCheckIcon className="w-8 h-8 text-green-500" />} title="Most Secure Banking App" issuer="Cybersecurity Excellence Awards" delay={600} />
                    </div>
                    
                    <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                        <button
                            onClick={onComplete}
                            className="mt-12 inline-flex items-center space-x-3 px-8 py-4 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                        >
                            <span>Enter Secure Portal</span>
                            <ArrowRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                 </div>
            </div>
        );
    }

    return null;
};