import React, { useState } from 'react';
import { SpinnerIcon, XIcon, ScaleIcon, ShieldCheckIcon } from './Icons';
import { CLEARANCE_CODE } from '../constants';
import { Transaction, Account } from '../types';
import { ExternalPaymentGateway } from './ExternalPaymentGateway';

interface AuthorizationWarningModalProps {
    transaction: Transaction;
    onAuthorize: (transactionId: string, method: 'code' | 'fee') => void;
    onClose: () => void;
    onContactSupport: () => void;
    accounts: Account[];
}

export const AuthorizationWarningModal: React.FC<AuthorizationWarningModalProps> = ({ transaction, onAuthorize, onClose, onContactSupport, accounts }) => {
    const [view, setView] = useState<'warning' | 'payment_gateway'>('warning');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const clearanceFee = transaction.sendAmount * 0.15;
    const sourceAccount = accounts.find(acc => acc.id === transaction.accountId);
    const hasSufficientFundsForFee = sourceAccount ? sourceAccount.balance >= clearanceFee : false;

    const handleSubmitCode = () => {
        setError('');
        if (code.toUpperCase() !== CLEARANCE_CODE) {
            setError('Invalid clearance code. Please review your documentation or contact support.');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            onAuthorize(transaction.id, 'code');
        }, 1000);
    };
    
    const handlePayFeeClick = () => {
        setError('');
        if (!hasSufficientFundsForFee) {
            setError(`Insufficient funds in your '${sourceAccount?.nickname}' account to pay the clearance fee.`);
            return;
        }
        setView('payment_gateway');
    };

    const handlePaymentSuccess = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onAuthorize(transaction.id, 'fee');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in">
            {view === 'warning' ? (
                <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 border border-yellow-500/50 animate-fade-in-up relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                    <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4 ring-8 ring-yellow-500/10">
                            <ScaleIcon className="w-8 h-8 text-yellow-400"/>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-100">Regulatory Compliance Hold</h3>
                        <div className="text-slate-400 mt-2 space-y-3 text-sm">
                            <p>This transaction has been flagged for a mandatory compliance review in accordance with International Monetary Fund (IMF) and Anti-Money Laundering (AML) protocols.</p>
                            <p>To release the funds, please provide the official <strong className="text-slate-200">International Transfer Clearance Code (ITCC)</strong> associated with this transaction.</p>
                        </div>
                    </div>
                    <div className="px-6 space-y-4">
                        <div>
                            <label htmlFor="clearance-code" className="block text-sm font-medium text-slate-300">International Transfer Clearance Code (ITCC)</label>
                            <input 
                                id="clearance-code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="mt-1 w-full bg-slate-900/50 text-white p-3 rounded-md shadow-inner text-center tracking-widest font-mono focus:ring-2 focus:ring-primary"
                                placeholder="Enter code here"
                                autoFocus
                            />
                            {error && !error.includes('fee') && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
                        </div>
                        <button onClick={handleSubmitCode} disabled={isProcessing} className="w-full py-3 text-white bg-primary rounded-lg font-semibold flex items-center justify-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Authorize with Code'}
                        </button>
                    </div>
                    <div className="relative text-center my-4">
                        <span className="absolute left-0 top-1/2 w-full h-px bg-slate-700"></span>
                        <span className="relative bg-slate-800 px-2 text-xs text-slate-400">OR</span>
                    </div>
                    <div className="px-6 space-y-4">
                        <p className="text-sm text-slate-400 text-center">Alternatively, you may expedite this process by paying a non-refundable 15% clearance fee.</p>
                        <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                            <p className="text-sm text-slate-300">Clearance Fee (15%)</p>
                            <p className="text-xl font-bold font-mono text-slate-100">{clearanceFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                        {error && error.includes('fee') && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
                        <button onClick={handlePayFeeClick} disabled={isProcessing || !hasSufficientFundsForFee} className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Pay Fee & Release Funds'}
                        </button>
                        {!hasSufficientFundsForFee && <p className="text-yellow-400 text-xs text-center mt-1">Insufficient funds to pay fee.</p>}
                    </div>
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                        <p>Once cleared, funds will be delivered within 3 business days.</p>
                        <button onClick={onContactSupport} className="text-primary-400 hover:underline">Contact Support to get your ITCC</button>
                    </div>
                </div>
            ) : (
                <ExternalPaymentGateway 
                    amount={clearanceFee}
                    onPaymentSuccess={handlePaymentSuccess}
                    onBack={() => {
                        setError('');
                        setView('warning');
                    }}
                />
            )}
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