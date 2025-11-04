import React, { useState } from 'react';
import { AirtimeProvider, AirtimePurchase, Account, View } from '../types';
import { LightningBoltIcon, WifiIcon, TvIcon, PhoneIcon, CheckCircleIcon, SpinnerIcon } from './Icons';
import { validatePhoneNumber } from '../utils/validation';

interface QuicktellerProps {
    airtimeProviders: AirtimeProvider[];
    purchases: AirtimePurchase[];
    accounts: Account[];
    onPurchase: (providerId: string, phoneNumber: string, amount: number, accountId: string) => boolean;
    setActiveView: (view: View) => void;
}

export const Quickteller: React.FC<QuicktellerProps> = ({ airtimeProviders, purchases, accounts, onPurchase, setActiveView }) => {
    const [selectedProvider, setSelectedProvider] = useState<string>(airtimeProviders[0]?.id || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('10');
    const [sourceAccountId, setSourceAccountId] = useState(accounts.find(a => a.balance > 0)?.id || '');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [error, setError] = useState('');

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const phoneError = validatePhoneNumber(phoneNumber);
        if (phoneError) {
            setError(phoneError);
            return;
        }

        setStatus('processing');
        const numericAmount = parseFloat(amount);
        
        if (!numericAmount || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            setStatus('idle');
            return;
        }

        setTimeout(() => {
            const success = onPurchase(selectedProvider, phoneNumber, numericAmount, sourceAccountId);
            if (success) {
                setStatus('success');
                setTimeout(() => {
                    setStatus('idle');
                    setPhoneNumber('');
                    setAmount('10');
                }, 2000);
            } else {
                setError('Purchase failed. Check your balance and try again.');
                setStatus('idle');
            }
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Quickteller Hub</h2>
                <p className="text-sm text-slate-500 mt-1">Your central place for fast payments and top-ups.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button onClick={() => setActiveView('utilities')} className="bg-slate-200 p-6 rounded-2xl shadow-digital text-left hover:shadow-digital-inset transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Pay a Bill</h3>
                            <p className="text-sm text-slate-500 mt-1">Manage electricity, water, gas, and more.</p>
                        </div>
                        <div className="p-3 bg-slate-200 rounded-lg shadow-digital group-hover:shadow-digital-inset">
                             <WifiIcon className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                 </button>
                 <button onClick={() => setActiveView('services')} className="bg-slate-200 p-6 rounded-2xl shadow-digital text-left hover:shadow-digital-inset transition-all group">
                     <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Manage Subscriptions</h3>
                            <p className="text-sm text-slate-500 mt-1">Handle TV, internet, and other recurring payments.</p>
                        </div>
                        <div className="p-3 bg-slate-200 rounded-lg shadow-digital group-hover:shadow-digital-inset">
                             <TvIcon className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                 </button>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300">
                    <h3 className="text-xl font-bold text-slate-800">Airtime Top-up</h3>
                </div>
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center p-8 flex flex-col items-center justify-center">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">Top-up Successful!</h3>
                        </div>
                    ) : (
                        <form onSubmit={handlePurchase} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Provider</label>
                                <div className="flex space-x-4">
                                    {airtimeProviders.map(provider => {
                                        const ProviderIcon = provider.logo;
                                        const isSelected = selectedProvider === provider.id;
                                        return (
                                            <button type="button" key={provider.id} onClick={() => setSelectedProvider(provider.id)} className={`p-4 flex-1 rounded-lg transition-all ${isSelected ? 'shadow-digital-inset' : 'shadow-digital active:shadow-digital-inset'}`}>
                                                <ProviderIcon className="h-8 w-auto mx-auto" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone-number" className="block text-sm font-medium text-slate-700">Phone Number</label>
                                <div className="mt-1 relative rounded-md shadow-digital-inset">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input type="tel" id="phone-number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-transparent border-0 p-3 pl-10" placeholder="(555) 123-4567" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (USD)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['5', '10', '20', '50'].map(val => (
                                        <button type="button" key={val} onClick={() => setAmount(val)} className={`p-3 text-center font-semibold rounded-md transition-all ${amount === val ? 'shadow-digital-inset' : 'shadow-digital active:shadow-digital-inset'}`}>${val}</button>
                                    ))}
                                </div>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" placeholder="Or enter custom amount" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Pay From</label>
                                <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset">
                                    {accounts.filter(a=>a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</option>)}
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={status === 'processing' || !sourceAccountId} className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg disabled:bg-primary-300">
                                {status === 'processing' ? <SpinnerIcon className="w-5 h-5"/> : <LightningBoltIcon className="w-5 h-5" />}
                                <span>{status === 'processing' ? 'Processing...' : 'Purchase Airtime'}</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>

             {purchases.length > 0 && (
                <div className="bg-slate-200 rounded-2xl shadow-digital">
                    <div className="p-6 border-b border-slate-300">
                        <h3 className="text-xl font-bold text-slate-800">Recent Airtime Purchases</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        {purchases.slice(0, 5).map(purchase => {
                            const provider = airtimeProviders.find(p => p.id === purchase.providerId);
                            if (!provider) return null;
                            const ProviderIcon = provider.logo;
                            return (
                                <div key={purchase.id} className="p-3 bg-slate-200 rounded-lg shadow-digital-inset flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 flex items-center justify-center"><ProviderIcon className="h-6 w-auto" /></div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{provider.name} Top-up</p>
                                            <p className="text-xs text-slate-500">{purchase.phoneNumber}</p>
                                        </div>
                                    </div>
                                     <p className="font-semibold text-slate-800 font-mono">{purchase.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
