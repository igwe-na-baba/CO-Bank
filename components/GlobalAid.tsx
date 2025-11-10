import React, { useState, useEffect } from 'react';
import { Cause, Donation, Account } from '../types';
// FIX: Corrected import to use INITIAL_CAUSES instead of INITIAL_CARDS.
import { INITIAL_CAUSES, USER_PIN } from '../constants';
import { getCauseDetails } from '../services/geminiService';
import * as Icons from './Icons';

// Sub-component: DonationModal
const DonationModal: React.FC<{
    cause: Cause;
    accounts: Account[];
    onClose: () => void;
    onDonate: (causeId: string, amount: number, sourceAccountId: string) => boolean;
}> = ({ cause, accounts, onClose, onDonate }) => {
    const [step, setStep] = useState<'amount' | 'pin' | 'processing' | 'success'>('amount');
    const [amount, setAmount] = useState(25);
    const [customAmount, setCustomAmount] = useState('');
    const [sourceAccountId, setSourceAccountId] = useState(accounts.find(a => a.balance > 0)?.id || '');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleDonateClick = () => {
        const finalAmount = customAmount ? parseFloat(customAmount) : amount;
        const sourceAccount = accounts.find(a => a.id === sourceAccountId);
        if (!sourceAccountId) {
            setError('Please select a source account.');
            return;
        }
        if (!sourceAccount || sourceAccount.balance < finalAmount) {
            setError('Insufficient funds in the selected account.');
            return;
        }
        if (finalAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setError('');
        setStep('pin');
    };
    
    const handleConfirm = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }
        setStep('processing');
        setTimeout(() => {
            const finalAmount = customAmount ? parseFloat(customAmount) : amount;
            const success = onDonate(cause.id, finalAmount, sourceAccountId);
            if (success) {
                setStep('success');
            } else {
                setError('Donation failed. Please try again.');
                setStep('pin');
            }
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 text-center">
                    <Icons.CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="mt-4 text-2xl font-bold text-slate-800">Thank You!</h3>
                    <p className="text-slate-600 mt-2">Your generous donation has been processed successfully.</p>
                    <button onClick={onClose} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                        Done
                    </button>
                </div>
            </div>
        );
    }
    
    if (step === 'processing') {
         return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 text-center">
                    <Icons.SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="mt-4 text-xl font-bold text-slate-800">Processing Donation...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <Icons.XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Donate to {cause.title}</h2>
                
                {step === 'amount' && (
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-slate-600">Select or enter an amount to donate.</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[10, 25, 50, 100, 250, 500].map(val => (
                                <button key={val} onClick={() => { setAmount(val); setCustomAmount(''); }} className={`p-3 font-semibold rounded-md ${amount === val && !customAmount ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                    ${val}
                                </button>
                            ))}
                        </div>
                        <input type="number" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setAmount(0); }} placeholder="Or enter custom amount" className="w-full p-3 rounded-md shadow-digital-inset" />
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From Account</label>
                            <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full mt-1 p-3 rounded-md shadow-digital-inset">
                                {accounts.filter(a => a.balance > 0).map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', {style:'currency', currency:'USD'})})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button onClick={handleDonateClick} className="w-full py-3 mt-4 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Continue
                        </button>
                    </div>
                )}
                
                {step === 'pin' && (
                    <div className="space-y-4 mt-4 text-center">
                        <p className="text-sm text-slate-600">Enter your 4-digit PIN to authorize the donation of <strong>${customAmount || amount}</strong>.</p>
                        <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="w-48 mx-auto p-3 text-center text-3xl tracking-[1em] rounded-md shadow-digital-inset" placeholder="----" autoFocus />
                        {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                         <div className="flex gap-3 pt-4">
                             <button onClick={() => setStep('amount')} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                            <button onClick={handleConfirm} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Confirm Donation</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// Sub-component: CauseCard
const CauseCard: React.FC<{
    cause: Omit<Cause, 'details'>;
    onDonate: (cause: Cause) => void;
}> = ({ cause, onDonate }) => {
    const [details, setDetails] = useState<Cause['details'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const result = await getCauseDetails(cause.title);
            if (!result.isError) {
                setDetails(result.details);
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [cause.title]);

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital flex flex-col overflow-hidden">
            <img src={cause.imageUrl} alt={cause.title} className="w-full h-48 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-800">{cause.title}</h3>
                <p className="text-sm text-slate-600 mt-2 flex-grow">{cause.shortDescription}</p>
                
                {isLoading ? (
                    <div className="mt-4 space-y-2 animate-pulse">
                        <div className="h-4 bg-slate-300 rounded w-full"></div>
                        <div className="h-4 bg-slate-300 rounded w-5/6"></div>
                    </div>
                ) : details ? (
                    <div className="mt-4 pt-4 border-t border-slate-300">
                        <p className="text-sm text-slate-700 mb-2">{details.description}</p>
                        <ul className="space-y-1">
                            {details.impacts.map((impact, i) => (
                                <li key={i} className="flex items-start text-xs text-slate-600">
                                    <Icons.CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span>{impact}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <button onClick={() => onDonate({ ...cause, details: details || undefined })} className="mt-6 w-full py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                    Donate Now
                </button>
            </div>
        </div>
    );
};

// Sub-component: YourImpact
const YourImpact: React.FC<{ donations: Donation[] }> = ({ donations }) => {
    const { totalDonated, level } = React.useMemo(() => {
        const total = donations.reduce((sum, d) => sum + d.amount, 0);
        let level = 'Bronze';
        if (total >= 1000) level = 'Platinum';
        else if (total >= 500) level = 'Gold';
        else if (total >= 100) level = 'Silver';
        return { totalDonated: total, level };
    }, [donations]);

    const levelColors = {
        Bronze: 'text-orange-400',
        Silver: 'text-slate-400',
        Gold: 'text-yellow-400',
        Platinum: 'text-cyan-400',
    };

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6 text-center">
            <h3 className="text-xl font-bold text-slate-800">Your Impact</h3>
            <p className="text-sm text-slate-500 mt-1">Thank you for your generosity!</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-100 p-4 rounded-lg shadow-inner">
                    <p className="text-sm font-semibold text-slate-600">Total Donated</p>
                    <p className="text-3xl font-bold text-primary">{totalDonated.toLocaleString('en-US', {style:'currency', currency:'USD'})}</p>
                </div>
                <div className="bg-slate-100 p-4 rounded-lg shadow-inner">
                    <p className="text-sm font-semibold text-slate-600">Donor Level</p>
                    <div className={`text-3xl font-bold flex items-center justify-center space-x-2 ${levelColors[level as keyof typeof levelColors]}`}>
                        <Icons.TrophyIcon className="w-8 h-8"/>
                        <span>{level}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface GlobalAidProps {
    donations: Donation[];
    onDonate: (causeId: string, amount: number, sourceAccountId: string) => boolean;
    accounts: Account[];
}

export const GlobalAid: React.FC<GlobalAidProps> = ({ donations, onDonate, accounts }) => {
    const [selectedCause, setSelectedCause] = useState<Cause | null>(null);

    return (
        <>
            {selectedCause && (
                <DonationModal 
                    cause={selectedCause}
                    accounts={accounts}
                    onClose={() => setSelectedCause(null)}
                    onDonate={onDonate}
                />
            )}
            <div className="space-y-12">
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-slate-800">Global Aid Initiative</h2>
                    <p className="text-lg text-slate-500 mt-2 max-w-3xl mx-auto">
                        In partnership with the World Health Organization, iCredit Union® empowers you to make a difference. 100% of your donation goes directly to the cause.
                    </p>
                </div>

                <YourImpact donations={donations} />

                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Support a Cause Today</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {INITIAL_CAUSES.map(cause => (
                            <CauseCard key={cause.id} cause={cause} onDonate={setSelectedCause} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};