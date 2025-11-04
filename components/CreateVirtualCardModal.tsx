import React, { useState } from 'react';
import { Card } from '../types';
import { USER_PIN } from '../constants';
import * as Icons from './Icons';

interface CreateVirtualCardModalProps {
    physicalCards: Card[];
    onClose: () => void;
    onAddVirtualCard: (data: { nickname: string; linkedCardId: string; spendingLimit: number | null }) => void;
}

type Step = 'form' | 'pin' | 'success';

export const CreateVirtualCardModal: React.FC<CreateVirtualCardModalProps> = ({ physicalCards, onClose, onAddVirtualCard }) => {
    const [step, setStep] = useState<Step>('form');
    const [nickname, setNickname] = useState('');
    const [linkedCardId, setLinkedCardId] = useState(physicalCards[0]?.id || '');
    const [limit, setLimit] = useState('');
    const [noLimit, setNoLimit] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = () => {
        setError('');
        if (!nickname.trim()) {
            setError('Please give your card a nickname.');
            return;
        }
        if (!noLimit && (parseFloat(limit) <= 0 || !limit)) {
            setError('Please enter a valid spending limit, or select no limit.');
            return;
        }
        setStep('pin');
    };

    const handleConfirm = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            onAddVirtualCard({
                nickname,
                linkedCardId,
                spendingLimit: noLimit ? null : parseFloat(limit)
            });
            setIsProcessing(false);
            setStep('success');
        }, 1500);
    };

    const renderContent = () => {
        switch (step) {
            case 'form':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Card Nickname</label>
                            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g., Online Subscriptions" className="mt-1 w-full p-2 rounded-md shadow-digital-inset" autoFocus />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Link to Physical Card</label>
                            <select value={linkedCardId} onChange={e => setLinkedCardId(e.target.value)} className="mt-1 w-full p-2 rounded-md shadow-digital-inset">
                                {physicalCards.map(card => (
                                    <option key={card.id} value={card.id}>
                                        {card.network} •••• {card.lastFour}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Monthly Spending Limit</label>
                            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="e.g., 50.00" disabled={noLimit} className="mt-1 w-full p-2 rounded-md shadow-digital-inset disabled:bg-slate-300/50" />
                            <label className="flex items-center space-x-2 mt-2 text-sm">
                                <input type="checkbox" checked={noLimit} onChange={e => setNoLimit(e.target.checked)} className="h-4 w-4 rounded" />
                                <span>No Limit</span>
                            </label>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital">Cancel</button>
                            <button onClick={handleNext} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Next</button>
                        </div>
                    </div>
                );
            case 'pin':
                 return (
                    <div className="text-center">
                        <h4 className="font-semibold text-slate-700">Authorize Creation</h4>
                        <p className="text-sm text-slate-600 my-4">Enter your 4-digit PIN to create this virtual card.</p>
                        <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="w-48 mx-auto p-3 text-center text-3xl tracking-[1em] rounded-md shadow-digital-inset" placeholder="----" autoFocus />
                        {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                        <div className="mt-6 flex gap-3">
                             <button onClick={() => setStep('form')} disabled={isProcessing} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                            <button onClick={handleConfirm} disabled={isProcessing || pin.length !== 4} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center disabled:bg-primary/50">
                                {isProcessing ? <Icons.SpinnerIcon className="w-5 h-5"/> : 'Create Card'}
                            </button>
                        </div>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center">
                        <Icons.CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Virtual Card Created!</h3>
                        <p className="text-slate-600 mt-2">Your new card "{nickname}" is ready to use.</p>
                        <button onClick={onClose} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Create a New Virtual Card</h3>
                {renderContent()}
            </div>
        </div>
    );
};