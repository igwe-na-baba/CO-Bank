import React, { useState, useEffect } from 'react';
import { SpinnerIcon, BankIcon, CheckCircleIcon, ShieldCheckIcon, LockClosedIcon } from './Icons';
import { BANKS_BY_COUNTRY } from '../constants';

interface LinkBankAccountModalProps {
  onClose: () => void;
  onLinkSuccess: (bankName: string, accountName: string, lastFour: string) => void;
}

type Step = 'select_bank' | 'credentials' | 'select_account' | 'processing' | 'success';

// FIX: Correctly map the bank objects to extract just the name, resolving type errors.
const mockBanks = BANKS_BY_COUNTRY.US.map(bank => ({ name: bank.name }));
const mockAccounts = {
    'Chase Bank': [{ name: 'College Checking', lastFour: '1234', balance: 5432.10 }, { name: 'Total Savings', lastFour: '5678', balance: 25109.42 }],
    'Bank of America': [{ name: 'Advantage Plus Banking', lastFour: '9876', balance: 12345.67 }],
    'Wells Fargo': [{ name: 'Everyday Checking', lastFour: '5432', balance: 8765.43 }, { name: 'Way2Save Savings', lastFour: '2109', balance: 50231.00 }],
    'Citibank': [{ name: 'Basic Banking Account', lastFour: '1111', balance: 3456.78 }],
    'PNC Bank': [{ name: 'Virtual Wallet', lastFour: '2222', balance: 7890.12 }],
};

export const LinkBankAccountModal: React.FC<LinkBankAccountModalProps> = ({ onClose, onLinkSuccess }) => {
    const [step, setStep] = useState<Step>('select_bank');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [processingMessage, setProcessingMessage] = useState('Securely connecting...');

    useEffect(() => {
        let interval: number;
        if (step === 'processing' && selectedBank) {
            const messages = [
                `Connecting to ${selectedBank}...`,
                'Encrypting credentials...',
                'Fetching accounts...',
                'Finalizing secure link...'
            ];
            let messageIndex = 0;
            setProcessingMessage(messages[0]);
            
            interval = window.setInterval(() => {
                messageIndex++;
                if (messageIndex < messages.length) {
                    setProcessingMessage(messages[messageIndex]);
                } else {
                    clearInterval(interval);
                }
            }, 900);
        }
        return () => clearInterval(interval);
    }, [step, selectedBank]);


    const handleBankSelect = (bankName: string) => {
        setSelectedBank(bankName);
        setStep('credentials');
    };

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');
        setTimeout(() => setStep('select_account'), 2500); // Simulate API call to fetch accounts
    };

    const handleAccountSelect = () => {
        if (!selectedBank || !selectedAccount) return;
        const accountInfo = selectedAccount.split('-'); // Format: "Account Name-1234"
        setStep('processing');
        // Simulate final linking process
        setTimeout(() => {
            setStep('success'); // Show success message first
            setTimeout(() => {
                // Then call the parent handler to update state and close modal
                onLinkSuccess(selectedBank, accountInfo[0].trim(), accountInfo[1].trim());
            }, 2000); // Show success message for 2 seconds
        }, 2500);
    };

    const renderContent = () => {
        switch (step) {
            case 'select_bank':
                return <>
                    <p className="text-sm text-slate-600 mb-4">Select your bank from the list below. We use a secure connection to link your account.</p>
                    <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                        {mockBanks.map(bank => (
                            <button key={bank.name} onClick={() => handleBankSelect(bank.name)} className="flex items-center space-x-3 p-4 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                                <BankIcon className="w-6 h-6 text-primary"/>
                                <span className="font-semibold text-slate-700">{bank.name}</span>
                            </button>
                        ))}
                    </div>
                </>;
            case 'credentials':
                return <>
                    <p className="text-sm text-slate-600 mb-4">Enter your credentials for {selectedBank}. Your information is encrypted and will not be stored.</p>
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                        <input type="text" placeholder="Username" className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" defaultValue="demo_user" />
                        <input type="password" placeholder="Password" className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" defaultValue="demopass" />
                        <button type="submit" className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Submit</button>
                    </form>
                </>;
            case 'select_account':
                 const accountsForBank = mockAccounts[selectedBank as keyof typeof mockAccounts] || [];
                return <>
                    <p className="text-sm text-slate-600 mb-4">Choose an account to link from {selectedBank}.</p>
                    <div className="space-y-3">
                        {accountsForBank.map(acc => (
                            <label key={acc.lastFour} className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all ${selectedAccount === `${acc.name}-${acc.lastFour}` ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                <div>
                                    <p className="font-semibold text-slate-800">{acc.name}</p>
                                    <p className="text-sm text-slate-500">**** {acc.lastFour}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-semibold text-slate-700">{acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    <input type="radio" name="account" value={`${acc.name}-${acc.lastFour}`} onChange={e => setSelectedAccount(e.target.value)} className="form-radio h-4 w-4 text-primary" />
                                </div>
                            </label>
                        ))}
                    </div>
                    <button onClick={handleAccountSelect} disabled={!selectedAccount} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">Link Account</button>
                </>;
            case 'processing':
                return <div className="text-center p-8">
                    <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                    <p className="mt-4 font-semibold text-slate-700 transition-opacity duration-300" key={processingMessage}>{processingMessage}</p>
                </div>;
            case 'success':
                return <div className="text-center p-8 animate-fade-in-up">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="mt-4 text-2xl font-bold text-slate-800">Account Linked!</h3>
                    <p className="text-sm text-slate-600">You can now use this account as a funding source.</p>
                </div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        <LockClosedIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Link a New Account</h2>
                </div>
                {renderContent()}
                <button onClick={onClose} disabled={step === 'processing' || step === 'success'} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};