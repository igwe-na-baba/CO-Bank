import React, { useState } from 'react';
import { Card, SpendingCategory, SPENDING_CATEGORIES } from '../types';
import { XIcon, SpinnerIcon } from './Icons';

interface AdvancedCardControlsModalProps {
    card: Card;
    onClose: () => void;
    onSave: (updatedControls: Partial<Card['controls']>) => void;
}

export const AdvancedCardControlsModal: React.FC<AdvancedCardControlsModalProps> = ({ card, onClose, onSave }) => {
    const [limits, setLimits] = useState({
        perTransaction: card.controls.transactionLimits?.perTransaction ?? '',
        daily: card.controls.transactionLimits?.daily ?? '',
    });
    const [blocked, setBlocked] = useState<Set<SpendingCategory>>(new Set(card.controls.blockedCategories ?? []));
    const [isProcessing, setIsProcessing] = useState(false);

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLimits(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = (category: SpendingCategory) => {
        setBlocked(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const updatedControls: Partial<Card['controls']> = {
                transactionLimits: {
                    perTransaction: limits.perTransaction ? Number(limits.perTransaction) : null,
                    daily: limits.daily ? Number(limits.daily) : null,
                },
                blockedCategories: Array.from(blocked),
            };
            onSave(updatedControls);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Advanced Card Controls</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Transaction Limits (USD)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Per Transaction</label>
                                <input type="number" name="perTransaction" value={limits.perTransaction} onChange={handleLimitChange} placeholder="No limit" className="mt-1 w-full p-2 rounded-md shadow-digital-inset" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600">Daily Total</label>
                                <input type="number" name="daily" value={limits.daily} onChange={handleLimitChange} placeholder="No limit" className="mt-1 w-full p-2 rounded-md shadow-digital-inset" />
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Blocked Spending Categories</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {SPENDING_CATEGORIES.map(category => (
                                <label key={category} className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${blocked.has(category) ? 'bg-red-100 text-red-800' : 'bg-slate-200'}`}>
                                    <input type="checkbox" checked={blocked.has(category)} onChange={() => handleCategoryToggle(category)} className="h-4 w-4 rounded text-primary focus:ring-primary" />
                                    <span className="text-sm font-medium">{category}</span>
                                </label>
                           ))}
                        </div>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md flex items-center">
                        {isProcessing && <SpinnerIcon className="w-5 h-5 mr-2" />}
                        Save Controls
                    </button>
                </div>
                <button onClick={onClose} disabled={isProcessing} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
            </div>
        </div>
    );
};
